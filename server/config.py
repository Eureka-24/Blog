"""
应用配置
生产环境建议从环境变量或 .env 文件读取敏感信息
"""
import os


class Settings:
    # 服务端口
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # 数据库
    DATABASE_PATH: str = os.path.join(os.path.dirname(__file__), "stats.db")

    # JWT 认证
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # 管理员密码（生产环境务必通过环境变量设置）
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    # IP 哈希盐值
    IP_HASH_SALT: str = "eurake-blog-2026"

    # CORS 允许的来源
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",  # VitePress dev
        "http://localhost:4173",  # VitePress preview
        "https://eurake.xyz",
        "http://eurake.xyz",
    ]


settings = Settings()
