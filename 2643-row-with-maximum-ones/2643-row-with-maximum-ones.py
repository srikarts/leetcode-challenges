class Solution:
    def rowAndMaximumOnes(self, mat: List[List[int]]) -> List[int]:
        val = []
        for i in mat:
            val.append(i.count(1))
        temp = val.index(max(val))
        return [temp,max(val)]
        # for row in range(len(mat)):
        #     val[row]=mat[row].count(1)
        # temp = list(val.keys())
        # for i,j in val.items():
        #     if j==max(temp):
        #         return [i,j]
        
        