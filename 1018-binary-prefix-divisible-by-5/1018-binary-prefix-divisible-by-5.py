class Solution:
    def prefixesDivBy5(self, nums: List[int]) -> List[bool]:
        res = []
        temp = ''
        for i in nums:
            temp+=str(i)
            if int(temp,2)%5==0:
                res.append(True)
            else:
                res.append(False)
        return res