---
title: 蓝桥杯-冰雹数-DP
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# 蓝桥杯-冰雹数（DP）
## 说明
备赛区数据错误，练习系统可过
## 代码
```cpp
#include <iostream>
using namespace std;
typedef long long ll;
const ll N = 1e6;
ll n;
ll f[N+5];
ll solve(ll x)
{
    if(x <= N && f[x])
        return f[x];
    ll t = x;
    if(t&1)
        t = t * 3 + 1;
    else
        t /= 2;
    if(t <= N)
      return max(x,f[t] = solve(t));
    else 
      return max(x,solve(t));
}
int main()
{
  cin>>n;
  f[1] = 1;
  for(ll i = 1 ; i <= n; i ++)
    f[i] = solve(i);
  ll ans = 0;
  for(int i = 1 ; i <= n ; i ++)
    ans = max(ans,f[i]);
  cout<<ans;
  return 0;
}
```