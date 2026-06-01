"""
IP 地址哈希工具
将 IP 进行不可逆哈希，仅取前 16 位作为标识，保护用户隐私
"""
import hashlib

from config import settings


def hash_ip(ip: str) -> str:
    """
    对 IP 进行 SHA256 哈希，取前 16 位 hex 作为标识
    不可逆，符合个人信息保护法要求
    """
    raw = f"{ip}:{settings.IP_HASH_SALT}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]
