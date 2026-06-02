"""
IP 属地查询工具
使用 MaxMind GeoLite2 免费数据库（City 版可定位到城市）
"""
import os
from pathlib import Path


# GeoLite2 数据库路径（优先使用 City 版）
GEO_DB_DIR = Path(__file__).parent.parent
CITY_DB_PATH = str(GEO_DB_DIR / "GeoLite2-City.mmdb")
COUNTRY_DB_PATH = str(GEO_DB_DIR / "GeoLite2-Country.mmdb")

_reader = None
_use_city = False


def get_reader():
    """懒加载 GeoIP reader，优先使用 City 数据库"""
    global _reader, _use_city
    if _reader is None:
        if os.path.exists(CITY_DB_PATH):
            try:
                import geoip2.database
                _reader = geoip2.database.Reader(CITY_DB_PATH)
                _use_city = True
            except Exception:
                pass
        if _reader is None and os.path.exists(COUNTRY_DB_PATH):
            try:
                import geoip2.database
                _reader = geoip2.database.Reader(COUNTRY_DB_PATH)
            except Exception:
                pass
    return _reader


def lookup(ip: str) -> dict | None:
    """
    查询 IP 属地信息
    返回: {"country": "CN", "region": "Guangdong", "city": "Shenzhen"}
    如果数据库不存在或查询失败，返回 None
    """
    reader = get_reader()
    if reader is None:
        return None

    try:
        if _use_city:
            response = reader.city(ip)
            return {
                "country": response.country.iso_code,
                "region": response.subdivisions.most_specific.name if response.subdivisions else None,
                "city": response.city.name,
            }
        else:
            response = reader.country(ip)
            return {
                "country": response.country.iso_code,
                "region": None,
                "city": None,
            }
    except Exception:
        return None


def lookup_country(ip: str) -> str | None:
    """兼容旧接口：只返回国家代码"""
    result = lookup(ip)
    return result["country"] if result else None


def close():
    """释放 GeoIP 数据库资源"""
    global _reader
    if _reader:
        _reader.close()
        _reader = None
