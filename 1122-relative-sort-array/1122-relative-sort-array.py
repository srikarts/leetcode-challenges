class Solution:
    def relativeSortArray(self, arr1: List[int], arr2: List[int]) -> List[int]:
        ans = []
        ans2 = []
        for i in arr1:
            if i in arr2:
                ans.append(i)
            else:
                ans2.append(i)
        temp = sorted(ans, key=lambda x:arr2.index(x))
        if ans2:
            return temp+sorted(ans2)
        else:
            return temp
        