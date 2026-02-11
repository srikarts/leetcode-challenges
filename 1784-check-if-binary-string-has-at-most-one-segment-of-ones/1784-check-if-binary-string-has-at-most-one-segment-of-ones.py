class Solution:
    def checkOnesSegment(self, s: str) -> bool:
        count = 0
        if '0' in s:
            temp = s.index('0') 
            for i in s[temp:]:
                if i=='1':
                    return False
            else:
                return True
        return True