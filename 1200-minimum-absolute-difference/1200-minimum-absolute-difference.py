class Solution:
    def minimumAbsDifference(self, arr: List[int]) -> List[List[int]]:
        min_abs = abs(arr[0]-arr[1])
        arr.sort()
        for i in range(1,len(arr)-1):
            min_abs = min(min_abs,abs(arr[i]-arr[i+1]))
        ans = []
        print(min_abs)
        for i in range(len(arr)-1):
            if abs(arr[i]-arr[i+1])==min_abs:
                ans.append([arr[i],arr[i+1]])
        return ans