class Solution:
    def minimumAverage(self, nums: List[int]) -> float:
        averages = []
        for _ in range(len(nums)//2):
            small = min(nums)
            large = max(nums)
            nums.remove(small)
            nums.remove(large)
            averages.append((small+large)/2)
        return min(averages)