---
title: Latex使用tips
date: 2025-05-08 20:00:00
categories:
  - ISAC
tags:
  - ISAC
---

# Latex使用tips
## 页顶公式(subequations)
为了实现页顶跨栏公式的正确编号往往需要对公式编号进行操作，以下给出步骤：
**step1:** 写入跨栏公式
```
\begin{figure*}[!t]  %跨栏页顶公式出现在下一页顶
	\normalsize
	\setcounter{equation}{12} %这里为当前公式前一个编号
	\begin{subequations}\label{P1} % 不在这里使用公式编号设置，这里是对小标题设置编号比如(n,m,l..)
		\begin{gather}
			.........
		\end{gather}
	\end{subequations}
	\hrulefill \vspace*{0pt}
\end{figure*}
```
**step2:** 之后的第一个公式恢复
 ```
\begin{equation}
		\setcounter{equation}{1} %恢复公式计数
		\begin{aligned}
			.....
		\end{aligned}
\end{equation}
 ```

## 图片排版
### 多行多列排版
多行为一行多列叠加：可以使用空格控制符$\backslash {\rm quad},\backslash {\rm qquad}$等进行上下对齐
```
\begin{figure*}[!h]
	\begin{minipage}[t]{0.5\linewidth} %第一列
		\centering
		\includegraphics[width=1\textwidth]{A.pdf}
		\caption{}
		\label{}
	\end{minipage}
	\begin{minipage}[t]{0.5\linewidth} %第二列
		\centering
		\includegraphics[width=0.9\textwidth]{B.pdf}
		\caption{}
		\label{}
	\end{minipage}
\end{figure*}
```