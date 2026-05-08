---
title: CF311E-Biologits-最小割
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# CF311E Biologits (最小割)

## 题目

有n个01变量，目标在于确定它们的值，改变第i个变量的代价是$v_i$。
有m个限制条件，条件是一个变量集合内的所有元素都为0|1，当满足条件会获得$W_i$的收益，否则根据输入有可能会付出$g_i$的代价。
最终的目的是求得最大的收益。

##  思路

很明显的转化为最小割来计算与满收益相比的最小损失。
我们的割即为损失，那么我们对于现在为0的点与S连接，为1的点与T连接，权值为$v_i$，代表如果进行转化需要付出的代价，现在暂时还并不明显意味着什么。
再看限制条件，我们把每个条件当成一个点，它们获得的收益为$w_i$或$w_i+g_i$，这是满足和不满足之间的差值。如果条件是1，那么我们将该点与T相连，如果条件是0，那么与S相连，边权即为收益。同时，将一个条件集合的点都作为该点的后继节点，并且边权为INF。
现在再来看，如果我们令某一集合满足要求，先看若要求是1，那么我们保留该点与T间的联系，但该集合中原本是0的点就该变成1，根据我们前面的连边，很自然地发现，要使得S与T不相连，那么T与该点，以及前置节点与S，这两组边集必然只能存一，那么被割去的边集就是我们的损失。同理要求为0也是一致的。
所以我们的得益就是：所有得益之和 - 割的流量
要求最大的的得益，就是求最小割。

## 代码

```cpp
#include <iostream>
#include <cstring>
#include <algorithm>
#include <queue>
using namespace std;
typedef long long ll;

const int N = 2e4+5 , M = 1e5+5 , INF = 0x3f3f3f3f;

int tot,head[N],nxt[M],to[M],cur[M],d[N];
int n,m,g,s,t;
int a[N];
ll ans,w[M];

void add_edge(int x,int y,int z)
{
    nxt[++tot] = head[x],head[x] = tot,to[tot] = y,w[tot] = z;
    nxt[++tot] = head[y],head[y] = tot,to[tot] = x,w[tot] = 0;
}

bool bfs()
{
    memset(d,-1,sizeof(d));
    memcpy(cur,head,sizeof(head));
    d[s] = 0;
    queue<int> q;
    q.push(s);
    while(q.size())
    {
        int x = q.front();
        q.pop();
        for(int i = head[x] ; i ; i = nxt[i])
        {
            int y = to[i] , vol = w[i];
            if(d[y] == -1 && vol > 0)
            {
                d[y] = d[x] + 1;
                q.push(y);
            }
        }
    }
    return d[t] != -1;
}

ll dfs(int x = s , int flow = INF)
{
    if(x == t)
        return flow;
    int rest = flow;
    for(int& i = cur[x] ; i ; i = nxt[i])
    {
        int y = to[i] , vol = w[i];
        if(d[y] == d[x] + 1 && vol > 0)
        {
            int c = dfs(y,min(vol,rest));
            if(!c)
                d[y] = 0;
            rest -= c;
            w[i] -= c;
            w[i^1] += c;
        }
    }
    return flow - rest;
}

ll dinic()
{
    ll res = 0;
    while(bfs())
    {
        res += dfs();
    }
    return res;
}

int main()
{
    scanf("%d%d%d", &n, &m, &g);
    tot = 1;
    s = 0 , t = n + m + 1;
    for(int i = 1 ; i <= n ; i ++)
        scanf("%d",a+i);
    for(int i = 1 , v ; i <= n ; i ++)
    {
        scanf("%d", &v);
        if(a[i] == 0)
            add_edge(s,i,v);
        else
            add_edge(i,t,v);
    }
    for(int i = 1 ; i <= m ; i ++)
    {
        int op , W , k, p;
        scanf("%d%d%d",&op,&W,&k);
        ans += W;
        for(int j = 1,x ; j <= k ; j ++)
        {
            scanf("%d", &x);
            if(op == 1)
                add_edge(x,n+i,INF);
            else
                add_edge(n+i,x,INF);
        }
        scanf("%d", &p);
        if(p)
            W += g;
        if(op == 1)
            add_edge(n+i,t,W);
        else
            add_edge(s,n+i,W);
    }
    printf("%lld", ans - dinic());
    return 0;
}


```