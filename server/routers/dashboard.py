"""
站长看板接口（需 JWT 认证）
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Visit, Like, ReadingDuration
from schemas import (
    OverviewResponse, TrendResponse, TrendItem,
    PageStatsResponse, PageStatsItem,
    SourcesResponse, SourceItem,
    DevicesResponse, DeviceOS, DeviceBrowser,
    GeoResponse, GeoItem,
    GeoCityResponse, GeoCityItem,
    QualityScoreResponse, QualityScoreItem,
)
from auth import verify_token

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"], dependencies=[Depends(verify_token)])


@router.get("/overview", response_model=OverviewResponse)
def get_overview(db: Session = Depends(get_db)):
    """总览数据"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    five_min_ago = now - timedelta(minutes=5)

    # 总 PV
    total_pv = db.query(func.count(Visit.id)).scalar() or 0

    # 今日 PV
    today_pv = db.query(func.count(Visit.id)).filter(Visit.created_at >= today_start).scalar() or 0

    # 总 UV（按 session_id 去重）
    total_uv_subq = db.query(Visit.session_id).distinct().subquery()
    total_uv = db.query(func.count(total_uv_subq.c.session_id)).scalar() or 0

    # 今日 UV
    today_uv_subq = db.query(Visit.session_id).filter(Visit.created_at >= today_start).distinct().subquery()
    today_uv = db.query(func.count(today_uv_subq.c.session_id)).scalar() or 0

    # 实时在线（最近 5 分钟活跃 session 数）
    online_subq = db.query(Visit.session_id).filter(Visit.created_at >= five_min_ago).distinct().subquery()
    online_now = db.query(func.count(online_subq.c.session_id)).scalar() or 0

    return OverviewResponse(
        totalPv=total_pv,
        todayPv=today_pv,
        totalUv=total_uv,
        todayUv=today_uv,
        onlineNow=online_now,
        articleCount=0,
        totalWords=0,
        siteAgeDays=0,
        lastUpdated=now.strftime("%Y-%m-%d"),
    )


@router.get("/trend", response_model=TrendResponse)
def get_trend(
    days: int = Query(30, description="天数"),
    db: Session = Depends(get_db),
):
    """每日趋势"""
    since = datetime.now() - timedelta(days=days)

    results = (
        db.query(
            func.date(Visit.created_at).label("date"),
            func.count(Visit.id).label("pv"),
            func.count(func.distinct(Visit.session_id)).label("uv"),
        )
        .filter(Visit.created_at >= since)
        .group_by(func.date(Visit.created_at))
        .order_by(func.date(Visit.created_at))
        .all()
    )

    items = [TrendItem(date=row.date, pv=row.pv, uv=row.uv) for row in results]

    return TrendResponse(items=items)


