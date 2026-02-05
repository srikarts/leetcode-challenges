class Solution:
    def constructTransformedArray(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = []
        if n==1:
            return nums
        for i in range(len(nums)):
            # if nums[i]>=0:
            temp = nums[(i+nums[i])%n]
            ans.append(temp)
            # if nums[i]<0:
            #     temp = i+nums[i]
            #     ans.append(nums[temp])
        return ans

            