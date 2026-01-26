class Solution:
    def minimumDifference(self, nums: List[int], k: int) -> int:
        temp = sorted(nums)
        ans = []
        for i in range(len(nums)):
            temp1 = temp[i:i+k]
            if len(temp1)==k:
                ans.append(max(temp1)-min(temp1))
        return min(ans)