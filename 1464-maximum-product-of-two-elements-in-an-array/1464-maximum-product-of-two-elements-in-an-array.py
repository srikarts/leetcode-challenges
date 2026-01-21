class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        temp1 = max(nums)
        nums.remove(temp1)
        temp2 = max(nums)
        nums.remove(temp2)
        return (temp1-1)*(temp2-1)

        

            