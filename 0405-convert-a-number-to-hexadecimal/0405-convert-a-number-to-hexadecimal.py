class Solution:
    def toHex(self, num: int) -> str:
        di = {10:'a',11:'b',12:'c',13:'d',14:'e',15:'f'}
        ans = ''
        if num<0:
            num = num & 0xffffffff
        elif num==0:
            return '0'
        while num>0:
            rem = num%16
            if rem in di.keys():
                ans+=di[rem]
            else:
                ans+=str(rem)
            num = num//16
        return ans[::-1]