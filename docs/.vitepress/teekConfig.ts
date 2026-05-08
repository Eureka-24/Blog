import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  teekHome: true, // 是否开启博客首页
  vpHome: false, // 是否展现 VP 首页
  sidebarTrigger: true, // 是否开启侧边栏折叠功能
  author: { name: "Eurake-24", link: "https://github.com/Eureka-24" },
  footerInfo: {
    theme: { show: false },
    copyright: { show: false },
    icpRecord: {
      name: "京ICP备2026023020号-1",
      link: "https://beian.miit.gov.cn/"
    }
  },
  codeBlock: {
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
    },
  },
  banner: {
    enabled: true,
    name: "Eurake-24的技术小站",
    bgStyle: "fullImg",  // 背景风格：pure纯色 | partImg局部图 | fullImg全屏图
    imgSrc: "/blog/bg1.webp",  // 背景图片路径（可多张数组轮播）
    imgInterval: 15000,  // 多图切换间隔（毫秒）
    imgShuffle: false,   // 是否随机切换
    mask: true,          // 是否显示遮罩
    maskBg: "rgba(0, 0, 0, 0.4)",  // 遮罩颜色/透明度
    textColor: "#ffffff",  // 文字颜色
    titleFontSize: "3.2rem",  // 标题字体大小
    description: [],
    descStyle: "default"
  }

});
