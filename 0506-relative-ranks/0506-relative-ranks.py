class Solution:
    def findRelativeRanks(self, score: List[int]) -> List[str]:
        sc=[i for i in score]
        sc.sort(reverse=True)
        ans=[]
        for i in score:
            if sc.index(i)==0:
                ans.append("Gold Medal")
            elif sc.index(i)==1:
                ans.append("Silver Medal")
            elif sc.index(i)==2:
                ans.append("Bronze Medal")
            else:
                ans.append(str(sc.index(i)+1))
        return ans