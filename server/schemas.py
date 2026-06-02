"""
Pydantic 请求/响应模型
"""
from pydantic import BaseModel
from typing import Optional


# ─── 公开接口 ───

class VisitCreate(BaseModel):
    path: str
    sessionId: str
    referer: Optional[str] = None


class VisitResponse(BaseModel):
    pv: int


class DurationCreate(BaseModel):
    path: str
    sessionId: str
    durationSeconds: int


class LikeCreate(BaseModel):
    path: str
    action: str  # "like" | "unlike"


class LikeResponse(BaseModel):
    liked: bool
    count: int


class PageStats(BaseModel):
    path: str
    pv: int
    uv: int
    likeCount: int
    avgDuration: float


class HotArticle(BaseModel):
    path: str
    pv: int
    likeCount: int
    avgDuration: float


class HotArticlesResponse(BaseModel):
    items: list[HotArticle]


# ─── 认证 ───

class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str
    expiresAt: str


# ─── 看板接口 ───

class OverviewResponse(BaseModel):
    totalPv: int
    todayPv: int
    totalUv: int
    todayUv: int
    onlineNow: int
    articleCount: int
    totalWords: int
    siteAgeDays: int
    lastUpdated: str


class TrendItem(BaseModel):
    date: str
    pv: int
    uv: int


class TrendResponse(BaseModel):
    items: list[TrendItem]


class PageStatsItem(BaseModel):
    path: str
    pv: int
    uv: int
    likeCount: int
    avgDuration: float


class PageStatsResponse(BaseModel):
    items: list[PageStatsItem]
    total: int
    page: int
    size: int


class SourceItem(BaseModel):
    source: str
    pv: int
    percentage: float


class SourcesResponse(BaseModel):
    items: list[SourceItem]


class DeviceOS(BaseModel):
    name: str
    pv: int
    percentage: float


class DeviceBrowser(BaseModel):
    name: str
    pv: int
    percentage: float


class DevicesResponse(BaseModel):
    os: list[DeviceOS]
    browsers: list[DeviceBrowser]


class GeoItem(BaseModel):
    country: str
    pv: int
    percentage: float


class GeoResponse(BaseModel):
    items: list[GeoItem]
