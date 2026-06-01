"""
FastAPI 应用入口
"""
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from auth import create_token, verify_password
from schemas import LoginRequest, LoginResponse

# ─── 路由 ───
from routers import visits, likes, stats_public, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时：初始化数据库
    init_db()
    yield
    # 关闭时：无需特殊清理


app = FastAPI(
    title="Blog Stats API",
    description="Eurake-24 技术小站数据统计后端",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(visits.router)
app.include_router(likes.router)
app.include_router(stats_public.router)
app.include_router(dashboard.router)


# ─── 认证接口（放在主文件便于管理） ───

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    """管理员登录，获取 JWT token"""
    if not verify_password(data.password):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误",
        )

    token = create_token()
    expires_at = datetime.now(timezone.utc).isoformat()

    return LoginResponse(token=token, expiresAt=expires_at)


# ─── 健康检查 ───

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}
