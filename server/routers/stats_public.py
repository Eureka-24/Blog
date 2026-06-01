"""
公开统计接口（无需认证）
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Visit, Like, ReadingDuration
from schemas import PageStats, HotArticle, HotArticlesResponse

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
