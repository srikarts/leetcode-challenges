class Solution:
    def arrayRankTransform(self, arr: List[int]) -> List[int]:
        temp = sorted(set(arr))
        ans = {}
        res = []
        j = 1
        for i in temp:
            ans[i]=j
            j+=1
        for x in arr:
            res.append(ans[x])
        return res

        