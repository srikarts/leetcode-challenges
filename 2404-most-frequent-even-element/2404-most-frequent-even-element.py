class Solution:
    def mostFrequentEven(self, nums: List[int]) -> int:
        nums.sort()
        temp = [i for i in nums if 1 & i == 0]
        if not temp:
            return -1
        ans = Counter(temp)
        vals = max(list(ans.values()))
        for i in ans.keys():
            if ans[i]==vals:
                return i
        return -1