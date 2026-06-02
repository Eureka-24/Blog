"""
SQLAlchemy ORM 模型
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, UniqueConstraint
from sqlalchemy.sql import func

from database import Base


class Visit(Base):
    """页面访问记录"""
    __tablename__ = "page_visits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String(500), nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    os = Column(String(50), nullable=True)
    browser = Column(String(50), nullable=True)
    referer = Column(Text, nullable=True)
    country = Column(String(50), nullable=True)
    region = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    session_id = Column(String(36), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), index=True)


class ReadingDuration(Base):
    """阅读时长记录"""
    __tablename__ = "reading_durations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String(500), nullable=False, index=True)
    session_id = Column(String(36), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())


class Like(Base):
    """点赞记录"""
    __tablename__ = "page_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String(500), nullable=False, index=True)
    ip_hash = Column(String(16), nullable=False)
    created_at = Column(DateTime, default=func.now())

    __table_args__ = (
        UniqueConstraint("path", "ip_hash", name="uq_path_ip"),
    )


class DailyAggregation(Base):
    """每日汇总（性能优化用）"""
    __tablename__ = "daily_aggregations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(10), nullable=False, index=True)
    path = Column(String(500), nullable=False)
    pv = Column(Integer, default=0)
    uv = Column(Integer, default=0)
    avg_duration = Column(Float, default=0.0)
    total_duration = Column(Integer, default=0)
    like_count = Column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint("date", "path", name="uq_date_path"),
    )
