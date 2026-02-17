class Solution:
    def firstUniqueFreq(self, nums: List[int]) -> int:
        temp = {}
        for i in nums:
            if i not in temp.keys():
                temp[i]=1
            else:
                temp[i]+=1
        res = list(temp.values())
        res2 = {}
        for i in res:
            if i not in res2.keys():
                res2[i]=1
            else:
                res2[i]+=1
        print(res2)
        ans = -1
        for i in nums:
            if res2[temp[i]]==1:
                return i
        return ans
                
        