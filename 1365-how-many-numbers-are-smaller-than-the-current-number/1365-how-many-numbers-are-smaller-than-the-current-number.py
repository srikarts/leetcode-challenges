class Solution:
    def smallerNumbersThanCurrent(self, nums: List[int]) -> List[int]:
        temp = sorted(nums)
        ans = []
        for i in range(len(nums)):
            ans.append(len(temp[:temp.index(nums[i])]))
        return ans