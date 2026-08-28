---
title: Day0 入门
date: 2026-08-28 23:30:33
categories:
  - ray
tags:
  - ray
  - ray学习记录
---


# Day0 入门

## 从最浅显的使用开始

从所看到的所有入门教程开始，似乎函数和类只要加上了`@ray.remote`就能够直接成为一个`ray`的能力，不管是无状态的`task`还是有状态的`Actor`， 因此我对于`ray`的学习就先从`@ray.remote`开始。

### remote_function

首先有阅读位于`python\ray\remote_function.py`的源码。

此处定义了`RemoteFunction`类，即用于包装普通的函数，将其转化为一个ray的task。

#### __init__

在初始化的过程中首先做的是校验函数是否为异步函数，不接受异步函数（此处包装的是task任务，task是无状态的，返回的就是一个切实的数据，而异步函数返回的是协程对象，需要await进行等待获取结果，和整体的设计不符）。

其次对gpu数量进行确认，如果没有限定最大的调用次数就默认为1次（保证gpu不被空占），并将传入的`option`属性固化为函数的属性。

**一些机制**

| 属性                         | 作用                                                         |
| :--------------------------- | ------------------------------------------------------------ |
| _function_signature          | 签名提取依赖 ray.init()，推迟到第一次 remote() 才做          |
| _inject_lock                 | 多线程同时 remote() 时，保证 tracing 注入恰好一次            |
| _last_export_cluster_and_job | 记住「上次导出到哪」，避免同一个 job 里重复导出函数，会把函数导出到GCS，供worker调用 |

#### options

单次修改一些参数，返回一个`FunctionWrapper`类，供单次调用。

#### _remote

实际的remote函数的调用，实际获取ray的worker，开启计费和轨迹记录。

此时会比较当前的`_last_export_cluster_and_job` 是否与worker的对应属性一致，实现重新打包到gcs。

接着对当前的资源配置进行检查，检查是否能够满足使用需求等。

### 
