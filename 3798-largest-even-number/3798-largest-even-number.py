class Solution:
    def largestEven(self, s: str) -> str:
        while s and s[-1]!='2':
            s=s[:-1]
        return s