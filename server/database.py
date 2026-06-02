"""
SQLite 数据库初始化与连接管理
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

engine = create_engine(
    f"sqlite:///{settings.DATABASE_PATH}",
    connect_args={"check_same_thread": False},  # SQLite 多线程访问
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """创建所有表（如果不存在）并自动迁移 schema"""
    from models import Visit, ReadingDuration, Like, DailyAggregation  # noqa
    Base.metadata.create_all(bind=engine)

    # 自动迁移：添加新增的列（SQLite 不支持 ALTER TABLE ADD COLUMN IF NOT EXISTS）
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    existing_cols = {c["name"] for c in inspector.get_columns("page_visits")}
    additions = []
    if "region" not in existing_cols:
        additions.append("region VARCHAR(100)")
    if "city" not in existing_cols:
        additions.append("city VARCHAR(100)")
    if "ip_address" not in existing_cols and "ip_hash" in existing_cols:
        # 迁移：从 ip_hash 改为 ip_address（复制旧值，扩容列）
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE page_visits ADD COLUMN ip_address VARCHAR(45)"))
            conn.execute(text("UPDATE page_visits SET ip_address = ip_hash WHERE ip_address IS NULL"))
            conn.commit()
            print("Database migration: added ip_address column, copied from ip_hash")
    elif "ip_address" not in existing_cols:
        additions.append("ip_address VARCHAR(45)")
    if additions:
        with engine.connect() as conn:
            for col in additions:
                conn.execute(text(f"ALTER TABLE page_visits ADD COLUMN {col}"))
            conn.commit()
            print(f"Database migration: added columns {additions}")


def get_db():
    """FastAPI 依赖注入：获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
