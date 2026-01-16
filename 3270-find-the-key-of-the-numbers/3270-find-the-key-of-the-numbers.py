class Solution:
    def generateKey(self, num1: int, num2: int, num3: int) -> int:
        num1 = str(num1).zfill(4)
        num2 = str(num2).zfill(4)
        num3 = str(num3).zfill(4)
        key = ''
        for i in range(4):
            key+=str(min(int(num1[i]),int(num2[i]),int(num3[i])))
        return int(key)

        