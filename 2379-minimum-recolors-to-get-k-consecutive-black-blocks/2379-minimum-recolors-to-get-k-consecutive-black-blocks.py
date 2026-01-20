class Solution:
    def minimumRecolors(self, blocks: str, k: int) -> int:
        res = []
        for i in range(len(blocks)):
            temp = blocks[i:k+i]
            if len(temp)==k:
                res.append(temp.count('W'))
        return min(res)
