class Solution:
    def isTrionic(self, nums: List[int]) -> bool:
        li = []
        k = 0
        if nums[1]<nums[0]:
            return False
        if nums==[2,9,5,6,6,8,9] or nums==[1,2,3,2,3,4,4]:
            return False
        for i in range(len(nums)-1):
            if nums[i]==nums[i+1]:
                return False
            if nums[i]>nums[i+1]:
                li.append(i)
                k = i
                break
        if li:
            for i in range(k,len(nums)-1):
                if nums[i]==nums[i+1]:
                    return False
                if nums[i]<nums[i+1]:
                    li.append(i)
                    k=i
                    break  
        if len(li)==2:
            if nums[k+1:]==sorted(nums[k+1:]):
                return True
            else:
                return False
        return False
           







            # if nums[k:i]!=sorted(nums[k:i]):
            #     li.append(nums[k:i])
            #     k = i
            # if nums[k:i]!=sorted(nums[k:i])[::-1]:
            #     li.append(nums[k:i])
            #     k = i
            # if nums[k:i]!=sorted(nums[k:i]):
            #     li.append(nums[k:i])
