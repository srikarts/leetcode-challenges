class Solution:
    def scoreDifference(self, nums: List[int]) -> int:
        p1,p2 = 0,0
        temp = True
        for i in range(len(nums)):
            if nums[i]%2!=0:
                temp = not temp
            if (i+1)%6==0:
                temp = not temp

            if temp==True:
                p1+=nums[i]
            elif temp==False:
                p2+=nums[i]
        return p1-p2
                

