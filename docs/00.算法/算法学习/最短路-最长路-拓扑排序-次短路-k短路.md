---
title: 最短路-最长路-拓扑排序-次短路-k短路
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# 最短路

## 单源最短路

### 1.Dijkstra(前向星+优先队列)

```c++
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
using namespace std;
struct Edge
{
	int w, u, v,nxt;
	Edge(int u, int v, int w,int nxt=-1) :
		u(u), v(v), w(w),nxt(nxt) {};
	Edge() {};

};
struct node
{
	int id;
	int dis;
	bool  operator <(const node& x)const
	{
		return dis > x.dis;
	}
};
int tot,head[1005],T,n;
int dis[1005], vis[1005];
Edge e[4005];
void add_edge(int u, int v, int w)//双向边
{
	e[tot] = Edge(u, v, w,head[u]);
	head[u] = tot;
	tot++;
	e[tot] = Edge(v, u, w,head[v]);
	head[v] = tot;
	tot++;
}
void dij(int s)
{
	priority_queue<node> q;
	node temp,temp2;
	temp.dis = 0, temp.id = s;
	q.push(temp);
	dis[s] = 0;
	int u, v, w;
	while (!q.empty())
	{
		temp = q.top();
		q.pop();
		if (vis[temp.id])
			continue;
		u = temp.id;
		vis[u] = 1;
		for (int i = head[u]; i != -1; i = e[i].nxt)
		{
			v = e[i].v, w = e[i].w;
			if (dis[v] > dis[u] + w)
			{
				dis[v] = dis[u] + w;
                if(vis[v])
                    continue;
				temp2.dis = dis[v];
				temp2.id = v;
				q.push(temp2);
			}
		}
	}
}
int main()
{
	memset(head, -1, sizeof(head));
	memset(dis, 0x3f, sizeof(dis));
	memset(vis, 0, sizeof(vis));
	scanf("%d%d", &T, &n);
	int u, v, w;
	for (int i = 0; i < T; i++)
	{
		scanf("%d%d%d", &u, &v, &w);
		add_edge(u, v, w);
	}
	dij(n);
	printf("%d",dis[1]);
	return 0;
}
```

### 2.SPFA(负权边)

```c++
#include<bits/stdc++.h>
const long long inf=2147483647;
const int maxn=10005;
const int maxm=500005;
using namespace std;
int n,m,s,num_edge=0;
int dis[maxn],vis[maxn],head[maxm];
int cnt[maxn];//表示从源点到i点经过的定点数(1开始)
struct Edge
{
  int next,to,dis;
}edge[maxm]; 
void addedge(int from,int to,int dis) //邻接表建图
{ 
  edge[++num_edge].next=head[from]; 
  edge[num_edge].to=to; 
  edge[num_edge].dis=dis; 
  head[from]=num_edge; 
}
bool spfa()
{
  queue<int> q; 
  for(int i=1; i<=n; i++) 
  {
    dis[i]=inf; 
    vis[i]=0; 
  }
  q.push(s); dis[s]=0; vis[s]=1,cnt[s]=1; //第一个顶点入队，进行标记
  while(!q.empty())
  {
    int u=q.front(); //取出队首
    q.pop(); vis[u]=0; //出队标记
    for(int i=head[u]; i; i=edge[i].next) 
    {
      int v=edge[i].to; 
      if(dis[v]>dis[u]+edge[i].dis) 
      {
        dis[v]=dis[u]+edge[i].dis;
          cnt[v]=cnt[u]+1;
          if(cnt[v]>n)
              return false;//有负环
        if(vis[v]==0) //未入队则入队
        {
          vis[v]=1; //标记入队
          q.push(v);
        }
      }
    }
  }
    return true;
}
int main()
{
  cin>>n>>m>>s;
  for(int i=1; i<=m; i++)
  {
    int f,g,w;
    cin>>f>>g>>w; 
    addedge(f,g,w); //建图，有向图连一次边就可以了
  }
  spfa(); //开始跑spfa
  for(int i=1; i<=n; i++)
    if(s==i) cout<<0<<" "; //如果是回到自己，直接输出0
      else cout<<dis[i]<<" "; //否则打印最短距离
  return 0;
}
```



## 多源最短路

### Floyed

```c++
for(register int i=1;i<=n;i++){
	for(register int j=1;j<=n;j++){
		d[i][j]=INF;
	}
	d[i][i]=0;
}//邻接矩阵存储,d[i][j]表示i到j的距离 
for(register int k=1;k<=n;k++){ //第一层枚举中间点 
	for(register int i=1;i<=n;i++){ //第二层枚举起点 
		for(register int j=1;j<=n;j++){ //第三层枚举终点 
			if(i!=j&&j!=k) d[i][j]=min(d[i][j],d[i][k]+d[k][j]); 
			//动态转移方程，在间接路径和直接路径中取最小值 
		}
	}
}
```





