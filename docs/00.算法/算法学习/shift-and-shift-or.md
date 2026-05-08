---
title: shift-and-shift-or
date: 2025-05-08 20:00:00
categories:
  - 算法
tags:
  - 算法
---

# shift-and,shift-or算法

维护一个字符串的集合，集合中的每个字符串既是模式串P的前缀，同时也是已读入文本的后缀。每读入一个新的文本字符，该算法即用位并行的方法更新集合。该集合用一个位掩码D=dm......d1来表示。

## shift-and算法

   p为模式串(长度为m)，t为文本串。

​	D的第j位被置为1当且仅当p<sub>0</sub>...p<sub>j</sub>是t<sub>0</sub>...t<sub>j</sub>的后缀。当d<sub>m</sub>为1时，就表示有一个成功的匹配。

   当读入下一个字符t<sub>i+1</sub>时，需要重新计算新的位掩码D’。D’的第j+1位为1的当且仅当D的第j位为1的（即p<sub>0</sub>.....p<sub>j</sub>是t<sub>0</sub>.....t<sub>j</sub>的后缀）并且t<sub>i+1</sub>与p<sub>i+1</sub>相等。利用位并行，D’的计算很容易在常数时间内完成。

​    shift-and算法首先构造一个表B，记录字母表中每个字符的位掩码b<sub>m</sub>.....b<sub>0</sub>.如果p<sub>j</sub> = c,则掩码B[c] 的第j位被置为1，否则为0。

​    首先置D = 0<sup>m </sup>（就是m个0的意思），对于每个新读入的文本字符t<sub>i+1</sub>，可以用如下公式对D进行更新：

​                 D’ = （（ D<<1 | 0<sup>m-1</sup>1 ) & B[t<sub>i+1</sub>] ) ;

其中D<<1是为满足p<sub>i</sub>为1，p<sub>i+1</sub>=t<sub>i+1</sub>可由B[t<sub>i+1</sub>]的第i+1位得到，所以二者相&。我们要保证当字符t<sub>i</sub> 在p<sub>0</sub> 处出现时，D[0] 一定要等于1，而D 向左移位后最低位是0,所以要D<<1|1。

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

void preprocess(unsigned int B[], string T, int n)
{
    unsigned int shift=1;//从0~n-1将模式串在B中初始化
    for (int i=0; i<n; i++) {
        B[T[i]] |= shift;
        shift <<= 1;
    }
}

vector<int> and_match(string S, string T)
{
    int m=S.length(), n=T.length();
    unsigned int B[256], D=0, mask;//D初始化为00000000000
    for (int i=0; i<256; i++)
        B[i] = 0;
    preprocess(B, T, n);
    vector<int> res;

    mask  = 1 << (n - 1);//dm为1
    for (int i=0; i<m; i++) {
        D = (D << 1 | 1) & B[S[i]];
        if (D & mask)//满足说明完成一次匹配，将起始点加入
            res.push_back(i-n+1);
    }

    return res;
}

int main()
{
    string S, T;//T为模式串，S为文本串
    cin >> S >> T;
    vector<int> res=and_match(S,T);
    for (vector<int>::iterator it=res.begin(); it!=res.end(); ++it)
        cout << *it << endl;
    return 0;
}
```

## shift-or算法

如果将Shift-And 中核心的“与” 运算改为“或” 运算，可以节省D<<1|1这一个附加的“或1” 运算。这正是Shift-Or 所改进的地方。
Shift-Or 与Shift-And 的唯一区别在于，在Shift-Or 中，“有效位” 是通过0（而不是1）来标识。

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

void preprocess(unsigned int B[], string T, int n)
{
    unsigned int shift=1;
    for (int i=0; i<n; i++) {
        B[T[i]] &= ~shift; // 有效位设为0
        shift <<= 1;
    }
}

vector<int> or_match(string S, string T)
{
    int m=S.length(), n=T.length();
    unsigned int B[256], D=~0, mask;//D初始化为11111111111111
    for (int i=0; i<256; i++)
        B[i] = ~0; // B[i]中每一位都初始化为1
    preprocess(B, T, n);
    vector<int> res;

    mask  = ~(1 << (n - 1));
    for (int i=0; i<m; i++) {
        D = (D << 1) | B[S[i]];
        if (~(D | mask))
            res.push_back(i-n+1);
    }

    return res;
}

int main()
{
    string S, T;
    cin >> S >> T;
    vector<int> res=or_match(S,T);
    for (vector<int>::iterator it=res.begin(); it!=res.end(); ++it)
        cout << *it << endl;
    return 0;
}
```

