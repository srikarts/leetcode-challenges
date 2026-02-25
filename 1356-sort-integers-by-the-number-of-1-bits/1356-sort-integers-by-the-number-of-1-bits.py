class Solution:
    def sortByBits(self, arr: List[int]) -> List[int]:
        di={}
        for i in arr:
            b=bin(i)[2:]
            if b.count('1') not in di.keys():
                di[b.count('1')]=[i]
            else:
                di[b.count('1')].append(i)
        ans=[]
        di=sorted(di.items())
        for i,j in di:
            j.sort()
            ans+=j
        return ans