# 最长路

## SPFA(权值相反数建图)

```C++
SPFA
#include <bits/stdc++.h>
using namespace std;
int n,m,u,v,w,tot;
int dis[510010],vis[510010],head[510010];

struct node {
	int to,net,val;
} e[510010];

inline void add(int u,int v,int w) {
	e[++tot].to=v;
	e[tot].net=head[u];
	e[tot].val=w;
	head[u]=tot;
}
//链式前向星建边 
inline void spfa() {
	queue<int> q;
	for(register int i=1;i<=n;i++) dis[i]=20050206;
	dis[1]=0;
	vis[1]=1;
	q.push(1);
	while(!q.empty()) {
		int x=q.front();
		q.pop();
		vis[x]=0;
		for(register int i=head[x];i;i=e[i].net) {
			int v=e[i].to;
			if(dis[v]>dis[x]+e[i].val) {
				dis[v]=dis[x]+e[i].val;
				if(!vis[v]) {
					vis[v]=1;
					q.push(v);
				}
			}
		}
	}
}//正常跑最短路 

int main() {
	scanf("%d%d",&n,&m);
	for(register int i=1;i<=m;i++) {
		scanf("%d%d%d",&u,&v,&w);
		add(u,v,-w);//非常灵魂地存一个相反数 
	}
	spfa();
	if(dis[n]==20050206) puts("-1"); //到不了就-1 
	else printf("%d",-dis[n]);//记得存回来 
	return 0;
}
```

## 拓扑排序(有向无环图)

```c++
拓扑排序
#include<bits/stdc++.h>
using namespace std;
const int MAXN=2*5*1e4;
int n,m;
struct edge{
	int net,to,w;
}e[MAXN];
int head[MAXN],tot;
void add(int x,int y,int z){
	e[++tot].net=head[x];
	e[tot].to=y;
	e[tot].w=z;
	head[x]=tot;
}
//链式前向星建边 
bool v[MAXN];
//用来标记是否可以从1走到这个点
//因为是1到n，所以如果不能从1开始走
//说明不满足条件，没有这条最长路 
int ru[MAXN];
int ans[MAXN];
queue<int>q;
void toop(){
	for(register int i=1;i<=n;i++){
		if(ru[i]==0) q.push(i);
	}//入度为0的进队 
	while(!q.empty()){
		int x=q.front();
		q.pop();//出队 
		for(register int i=head[x];i;i=e[i].net){
			int y=e[i].to,z=e[i].w;
			ru[y]--;//入度-- 
			if(v[x]==true){
				ans[y]=max(ans[y],ans[x]+z);
				v[y]=true;
			}//如果这个节点能从1走到，说明它的边可以走
			//更新最长路 
			if(ru[y]==0) q.push(y);//进队 
		}
	}
}
int main(){
	scanf("%d%d",&n,&m);
	for(register int i=1;i<=m;i++){
		int u,v,w;
		scanf("%d%d%d",&u,&v,&w);
		add(u,v,w);
		ru[v]++;
	}//建边，入度++ 
	v[1]=true;//1肯定自己能走 
	ans[n]=-1;//初始值为-1，方便输出 
	toop();//拓扑排序求最长路 
	cout<<ans[n];
	return 0;
}
```

# 次短路

dist\[ i ][ 0 ]表示到点 i 的最短路 ， dist\[ i ][ 1 ]表示到点 i 的次短路

最短路何时更新：当dist\[ i ][ 0 ] > len(j) + val( j , i )时，直接更新最短路

何时更新次短路：  dist\[ i ][ 0 ] < len(j) + val( j , i ) < dist\[ i ][ 1 ]时，更新次短路

