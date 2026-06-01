"""
点赞路由
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Like
from schemas import LikeCreate, LikeResponse
from utils.hash import hash_ip

router = APIRouter(prefix="/api/v1", tags=["likes"])


@router.post("/like", response_model=LikeResponse)
def toggle_like(
    data: LikeCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """点赞或取消点赞"""
    # 获取客户端标识
    forwarded = request.headers.get("X-Forwarded-For")
    real_ip = request.headers.get("X-Real-IP")
    client_ip = (forwarded or real_ip or request.client.host).split(",")[0].strip()
    ip_h = hash_ip(client_ip) if client_ip else "unknown"

    if data.action == "like":
        # 插入点赞记录（已存在则忽略）
        existing = db.query(Like).filter(
            Like.path == data.path,
            Like.ip_hash == ip_h,
        ).first()
        if not existing:
            like = Like(path=data.path, ip_hash=ip_h)
            db.add(like)
            db.commit()
        liked = True

    elif data.action == "unlike":
        # 删除点赞记录
        db.query(Like).filter(
            Like.path == data.path,
            Like.ip_hash == ip_h,
        ).delete()
        db.commit()
        liked = False

    else:
        liked = False

    # 返回当前点赞数
    count = db.query(func.count(Like.id)).filter(Like.path == data.path).scalar() or 0

    return LikeResponse(liked=liked, count=count)
