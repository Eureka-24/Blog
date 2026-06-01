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
