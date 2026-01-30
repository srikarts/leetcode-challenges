class Solution:
    def minOperations(self, nums: List[int], k: int) -> int:
        counter = 0
        collection = [i for i in range(1,k+1)]
        temp = nums[::-1]
        for i in range(len(temp)):
            counter+=1 
            if temp[i] in collection:
                collection.remove(temp[i])
            if len(collection)==0:
                return counter

        # while collection.count(True)!=k:
            # for i in nums[::-1]:
            #     if i in collection:
            #         collection[collection.index(i)]=True
            #         ans.append(i)
            #         counter+=1
        #         else:
        #             counter+=1
        #     if collection==sorted(ans):
        #         return counter
        # return counter

        
            
                
