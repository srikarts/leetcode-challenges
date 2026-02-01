class Solution:
    def minimumCost(self, nums: List[int]) -> int:
        temp = nums[0]
        ans = sorted(nums[1:])
        return temp+ans[0]+ans[1]