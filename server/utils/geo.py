"""
IP 属地查询工具（可选）
使用 MaxMind GeoLite2 免费数据库
"""
import os
from pathlib import Path


# GeoLite2 数据库路径
GEO_DB_PATH = os.path.join(Path(__file__).parent.parent, "GeoLite2-Country.mmdb")

_reader = None


def get_reader():
    """懒加载 GeoIP reader"""
    global _reader
    if _reader is None and os.path.exists(GEO_DB_PATH):
        try:
            import geoip2.database
            _reader = geoip2.database.Reader(GEO_DB_PATH)
        except Exception:
            pass
    return _reader


def lookup_country(ip: str) -> str | None:
    """
    查询 IP 所属国家/地区
    返回 ISO 国家代码，如 "CN", "US"
    如果数据库不存在或查询失败，返回 None
    """
    reader = get_reader()
    if reader is None:
        return None

    try:
        response = reader.country(ip)
        return response.country.iso_code
    except Exception:
        return None


def close():
    """释放 GeoIP 数据库资源"""
    global _reader
    if _reader:
        _reader.close()
        _reader = None
