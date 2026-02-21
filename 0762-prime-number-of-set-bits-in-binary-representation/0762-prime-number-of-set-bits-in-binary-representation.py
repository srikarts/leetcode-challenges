class Solution:
    def countPrimeSetBits(self, left: int, right: int) -> int:
        def checkprime(n):
            temp = bin(n)[2:].count('1')
            if temp<2:
                return False
            for i in range(2,int(temp**0.5)+1):
                if temp%i==0:
                    return False
            return True

        res = 0
        for i in range(left,right+1):
            if checkprime(i)==True:
                res+=1
        return res