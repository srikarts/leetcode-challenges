class Solution:
    def construct2DArray(self, original: List[int], m: int, n: int) -> List[List[int]]:
        if m*n == len(original):
            res = []
            counter = 0
            for i in range(m):
                temp = []
                for i in range(n):
                    temp.append(original[counter])
                    counter+=1
                res.append(temp)
            return res
        else:
            return []