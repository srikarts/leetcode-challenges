class Solution:
    def mergeSimilarItems(self, items1: List[List[int]], items2: List[List[int]]) -> List[List[int]]:
        di = {}
        for i in items1:
            di[i[0]]=i[1]
        for j in items2:
            if j[0] in di.keys():
                di[j[0]]+=j[1]
            else:
                di[j[0]]=j[1]
        ret = []
        ans = {key:di[key] for key in sorted(di)}
        for item in ans.keys():
            ret.append([item,ans[item]])
        return ret