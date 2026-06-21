class Solution:
    def maxIceCream(self, costs: List[int], coins: int) -> int:
        costs.sort()
        counter = 0
        if costs[0]<=coins:
            for i in range(len(costs)):
                if costs[i]<=coins:
                    coins-=costs[i]
                    counter+=1
                else:
                    return counter
            return counter
        else:
            return 0