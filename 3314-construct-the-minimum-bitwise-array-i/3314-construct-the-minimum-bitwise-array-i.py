class Solution:
    def minBitwiseArray(self, nums: List[int]) -> List[int]:
        def valid(s):
            for j in range(1,s):
                if j | (j+1) == s:
                    return j
            return -1
        ans = []
        for i in nums:
            ans.append(valid(i))
        return ans

