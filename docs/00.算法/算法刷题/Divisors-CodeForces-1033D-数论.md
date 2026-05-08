---
title: Divisors-CodeForces-1033D-数论
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# Divisors CodeForces - 1033D(数论)
## 题意
给出n个数，每个数有3到5个因数，问n个数的积有多少因数
## 思路
分情况讨论：
1. 3个因数：完全平方数
2. 4个因数：两个质因数或完全立方数
3. 5个因数：完全四次方数

对于每个数先讨论是否是完全2|3|4次方数，若是，则为这些因子加上2|3|4。 若不是则在特殊讨论，若它的因数不包含已经得出的因数，且和其他需讨论的数最大公因数为1，说明它有独特的两个因数，直接给答案乘上即可。
## 注意
开根号的时候精度问题，一开始没考虑，后来看别人的题解发现问题，然后1e-6可以AC，1e-8就卡住了，查为什么一定是1e-6,网上都说是经验？后来看见一个通过左右增减避免精度误差的问题。

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
set<ll> s;
map<ll, ll> mp;
vector<ll> v;
bool vis[505];
ll a[505],ans;
int n;
ll gcd(ll a, ll b)
{
	return b == 0 ? a : gcd(b, a % b);
}
ll Pow(ll a, ll b)
{
	ll ans = 1;
	while (b)
	{
		if (b & 1)
			ans *= a;
		b >>= 1;
		a *= a;
	}
	return ans;
}
ll check(ll t, ll k) {
	ll tmp = pow(t, 1.0 / k);
	while (Pow(tmp, k) < t)  tmp++;
	while (Pow(tmp, k) > t)  tmp--;
	return Pow(tmp, k) == t ? tmp : -1;
}

int main()
{
	scanf("%d", &n);
	ans = 1;
	for (int i = 1; i <= n; i++)
	{
		ll f=-1;
		scanf("%lld", &a[i]);
		for (int j = 4; j > 1; j--)
		{
			 f = check(a[i], j);
			if (f != -1)
			{
				s.insert(f);
				mp[f] += j;
				break;
			}
		}
		if(f==-1)
		v.push_back(a[i]);
	}
	sort(v.begin(), v.end());
	for (int i = 0; i < v.size(); i++)
	{
		if (vis[i])
			continue;
		vis[i] = true;
		ll t = 0;
		ll cnt = 0;
		for (int j = 0; j < v.size(); j++)
		{
			if (v[i] == v[j])
			{
				cnt++;
				vis[j] = true;
				continue;
			}
			ll d = gcd(v[j], v[i]);
			if (d != 1)
			{
				t = d;
			}
		}
		if (!t)
		{
			for (set<ll>::iterator it = s.begin(); it != s.end(); it++)
			{
				if (v[i] % (*it) == 0)
				{
					t = *it;
					break;
				}
			}
		}
		if (!t)
			ans = (ans * (1ll + cnt) % MOD * (1ll + cnt)) % MOD;
		else
		{
			mp[t] += cnt;
			mp[v[i] / t] += cnt;
		}
	}
	for(map<ll,ll>::iterator it=mp.begin();it!=mp.end();it++)
	{
		ans = (ans * (it->second + 1)) % MOD;
	}
	printf("%lld\n", ans);
	return 0;
}
```