@router.get("/pages", response_model=PageStatsResponse)
def get_pages(
    sort: str = Query("pv", description="排序字段: pv/uv/likes/duration"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """页面排行"""
    # 获取所有有访问记录的页面
    subq = (
        db.query(
            Visit.path,
            func.count(Visit.id).label("pv"),
            func.count(func.distinct(Visit.session_id)).label("uv"),
        )
        .filter(~Visit.path.in_(["/", "/index", "/dashboard", "/personal"]))
        .filter(~Visit.path.startswith("/@pages/"))
        .group_by(Visit.path)
        .subquery()
    )

    # 确定排序
    order_map = {
        "pv": subq.c.pv.desc(),
        "uv": subq.c.uv.desc(),
    }
    order_by = order_map.get(sort, subq.c.pv.desc())

    # 总数
    total = db.query(func.count(subq.c.path)).scalar() or 0

    # 分页
    offset = (page - 1) * size
    rows = db.query(subq).order_by(order_by).offset(offset).limit(size).all()

    items = []
    for row in rows:
        like_count = db.query(func.count(Like.id)).filter(Like.path == row.path).scalar() or 0
        avg_duration = (
            db.query(func.avg(ReadingDuration.duration_seconds))
            .filter(ReadingDuration.path == row.path)
            .scalar()
        ) or 0.0

        items.append(PageStatsItem(
            path=row.path,
            pv=row.pv,
            uv=row.uv,
            likeCount=like_count,
            avgDuration=round(float(avg_duration), 1),
        ))

    return PageStatsResponse(items=items, total=total, page=page, size=size)


@router.get("/sources", response_model=SourcesResponse)
def get_sources(
    days: int = Query(7, description="天数"),
    db: Session = Depends(get_db),
):
    """流量来源分布"""
    since = datetime.now() - timedelta(days=days)

    rows = (
        db.query(Visit.referer, func.count(Visit.id).label("pv"))
        .filter(Visit.created_at >= since)
        .group_by(Visit.referer)
        .order_by(func.count(Visit.id).desc())
        .all()
    )

    # 归类来源
    source_map: dict[str, int] = {}
    for row in rows:
        ref = row.referer or ""
        if not ref:
            source = "直接访问"
        elif "google" in ref.lower():
            source = "Google"
        elif "bing" in ref.lower():
            source = "Bing"
        elif "baidu" in ref.lower():
            source = "百度"
        elif "github" in ref.lower():
            source = "GitHub"
        else:
            source = "其他"
        source_map[source] = source_map.get(source, 0) + row.pv

    total = sum(source_map.values()) or 1
    items = [
        SourceItem(source=src, pv=pv, percentage=round(pv / total * 100, 1))
        for src, pv in source_map.items()
    ]
    items.sort(key=lambda x: x.pv, reverse=True)

    return SourcesResponse(items=items)


@router.get("/devices", response_model=DevicesResponse)
def get_devices(
    days: int = Query(7, description="天数"),
    db: Session = Depends(get_db),
):
    """设备/浏览器分布"""
    since = datetime.now() - timedelta(days=days)

    # OS 分布
    os_rows = (
        db.query(Visit.os, func.count(Visit.id).label("pv"))
        .filter(Visit.created_at >= since, Visit.os.isnot(None))
        .group_by(Visit.os)
        .order_by(func.count(Visit.id).desc())
        .all()
    )
    os_total = sum(r.pv for r in os_rows) or 1
    os_list = [
        DeviceOS(name=row.os or "Unknown", pv=row.pv, percentage=round(row.pv / os_total * 100, 1))
        for row in os_rows
    ]

    # 浏览器分布
    br_rows = (
        db.query(Visit.browser, func.count(Visit.id).label("pv"))
        .filter(Visit.created_at >= since, Visit.browser.isnot(None))
        .group_by(Visit.browser)
        .order_by(func.count(Visit.id).desc())
        .all()
    )
    br_total = sum(r.pv for r in br_rows) or 1
    br_list = [
        DeviceBrowser(name=row.browser or "Unknown", pv=row.pv, percentage=round(row.pv / br_total * 100, 1))
        for row in br_rows
    ]

    return DevicesResponse(os=os_list, browsers=br_list)


@router.get("/geo", response_model=GeoResponse)
def get_geo(
    days: int = Query(30, description="天数"),
    db: Session = Depends(get_db),
):
    """访客地域分布"""
    since = datetime.now() - timedelta(days=days)

    rows = (
        db.query(Visit.country, func.count(Visit.id).label("pv"))
        .filter(Visit.created_at >= since, Visit.country.isnot(None))
        .group_by(Visit.country)
        .order_by(func.count(Visit.id).desc())
        .all()
    )

    total = sum(r.pv for r in rows) or 1
    items = [
        GeoItem(country=row.country or "未知", pv=row.pv, percentage=round(row.pv / total * 100, 1))
        for row in rows
    ]

    return GeoResponse(items=items)


@router.get("/quality-scores", response_model=QualityScoreResponse)
def get_quality_scores(
    sort: str = Query("score", description="排序字段: score/pv/duration/likes/bounce"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """文章质量评分排行

    评分算法: score = pv_norm*0.25 + duration_norm*0.35 + (1-bounce_rate)*0.25 + likes_norm*0.15
    """
    # 获取所有有访问记录的页面及其基础指标
    subq = (
        db.query(
            Visit.path,
            func.count(Visit.id).label("pv"),
            func.count(func.distinct(Visit.session_id)).label("sessions"),
        )
        .filter(~Visit.path.in_(["/", "/index", "/dashboard", "/personal"]))
        .filter(~Visit.path.startswith("/@pages/"))
        .group_by(Visit.path)
        .subquery()
    )

    rows = db.query(subq).all()
    total = len(rows)

    # 计算每个页面的详细指标
    items_raw = []
    for row in rows:
        # 平均阅读时长
        avg_duration = (
            db.query(func.avg(ReadingDuration.duration_seconds))
            .filter(ReadingDuration.path == row.path)
            .scalar()
        ) or 0.0

        # 点赞数
        like_count = (
            db.query(func.count(Like.id)).filter(Like.path == row.path).scalar() or 0
        )

        # 跳出率：有访问但无阅读时长记录的 session 占比
        sessions_with_duration = (
            db.query(func.count(func.distinct(ReadingDuration.session_id)))
            .filter(ReadingDuration.path == row.path)
            .scalar()
        ) or 0
        total_sessions = row.sessions or 1
        bounce_rate = 1.0 - (sessions_with_duration / total_sessions)

        items_raw.append({
            "path": row.path,
            "pv": row.pv,
            "avgDuration": round(float(avg_duration), 1),
            "likeCount": like_count,
            "bounceRate": round(bounce_rate, 4),
        })

    # 归一化 + 计算综合评分
    max_pv = max((i["pv"] for i in items_raw), default=1) or 1
    max_duration = max((i["avgDuration"] for i in items_raw), default=1) or 1
    max_likes = max((i["likeCount"] for i in items_raw), default=1) or 1

    for i in items_raw:
        pv_norm = i["pv"] / max_pv
        dur_norm = min(i["avgDuration"] / max_duration, 1.0)
        likes_norm = i["likeCount"] / max_likes if max_likes > 0 else 0
        quality_norm = 1.0 - i["bounceRate"]

        score = (
            pv_norm * 0.25
            + dur_norm * 0.35
            + quality_norm * 0.25
            + likes_norm * 0.15
        )
        i["score"] = round(score * 100, 1)  # 转为百分制

    # 排序
    sort_map = {
        "score": lambda x: x["score"],
        "pv": lambda x: x["pv"],
        "duration": lambda x: x["avgDuration"],
        "likes": lambda x: x["likeCount"],
        "bounce": lambda x: -x["bounceRate"],
    }
    key_fn = sort_map.get(sort, sort_map["score"])
    items_raw.sort(key=key_fn, reverse=(sort != "bounce"))

    # 分页
    offset = (page - 1) * size
    page_items = items_raw[offset:offset + size]

    # 加载文章标题映射，处理 URL 编码
    path_title_map = {}
    try:
        import json, os
        from urllib.parse import unquote
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        candidates = [
            os.path.join(base, "..", "data", "stats.json"),
            os.path.join(base, "..", "docs", "public", "data", "stats.json"),
        ]
        for sp in candidates:
            sp = os.path.normpath(sp)
            if os.path.exists(sp):
                with open(sp, "r", encoding="utf-8") as f:
                    stats_data = json.load(f)
                path_title_map = stats_data.get("pathTitleMap", {})
                break
    except Exception:
        pass

    def _lookup_title(raw_path: str) -> str:
        """从数据库路径查找文章标题，处理 .html 后缀和 URL 编码"""
        clean = raw_path.replace(".html", "")
        # 尝试直接查找
        if clean in path_title_map:
            return path_title_map[clean]
        # 尝试 URL 解码后查找
        decoded = unquote(clean)
        if decoded in path_title_map:
            return path_title_map[decoded]
        # 兜底：取路径最后一段
        return decoded.split("/")[-1] if "/" in decoded else decoded

    items = [
        QualityScoreItem(
            path=i["path"],
            title=_lookup_title(i["path"]),
            pv=i["pv"],
            avgDuration=i["avgDuration"],
            likeCount=i["likeCount"],
            bounceRate=i["bounceRate"],
            score=i["score"],
        )
        for i in page_items
    ]

    return QualityScoreResponse(items=items, total=total, page=page, size=size)


@router.get("/geo/cities", response_model=GeoCityResponse)
def get_geo_cities(
    days: int = Query(30, description="天数"),
    db: Session = Depends(get_db),
):
    """访客城市级分布"""
    since = datetime.now() - timedelta(days=days)

    rows = (
        db.query(
            Visit.country,
            Visit.region,
            Visit.city,
            func.count(Visit.id).label("pv"),
        )
        .filter(Visit.created_at >= since, Visit.city.isnot(None))
        .group_by(Visit.country, Visit.region, Visit.city)
        .order_by(func.count(Visit.id).desc())
        .all()
    )

    total = sum(r.pv for r in rows) or 1
    items = []
    for row in rows:
        parts = []
        if row.country:
            parts.append(row.country)
        if row.region:
            parts.append(row.region)
        if row.city:
            parts.append(row.city)
        label = " - ".join(parts) if parts else "未知"

        items.append(GeoCityItem(
            country=row.country or "",
            region=row.region,
            city=row.city,
            label=label,
            pv=row.pv,
            percentage=round(row.pv / total * 100, 1),
        ))

    return GeoCityResponse(items=items)
