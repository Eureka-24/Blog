"""
访问记录路由
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Visit
from schemas import VisitCreate, VisitResponse, DurationCreate
from utils.ua import parse_ua
from utils.geo import lookup

router = APIRouter(prefix="/api/v1", tags=["visits"])


@router.post("/visit", response_model=VisitResponse)
def record_visit(
    data: VisitCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """记录一次页面访问"""
    # 获取客户端真实 IP
    forwarded = request.headers.get("X-Forwarded-For")
    real_ip = request.headers.get("X-Real-IP")
    client_ip = (forwarded or real_ip or request.client.host).split(",")[0].strip()

    # 解析 User-Agent
    ua_string = request.headers.get("User-Agent")
    os_name, browser = parse_ua(ua_string)

    # IP 属地查询（可选）
    geo_info = None
    if client_ip and client_ip != "127.0.0.1" and client_ip != "::1":
        try:
            geo_info = lookup(client_ip)
        except Exception:
            pass

    visit = Visit(
        path=data.path,
        ip_address=client_ip,
        os=os_name,
        browser=browser,
        referer=data.referer,
        country=geo_info["country"] if geo_info else None,
        region=geo_info["region"] if geo_info else None,
        city=geo_info["city"] if geo_info else None,
        session_id=data.sessionId,
    )
    db.add(visit)
    db.commit()

    # 返回当前页累计 PV
    pv = db.query(func.count(Visit.id)).filter(Visit.path == data.path).scalar() or 0

    return VisitResponse(pv=pv)


@router.post("/visit/duration")
def record_duration(
    data: DurationCreate,
    db: Session = Depends(get_db),
):
    """上报阅读时长"""
    from models import ReadingDuration

    # 过滤无效数据
    seconds = data.durationSeconds
    if seconds < 10 or seconds > 1800:
        return {"status": "ignored"}

    duration = ReadingDuration(
        path=data.path,
        session_id=data.sessionId,
        duration_seconds=seconds,
    )
    db.add(duration)
    db.commit()

    return {"status": "ok"}
