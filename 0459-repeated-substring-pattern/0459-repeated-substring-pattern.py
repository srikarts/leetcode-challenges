class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        return s in (s+s)[1:-1]
        # if len(s)==1:
        #     return False
        # if len(set(s))==1:
        #     return True   
        # ans=''
        # for i in range(len(s)-1):
        #     if s[i]!=s[i+1] and s[i] not in ans:
        #         ans+=s[i]
        # if ans:
        #     temp = len(s)//len(ans)
        # if ans*temp==s:
        #     return True
        # else:
        #     return False
        # if len(s)%temp==0:
        #     return True
        # else:
        #     return False

