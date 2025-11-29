class Solution:
    def minOperations(self, nums: List[int], k: int) -> int:
        # count = 0
        # while sum(nums)%k!=0:
        #     temp = nums.index(max(nums))
        #     nums[temp] = max(nums)-1
        #     count+=1
        return sum(nums)%k