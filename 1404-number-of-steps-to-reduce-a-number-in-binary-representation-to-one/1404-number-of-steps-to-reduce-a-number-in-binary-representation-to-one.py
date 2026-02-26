class Solution:
    def numSteps(self, s: str) -> int:
        temp = int(s,2)
        count = 0
        while temp!=1:
            if temp%2!=0:
                temp+=1
                count+=1
            else:
                temp = temp//2
                count+=1
        return count