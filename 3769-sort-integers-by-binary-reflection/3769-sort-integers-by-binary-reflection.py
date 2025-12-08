class Solution:
    def sortByReflection(self, nums: List[int]) -> List[int]:
        di = {}
        res = []
        for i in nums:
            di[i] = int(bin(i)[2:][::-1],2)
        temp = sorted(di.items(),key=lambda x:(x[1],x[0]))
        for i,j in temp:
            res+=[i]*nums.count(i)
        return res
            
            
            
        