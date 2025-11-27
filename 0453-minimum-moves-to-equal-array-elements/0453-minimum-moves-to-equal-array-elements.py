class Solution:
    def minMoves(self, nums: List[int]) -> int:
        nums = sorted(nums)
        res = 0
        for i in range(len(nums)):
            res+=nums[i]-nums[0]
        return res

        