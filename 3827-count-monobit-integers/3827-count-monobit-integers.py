class Solution:
    def countMonobit(self, n: int) -> int:
        temp = [bin(i)[2:] for i in range(n+1)]
        print(temp)
        count = 0
        for i in temp:
            if i.count('0')==0 or i.count('1')==0:
                count+=1
        return count