class Solution:
    def countElements(self, nums: List[int]) -> int:
        if len(set(nums))!=1:
            return len(nums)-nums.count(min(nums))-nums.count(max(nums))
        else:
            return 0