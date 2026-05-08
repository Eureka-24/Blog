---
title: AcWing-1223-最大比例
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# AcWing 1223. 最大比例
## 题目
X星球的某个大奖赛设了 M 级奖励。

每个级别的奖金是一个正整数。

并且，相邻的两个级别间的比例是个固定值。

也就是说：所有级别的奖金数构成了一个等比数列。

比如：16,24,36,54，其等比值为：3/2。

现在，我们随机调查了一些获奖者的奖金数。

请你据此推算可能的最大的等比值。

输入格式
第一行为数字 N ，表示接下的一行包含 N 个正整数。

第二行 N 个正整数 Xi，用空格分开，每个整数表示调查到的某人的奖金数额。

输出格式
一个形如 A/B 的分数，要求 A、B 互质，表示可能的最大比例系数。

数据范围
$0<N<100$
$0<X_i<10^{12}$
数据保证一定有解。

## 思路
对于$a_{1...n}$排序去重得到$b_{1..m}$。将它们两两之间的比值求出，得到$r_{2..m}$。
$$
r_i = (\frac{p}{q})^{x_i}
$$
若我们已知p,q,x，那么，要求的最大值必然是$(\frac{p}{q})^k$，其中$k=gcd(x_{2...m})$。而如今我们并不知道它们分别为多少，仅知道它们的幂。
不妨设F(a,b)就是a,b之间的最佳比例，我们对于p,q分别计算，这里仅讨论p。
$$
\begin{aligned}
F(a,b) &=F(p^x,p^y)~~~~(y>x)\\
			&=p^{gcd(x,y)}\\
			&=p^{gcd(x,y-x)}~~~(这里采用辗转相减，由于在指数部分，使用除法要开方，并不适用于我们的整数计算)\\
			&=F(p^x,p^{y-x})
\end{aligned}
$$
从而可以得到最佳比例。
## 代码
```cpp
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

const int N = 105;
#define int long long
int a[N],n;
int up[N],down[N];

int gcd(int a,int b)
{
    return b == 0 ? a : gcd(b,a%b);
}

int pgcd(int a,int b)
{
    if(a > b)
        swap(a,b);
    if(a == b)
        return a;
    return pgcd(a,b/a);
}

signed main()
{
    cin>>n;
    for (int i = 1; i <= n; i ++ )
        cin>>a[i];
    sort(a+1,a+n+1);
    int m = unique(a+1,a+n+1) - a - 1;
    for (int i = 2; i <= m ; i ++)
    {
        int d = gcd(a[i],a[1]);
        up[i] = a[i] / d;
        down[i] = a[1] / d;
    }
    int u = up[2] , dw = down[2];
    for (int i = 2 ; i <= m ; i ++)
    {
        u = pgcd(u,up[i]);
        dw = pgcd(dw,down[i]);
    }
    cout<<u<<"/"<<dw;
    return 0;
}
```