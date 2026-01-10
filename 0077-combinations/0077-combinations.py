class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        ans = [i for i in range(1,n+1)]
        # res = list(combinations(ans,k))
        temp = []
        for i in combinations(ans,k):
            temp.append(i)
        return temp