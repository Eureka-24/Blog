"""
公开统计接口（无需认证）
"""
import json
import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Visit, Like, ReadingDuration
from schemas import PageStats, HotArticle, HotArticlesResponse, RelatedArticle, RelatedArticlesResponse

router = APIRouter(prefix="/api/v1/stats", tags=["stats_public"])


@router.get("/page", response_model=PageStats)
def get_page_stats(
    path: str = Query(..., description="页面路径"),
    db: Session = Depends(get_db),
):
    """获取单页统计数据"""
    # PV: 总访问次数
    pv = db.query(func.count(Visit.id)).filter(Visit.path == path).scalar() or 0

    # UV: 按 session_id 去重
    uv_subquery = db.query(Visit.session_id).filter(Visit.path == path).distinct().subquery()
    uv = db.query(func.count(uv_subquery.c.session_id)).scalar() or 0

    # 点赞数
    like_count = db.query(func.count(Like.id)).filter(Like.path == path).scalar() or 0

    # 平均阅读时长
    avg_duration = (
        db.query(func.avg(ReadingDuration.duration_seconds))
        .filter(ReadingDuration.path == path)
        .scalar()
    ) or 0.0

    return PageStats(
        path=path,
        pv=pv,
        uv=uv,
        likeCount=like_count,
        avgDuration=round(float(avg_duration), 1),
    )


@router.get("/hot", response_model=HotArticlesResponse)
def get_hot_articles(
    limit: int = Query(10, description="返回条数"),
    period: str = Query("7d", description="时间范围: 1d/7d/30d/all"),
    db: Session = Depends(get_db),
):
    """获取热门文章排行"""
    # 计算时间范围
    now = datetime.now()
    if period == "1d":
        since = now - timedelta(days=1)
    elif period == "7d":
        since = now - timedelta(days=7)
    elif period == "30d":
        since = now - timedelta(days=30)
    else:
        since = None  # 全部

    # 按 path 分组统计 PV
    query = db.query(
        Visit.path,
        func.count(Visit.id).label("pv"),
    )

    if since:
        query = query.filter(Visit.created_at >= since)

    results = query.group_by(Visit.path).order_by(func.count(Visit.id).desc()).limit(limit).all()

    items = []
    for row in results:
        # 获取点赞数
        like_count = (
            db.query(func.count(Like.id)).filter(Like.path == row.path).scalar() or 0
        )
        # 获取平均阅读时长
        avg_duration = (
            db.query(func.avg(ReadingDuration.duration_seconds))
            .filter(ReadingDuration.path == row.path)
            .scalar()
        ) or 0.0

        items.append(HotArticle(
            path=row.path,
            pv=row.pv,
            likeCount=like_count,
            avgDuration=round(float(avg_duration), 1),
        ))

    return HotArticlesResponse(items=items)


# ─── 辅助函数：加载 stats.json ───

def _load_stats_json() -> dict:
    """加载构建时生成的 stats.json（包含 pathTagsMap）

    兼容两种目录结构：
    - 本地开发:  server/../docs/public/data/stats.json
    - 服务器部署: server/../data/stats.json（dist 中 data/ 在根目录）
    """
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # server/
    candidates = [
        os.path.join(base, "..", "data", "stats.json"),           # 服务器部署
        os.path.join(base, "..", "docs", "public", "data", "stats.json"),  # 本地开发
    ]
    for path in candidates:
        normalized = os.path.normpath(path)
        if os.path.exists(normalized):
            with open(normalized, "r", encoding="utf-8") as f:
                return json.load(f)
    print(f"Warning: stats.json not found at any candidate path: {candidates}")
    return {}


def _load_path_title_map() -> dict:
    return _load_stats_json().get("pathTitleMap", {})


def _load_path_tags_map() -> dict:
    return _load_stats_json().get("pathTagsMap", {})


@router.get("/related", response_model=RelatedArticlesResponse)
def get_related_articles(
    path: str = Query(..., description="当前文章路径"),
    limit: int = Query(5, description="返回条数"),
    db: Session = Depends(get_db),
):
    """基于标签关联推荐相关文章

    算法：找出与当前文章共享标签最多的其他文章，按匹配度排序，
    匹配相同时按 PV 降序排列。
    """
    path_tags_map = _load_path_tags_map()
    path_title_map = _load_path_title_map()

    # 规范路径：URL 解码 + 去掉 .html 后缀以匹配 stats.json 中的键
    from urllib.parse import unquote
    clean_path = unquote(path).replace(".html", "")

    # 当前文章的标签
    current_tags = set(path_tags_map.get(clean_path, []))
    if not current_tags:
        return RelatedArticlesResponse(items=[])

    # 计算其他文章的标签重叠度
    candidates: list[tuple[str, int]] = []
    for other_path, tags in path_tags_map.items():
        if other_path == clean_path:
            continue
        overlap = len(current_tags & set(tags))
        if overlap > 0:
            candidates.append((other_path, overlap))

    # 按重叠度降序，重叠相同时按 PV 降序
    candidates.sort(key=lambda x: (-x[1]))

    # 取 top N
    top_paths = [c[0] for c in candidates[:limit]]

    # 补充统计数据
    items = []
    for p in top_paths:
        try:
            pv = db.query(func.count(Visit.id)).filter(Visit.path == p).scalar() or 0
            avg_dur = (
                db.query(func.avg(ReadingDuration.duration_seconds))
                .filter(ReadingDuration.path == p)
                .scalar()
            ) or 0.0
        except Exception:
            pv = 0
            avg_dur = 0.0

        clean_p = unquote(p).replace(".html", "")
        title = path_title_map.get(clean_p, clean_p.split("/")[-1])
        tags = path_tags_map.get(clean_p, [])

        items.append(RelatedArticle(
            path=clean_p,
            title=title,
            tags=tags,
            matchScore=len(current_tags & set(tags)),
            pv=pv,
            avgDuration=round(float(avg_dur), 1),
        ))

    # 按匹配度 + PV 二次排序
    items.sort(key=lambda x: (-x.matchScore, -x.pv))

    return RelatedArticlesResponse(items=items)
