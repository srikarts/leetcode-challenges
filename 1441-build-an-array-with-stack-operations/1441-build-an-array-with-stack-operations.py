class Solution:
    def buildArray(self, target: List[int], n: int) -> List[str]:
        ans = []
        ops = []
        for i in range(1,n+1):
            ops.append('Push')
            if i in target:
                ans.append(i)
            else:
                ops.append('Pop')
            if ans==target:
                return ops
        print(ans)
        print(ops)