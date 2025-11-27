class Solution:
    def checkPowersOfThree(self, n: int) -> bool:
        temp = [1]
        for i in range(1,17):
            temp.append(pow(3,i))
        
        for i in range(1,len(temp)+1):
            for j in combinations(temp,i):
                if sum(j)==n:
                    return True
        return False


        # i = 1
        # while n!=0:
        #     for i in range(1,len(temp)):
        #         if temp[i]>n and temp[i-1]<=n:
        #             n -= temp[i-1]

        