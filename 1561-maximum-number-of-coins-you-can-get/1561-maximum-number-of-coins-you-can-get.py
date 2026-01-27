class Solution:
    def maxCoins(self, piles: List[int]) -> int:
        piles.sort()
        ans = 0
        j = -2        
        pile2 = piles[len(piles)//3:]
        for i in range(len(piles)//3):
            ans+=pile2[j]
            j-=2
        return ans
            

            
            


