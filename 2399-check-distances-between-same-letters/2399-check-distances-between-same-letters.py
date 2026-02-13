class Solution:
    def checkDistances(self, s: str, distance: List[int]) -> bool:
        temp = {}
        k = 0
        for i in 'abcdefghijklmnopqrstuvwxyz':
            temp[i]=distance[k]
            k+=1
        di = {}
        for i,j in enumerate(s):
            di[i] = j
        di = sorted(di.items(), key = lambda x:x[1])

        for val in range(0,len(di),2):
            if di[val][1] in temp.keys():
                if di[val+1][0]-di[val][0]!=temp[di[val][1]]+1:
                    return False
        return True