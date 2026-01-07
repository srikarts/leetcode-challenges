class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        emp=''
        for i in digits:
            emp+=str(i)
        return [int(i) for i in str(int(emp)+1)]