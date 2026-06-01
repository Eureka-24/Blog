"""
JWT 认证模块
"""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings

security = HTTPBearer(auto_error=False)


def create_token() -> str:
    """生成 JWT token，有效期 24 小时"""
    expiry = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {
        "exp": expiry,
        "iat": datetime.now(timezone.utc),
        "sub": "admin",
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token


def verify_password(password: str) -> bool:
    """验证管理员密码"""
    return password == settings.ADMIN_PASSWORD


def verify_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    """验证 JWT token 的依赖注入函数"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="缺少认证信息",
        )

    token = credentials.credentials
    try:
        jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 已过期",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的 Token",
        )
