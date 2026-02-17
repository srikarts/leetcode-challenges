class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        di = {}
        for i in set(nums):
            di[i] = []
        for i in range(len(nums)):
            di[nums[i]].append(i)
        
        for i in di.keys():
            if len(di[i])>=2:
                for j in range(len(di[i])-1):
                    if abs(di[i][j]-di[i][j+1])<=k:
                        return True
        return False


        # for i in range(len(nums)):
        #     for j in range(i+1,len(nums)):
        #         if nums[i]==nums[j] and abs(i-j)<=k:
        #             return True
        # return False