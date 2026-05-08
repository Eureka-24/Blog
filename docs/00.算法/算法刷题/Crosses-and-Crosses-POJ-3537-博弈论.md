---
title: Crosses-and-Crosses-POJ-3537-博弈论
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# Crosses and Crosses POJ - 3537 （博弈论）
## 题意
给出$1*n$的棋盘，a,b轮流画×，完成三连×的获胜。
## 思路
当一个点被画下了×,那么作为当前棋手在它的左右各两格内下棋必然是输的，所以，一旦一点被下了后，游戏便被分解为两个游戏。设当前点为x，则两个分解游戏分别为$1\rightarrow(x-3)$和$(x+3)\rightarrow n$,即为$n_1=(x-3)-1+1=x-3$和$n_2=n-(x+3)+1=n-x-2$的游戏。
## AC代码
```cpp
#define _CRT_SECURE_NO_WARNINGS
#include<iostream>
#include<cmath>
#include<algorithm>
#include<cstdio>
#include<string>
#include<cstring>
#include<cstdlib>
#include<queue>
#include<map>
#include<set>
using namespace std;
const long long inf = 0x3f3f3f3f;
#define ll long long
const int MAXN = 10005;
const double eps = 1e-6;
const ll MOD = 998244353;
int n, sg[2005];
int getSG(int x)
{
	if (x <= 0)
		return 0;
	if (sg[x] != -1)
		return sg[x];
	bool s[2005];
	memset(s, 0, sizeof(s));
	for (int i = 1; i <= x; i++)
	{
		s[getSG(i - 3) ^ getSG(x - i - 2)] = 1;
	}
	for (int i = 0;; i++)
		if (!s[i])
			return sg[x] = i;
}
int main()
{
	memset(sg, -1, sizeof(sg));
	while (cin >> n)
	{
		int ans = getSG(n);
		if (ans)
			cout << 1 << endl;
		else
			cout << 2 << endl;
	}
}
```