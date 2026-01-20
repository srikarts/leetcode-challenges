class Solution:
    def numberGame(self, nums: List[int]) -> List[int]:
        nums.sort()
        ans=[]
        for i in range(0,len(nums),2):
            ans+=nums[i:i+2][::-1]
        return ans