"""GeoIP 数据库下载脚本（City + Country）"""
import os, sys, urllib.request
from pathlib import Path

DB_DIR = Path(__file__).parent
MIRROR = "https://github.com/P3TERX/GeoLite.mmdb/raw/download"
FILES = [
    ("GeoLite2-City.mmdb",    f"{MIRROR}/GeoLite2-City.mmdb"),
    ("GeoLite2-Country.mmdb", f"{MIRROR}/GeoLite2-Country.mmdb"),
]

def download(name, url):
    path = DB_DIR / name
    if path.exists():
        print(f"已存在: {name} ({os.path.getsize(path)/1024/1024:.0f} MB)")
        return True
    print(f"下载 {name} ...")
    try:
        urllib.request.urlretrieve(url, path)
        print(f"  完成: {os.path.getsize(path)/1024/1024:.0f} MB")
        return True
    except Exception as e:
        print(f"  失败: {e}")
        return False

if __name__ == "__main__":
    ok = True
    for name, url in FILES:
        if not download(name, url):
            ok = False
    if not ok:
        print("\n部分下载失败，手动地址: https://github.com/P3TERX/GeoLite.mmdb")
        sys.exit(1)
    print("\nGeoIP 数据库就绪")
