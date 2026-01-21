class Solution:
    def maxWidthOfVerticalArea(self, points: List[List[int]]) -> int:
        ans = []
        for i in points:
            ans.append(i[0])
        ans.sort()
        res = 0
        for i in range(len(ans)-1):
            res = max(res,abs(ans[i]-ans[i+1]))
        return res