```c++
#include <iostream>
#include<bits/stdc++.h>
using namespace std;
#define INF 0x3f3f3f3f
typedef pair<int,int>P;
const int maxn = 100000 + 7;
struct Edge{
   int to,next,val;
}edge[maxn];
int n,m,head[maxn],dist[maxn][2],tot;
void addEdge(int a,int b,int c){
   edge[tot].to = b;edge[tot].val = c;edge[tot].next = head[a];head[a] = tot++;
}
void Dijkstra(int s){
    for(int i = 0;i<=n;i++)dist[i][0] = dist[i][1] = INF;
    dist[s][0] = 0;
    priority_queue<P,vector<P>, greater<P> >que;
    que.push(P(0,s));
    while(!que.empty()){
        P p = que.top();
        que.pop();
        if(p.first > dist[p.second][1])continue;
        for(int i = head[p.second];~i;i = edge[i].next){
            int d = p.first + edge[i].val;
             if(dist[edge[i].to][0] > d){//更新最短路
                swap(dist[edge[i].to][0] , d);//交换！！！
                que.push(P(dist[edge[i].to][0],edge[i].to));//注意d值已经被交换了
             }
             if(dist[edge[i].to][1] > d&&dist[edge[i].to][0] < d){//更新次短路
                dist[edge[i].to][1] = d;
                que.push(P(d,edge[i].to));
             }
        }
    }
}
int main()
{
    tot = 0;
    memset(head,-1,sizeof(head));
    scanf("%d%d",&n,&m);
    for(int i = 0;i<m;i++){
        int a,b,v;
        scanf("%d%d%d",&a,&b,&v);
        addEdge(a,b,v);
        addEdge(b,a,v);
    }
    int s,t;
    scanf("%d%d",&s,&t);
    Dijkstra(s);
    printf("%d %d\n",dist[t][0],dist[t][1]);
    return 0;
}
```

​                                         

# k短路

反向建边跑dij得到估值函数，A*优化，再正向bfs，算第k次到终点（注意如果起点等于终点按题目要求看是否k++）

```c++
#include <iostream>
#include<bits/stdc++.h>
using namespace std;
#define INF 0x3f3f3f3f
typedef long long LL;
typedef pair<LL,int> P;
const int maxn = 1000 + 7;
struct Edge{//正向边
    int to,next;
    LL val;
}edge[maxn*100];
struct Line{//反向边
    int to,next;
    LL val;
}line[maxn*100];
int n,m,s,e,tot,k,head[maxn],revhead[maxn];
int tot2;
bool vis[maxn];
LL dist[maxn];//保存终点到其他点的最短路
inline void addEdge(int a,int b,LL c){//正向建边
    edge[tot].to = b;edge[tot].next =  head[a];edge[tot].val = c;head[a] = tot++;
}
inline void AddEdge(int a,int b,LL c){//反向建边
   line[tot2].to = b;line[tot2].next = revhead[a];line[tot2].val = c;revhead[a] = tot2++;
}
struct Node{//BFS保存状态
   int to;
   LL cost;
   bool operator <(const Node&another)const{//排序规则按照估价函数大小由小到大
        return cost + dist[to] > another.cost + dist[another.to];//估价= 当前 + 到终点最短
   }
   Node(int a,LL c):to(a),cost(c) {}
};
inline void Dijkstra(int a){//最短路
   dist[a] = 0;
   priority_queue<P,vector<P>,greater<P> >que;
   que.push(P(0,a));
   while(!que.empty()){
       P p = que.top();
       que.pop();
       if(vis[p.second])continue;
       vis[p.second] = 1;
       LL num = p.first;
       for(int i = revhead[p.second];~i;i = line[i].next){//跑反向边
           if(!vis[line[i].to]&&dist[line[i].to] > num + line[i].val){
               dist[line[i].to] = num + line[i].val;
               que.push(P(dist[line[i].to],line[i].to));
           }
       }
   }
}
inline LL BFS(int a){//BFS
   priority_queue<Node> que;
   que.push(Node(a,0));
   while(!que.empty()){
      Node node = que.top();
      que.pop();
      if(node.to==e){//到达终点次数
         k--;
         if(k==0){
            return node.cost;
         }
      }
      for(int i = head[node.to];~i;i = edge[i].next){//扩散（跑反向边）
           que.push(Node(edge[i].to,node.cost + edge[i].val));
      }
   }
   return -1;
}
int main()
{
    while(scanf("%d%d",&n,&m)!=EOF){
        tot = tot2 = 0;
        memset(dist,INF,sizeof(dist));
        memset(vis,0,sizeof(vis));
        memset(head,-1,sizeof(head));
        memset(revhead,-1,sizeof(revhead));
        for(int i = 0;i<m;i++){
            int a,b;
            LL v;
            scanf("%d%d%lld",&a,&b,&v);
            addEdge(a,b,v);
            AddEdge(b,a,v);
        }
        scanf("%d%d%d",&s,&e,&k);//起点 + 终点 + k短路
        Dijkstra(e);
        if(dist[s]==INF){
            printf("-1\n");
            continue;
        }
        if(s==e)k++;//起点终点重合，排除0距离
        LL ans = BFS(s);
        printf("%lld\n",ans);
    }
    return 0;
}
```

