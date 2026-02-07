class Solution:
    def minimumDeletions(self, s: str) -> int:
        b_count = 0
        deletions=0
        for i in s:
            if i=='b':
                b_count+=1
            else:
                deletions = min(b_count,deletions+1)
            
        return deletions

        