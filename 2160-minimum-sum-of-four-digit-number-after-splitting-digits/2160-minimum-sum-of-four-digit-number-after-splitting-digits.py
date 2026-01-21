class Solution:
    def minimumSum(self, num: int) -> int:
        temp = list(str(num))
        temp.sort()
        return int(temp[0]+temp[2])+int(temp[1]+temp[3])
        
        