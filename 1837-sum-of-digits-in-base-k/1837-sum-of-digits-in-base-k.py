class Solution:
    def sumBase(self, n: int, k: int) -> int:
        ans = []
        while n!=0:
            ans.append(n%k)
            n = n//k
        return sum(ans)