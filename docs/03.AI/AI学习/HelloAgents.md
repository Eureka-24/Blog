---
title: HelloAgents
date: 2026-05-28 18:32:02
categories:
  - AI
tags:
  - AI学习
  - Agent框架
---


# HelloAgents

## core

### llm.py

实现了最基本的**LLM**使用，其中包含：

普通调用：`invoke()`

流式调用：`stream_invoke()`

工具调用：`invoike_with_tools()`

以及它们的异步调用`a`前缀

#### 重点

使用`adpator`包装，实现使用相同的抽象创建不同api下的LLM。

### agent.py

实际的**agent**实现，其中关键的设计点在于，将**子代理机制组件TodoWrite**、 **进度管理组件**、**DevLog 开发日志组件**都以工具的方式注册。

## tools

### base

定义`tool_actioin`装饰器来定义Tool，可以继承`Tool`基类实现Tool，也可以通过在继承类中增加`tool_actioin`装饰器实现可展开的工具（渐进式披露）。

