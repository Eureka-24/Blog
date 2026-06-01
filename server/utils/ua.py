"""
User-Agent 解析工具
提取操作系统和浏览器类型，不保存完整 UA 字符串
"""
from user_agents import parse


def parse_ua(ua_string: str | None) -> tuple[str, str]:
    """
    解析 User-Agent，返回 (os, browser)
    只保留类型信息，不保存原始 UA
    """
    if not ua_string:
        return "Unknown", "Unknown"

    try:
        ua = parse(ua_string)

        # 操作系统
        if ua.is_mobile:
            if "iOS" in ua.os.family:
                os_name = "iOS"
            elif "Android" in ua.os.family:
                os_name = "Android"
            else:
                os_name = ua.os.family
        elif ua.is_pc:
            if "Windows" in ua.os.family:
                os_name = "Windows"
            elif "Mac" in ua.os.family:
                os_name = "macOS"
            elif "Linux" in ua.os.family:
                os_name = "Linux"
            else:
                os_name = ua.os.family
        else:
            os_name = ua.os.family

        # 浏览器
        browser = ua.browser.family if ua.browser.family else "Unknown"

        return os_name, browser
    except Exception:
        return "Unknown", "Unknown"
