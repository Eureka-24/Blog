"""GeoIP 数据库下载脚本"""
import os, sys, urllib.request, json, shutil, gzip
from pathlib import Path

DB_DIR = Path(__file__).parent
DB_PATH = DB_DIR / "GeoLite2-Country.mmdb"
MIRROR_URL = "https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-Country.mmdb"

def download():
    print(f"正在从镜像站下载 GeoLite2-Country.mmdb ...")
    try:
        urllib.request.urlretrieve(MIRROR_URL, DB_PATH)
        size = os.path.getsize(DB_PATH)
        print(f"完成: {size/1024:.0f} KB")
        return True
    except Exception as e:
        print(f"失败: {e}")
        return False

if __name__ == "__main__":
    if DB_PATH.exists():
        print(f"已存在: {DB_PATH} ({os.path.getsize(DB_PATH)/1024:.0f} KB)")
        sys.exit(0)
    if not download():
        print("手动下载: https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-Country.mmdb")
        sys.exit(1)
