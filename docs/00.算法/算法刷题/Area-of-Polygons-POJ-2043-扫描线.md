---
title: Area-of-Polygons-POJ-2043-扫描线
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# Area of Polygons POJ - 2043 扫描线
## 题意
方格纸上的简单多边形所占的方格数。
## 思路
对于简单多边形的各边，用一条平行于y轴的宽度为1的扫描线，自左向右扫一遍，每两条边被扫描线扫到的4个交点之间的距离就是方格的数量，若有重合的小方格注意减去。
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
using namespace std;
const long long inf = 0x3f3f3f3f;
#define ll long long
const int MAXN = 10005;
struct Point {
	double x, y;
	Point(double x = 0, double y = 0) :x(x), y(y) {}
};
typedef Point Vector;
Vector operator + (Vector A, Vector B) {
	return Vector(A.x + B.x, A.y + B.y);
}
Vector operator - (Point A, Point B) {
	return Vector(A.x - B.x, A.y - B.y);
}
Vector operator * (Vector A, double p) {
	return Vector(A.x * p, A.y * p);
}
Vector operator / (Vector A, double p) {
	return Vector(A.x / p, A.y / p);
}
bool operator < (const Point& a, const Point& b) {
	if (a.x == b.x)
		return a.y < b.y;
	return a.x < b.x;
}
struct Line
{
	Point p;
	Vector v;
	Line() {};
	Line(Point a, Point b)
	{
		if (b<a)
			swap(a, b);
		p = a;
		v = b - a;
	}
	bool operator <(const Line& b)const
	{
		if (p.x == b.p.x)
			return p.y < b.p.y;
		return p.x < b.p.x;
	}
};
struct Scan
{
	double ly, ry;
	Scan(double ly = 0, double ry = 0) :
		ly(ly), ry(ry) {};
	bool operator < (const Scan& b)const
	{
		if (ly == b.ly)
			return ry < b.ry;
		return ly < b.ly;;
	}
};
Point p[105];
Line l[105];
Scan s[210];
int m,cnt,ans;
int lx=2005, rx=-2005;
double cal_y(const Line& l, int x)
{
	return l.p.y + l.v.y * (x - l.p.x) / l.v.x;
}
void cal_s()
{
	sort(s + 1, s + 1 + cnt);
	int maxn = -2005;
	int up, down;
	for (int i = 1; i < cnt; i+=2)
	{
		down = floor(s[i].ly);
		up = ceil(max(s[i].ry,s[i + 1].ry));
		ans += up - down;
		if (down < maxn)//减去重复计算的面积
			ans -= (maxn - down);
		maxn = up;
	}
}
int main()
{
	while (scanf("%d", &m) != EOF && m)
	{
		ans = 0;
		for (int i = 1; i <= m; i++)
		{
			scanf("%lf%lf", &p[i].x, &p[i].y);
			lx = min(lx,(int) p[i].x);
			rx=max(rx,(int) p[i].x);
		}
		p[m+1] = p[1];
		for (int i = 1; i <= m; i++)
		{
			l[i] = Line(p[i], p[i+1]);
		}
		for (int i = lx; i < rx; i++)
		{
			cnt = 0;
			for (int j = 1; j <= m; j++)
			{
				if (l[j].p.x <= i && l[j].p.x + l[j].v.x >= i + 1)
				{
					cnt++;
					s[cnt].ly = cal_y(l[j], i);
					s[cnt].ry = cal_y(l[j], i + 1);
					if (s[cnt].ly > s[cnt].ry)
						swap(s[cnt].ly, s[cnt].ry);
				}
			}
			cal_s();
		}
		printf("%d\n", ans);
	}
	return 0;

}
```