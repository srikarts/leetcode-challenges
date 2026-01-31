class Solution:
    def nextGreatestLetter(self, letters: List[str], target: str) -> str:
        # temp = [ord(i) for i in letters]
        # if ord(target)<temp[0]:
        #     return letters[0]
        # elif ord(target) in temp:
        #     return letters[letters.index(target)+1]
        # elif ord(target)>=temp[-1]:
        #     return letters[0]
        
        for i in letters:
            if target<i:
                return i
        else:
            return letters[0]