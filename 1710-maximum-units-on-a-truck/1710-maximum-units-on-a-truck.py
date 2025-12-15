class Solution:
    def maximumUnits(self, boxTypes: List[List[int]], truckSize: int) -> int:
        temp = sorted(boxTypes, key = lambda x: x[1], reverse = True)
        ans = 0
        for i in temp:
            if truckSize>0:
                if i[0]>truckSize:
                    ans+=truckSize * i[1]
                else:
                    ans += i[0]*i[1]
                truckSize-=i[0]
        return ans