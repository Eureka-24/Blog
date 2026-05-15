---
title: Claude Code 使用技巧
date: 2026-05-15 16:15:12
categories:
  - AI
tags:
  - AI实践
  - Claude Code
---

# Claude Code 使用技巧

## Skill

`skill`是一个流程化工作的描述。

### Skill目录

```
my-skill/
├── SKILL.md           # 主要指引 (必要)
├── template.md        # 可以由claude填写的模版
├── examples/
│   └── sample.md      # few-shot
└── scripts/
    └── validate.sh    # 可执行模版
```

### Skill 配置

```markdown
---
name: deploy
description: Deploy the application to production
#创建独立分支使用
context: fork
# 防止被claude自动触发
disable-model-invocation: true
allowed-tools: Read Grep
---

#可以使用占位符
$0 $1 

#!`***` 会在claude读取前运行并替代
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`
```

## Hooks

![image-20260515170335079](https://cdn.jsdelivr.net/gh/Eureka-24/img@main/img/20260515170335195.png)

| 事件                  | 当它发射时                                                   |
| :-------------------- | :----------------------------------------------------------- |
| `SessionStart`        | 会话开始或恢复时                                             |
| `Setup`               | 当你用 、 或 或 在模式下启动 Claude Code 时，用于一次性的CI或脚本准备`--init-only``--init``--maintenance``-p` |
| `UserPromptSubmit`    | 当你提交提示时，在Claude处理之前                             |
| `UserPromptExpansion` | 当用户输入的命令在到达Claude之前展开为提示符时，可以阻止膨胀 |
| `PreToolUse`          | 在工具调用执行之前。可以屏蔽它                               |
| `PermissionRequest`   | 当出现许可对话框时                                           |
| `PermissionDenied`    | 当工具调用被自动模式分类器拒绝时，返回告诉模型，它可能会重新尝试被拒绝的工具调用`{retry: true}` |
| `PostToolUse`         | 工具调用成功后                                               |
| `PostToolUseFailure`  | 工具调用失败后                                               |
| `PostToolBatch`       | 在完成一批并行工具调用后，在下一个模型调用之前               |
| `Notification`        | 当Claude Code发送通知时                                      |
| `SubagentStart`       | 当子代理生成时                                               |
| `SubagentStop`        | 当一个分代理结束时                                           |
| `TaskCreated`         | 当任务正在通过以下方式创建时`TaskCreate`                     |
| `TaskCompleted`       | 当任务被标记为已完成时                                       |
| `Stop`                | 克劳德回应完毕                                               |
| `StopFailure`         | 当回合因API错误而结束时。输出和退出代码被忽略                |
| `TeammateIdle`        | 当agent-team队友快要挂了                                     |
| `InstructionsLoaded`  | 当 CLAUDE.md 或文件被加载到上下文中时。会话开始时触发，以及会话中文件加载延迟时`.claude/rules/*.md` |
| `ConfigChange`        | 当会话中配置文件发生变化时                                   |
| `CwdChanged`          | 当工作目录发生变化时，比如 Claude 执行命令时。对于使用像direnv这样的工具进行被动环境管理非常有用`cd` |
| `FileChanged`         | 当磁盘上的观看文件发生变化时。该字段指定要监视哪些文件名`matcher` |
| `WorktreeCreate`      | 当工作树通过或创建时。替换默认的 git 行为`--worktree``isolation: "worktree"` |
| `WorktreeRemove`      | 当工作树被移除时，无论是在会话结束时还是子代理完成时         |
| `PreCompact`          | 上下文压缩之前                                               |
| `PostCompact`         | 上下文压缩完成后                                             |
| `Elicitation`         | 当MCP服务器在工具调用时请求用户输入                          |
| `ElicitationResult`   | 用户响应MCP引发后，响应返回服务器之前                        |
| `SessionEnd`          | 会话终止时                                                   |

- **指令钩** (`type: "command"`运行一个shell命令。你的脚本接收事件的JSON 输入使用标准待遇（STDIN），并通过出口码和标准标准出勤（STDOUT）传达结果。
- **HTTP 钩子** (`type: "http"`）： 将事件的 JSON 输入作为 HTTP POST 请求发送到 URL。端点通过响应体同样传递结果JSON 输出格式作为指挥钩子。
- **MCP工具钩** (`type: "mcp_tool"`：调用已连接的工具MCP服务器.工具的文本输出被当作命令钩子标准处理。
- **提示钩子** (`type: "prompt"`）： 向 Claude 模型发送提示，进行单回合评估。模型以 JSON 形式返回是非决策。
- **代理钩** (`type: "agent"`）： 生成一个子代理，该子代理可以使用 Read、Grep 和 Glob 等工具验证条件，然后返回决策。代理钩子是实验性的，可能会发生变化。

## SubAgents

`agents`命令能够查看当前正在运行的agent以及已经定义的agent，可以通过`Library`内的`Create new agent`实现claude引导下的agnet创建。 可以通过claude判断自动运行，或是@来启动

![image-20260515161711539](https://cdn.jsdelivr.net/gh/Eureka-24/img@main/img/20260515161718695.png)

### agent 配置

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
# 可以使用的工具,Agent可以调用子agent，但只有主线程运行的agent可以使用
tools: Read, Glob, Grep, Agent      
# 禁止使用的工具
disallowedTools: Write, Edit		
# 自定义使用模型
model: sonnet 	
# mcp使用
mcpServers:
  # 内联定义: 只有该subagent可以使用
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # 名字参考: 复用已经存在的mcp服务器
  - github
# 可用技能，会在启动时注入上下文，仅是作为上下文， 没有启用/禁用的功能。
skills:
  - api-conventions
# 设定代理的经验来源
memory: user

# Hook定义，进行脚本检查
hooks:
  PreToolUse|PostToolUse|Stop:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---


```

```json
// settings.json

// 禁止使用某些agent
{
    "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
    }
}

// 项目级Hooks
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}

```

### 使用场景

隔离上下文：

* 任务输出的冗长内容在你的主要语境中是不需要的
* 你需要强制执行特定的工具限制或权限
* 该工作自成一体，可以返回摘要

