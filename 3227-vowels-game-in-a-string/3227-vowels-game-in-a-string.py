class Solution:
    def doesAliceWin(self, s: str) -> bool:
        for i in 'aeiou':
            if i in s:
                return True
        return False

        