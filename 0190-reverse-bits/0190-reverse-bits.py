class Solution:
    def reverseBits(self, n: int) -> int:
        b=bin(n)[2:].zfill(32)
        ans=0
        for i in range(len(b)):
            ans+=int(b[i])*(2**i)
        return ans

        # temp = bin(n)[2:]
        # print(temp)
        # print(temp[::-1])
        # return int(temp[::-1],2)
        