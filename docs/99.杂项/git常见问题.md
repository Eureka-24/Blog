---
title: git常见问题
date: 2026-6-17 13:27:26
categories:
  - 杂项
tags:
  - git
---

# git常见问题

## git 修改SSH验证为 HTTPS
管理员权限
```
# 全局启用Git长路径支持
git config --system core.longpaths true

# 同时为当前用户启用
git config --global core.longpaths true
```