class Solution:
    def addToArrayForm(self, num: List[int], k: int) -> List[int]:
        sys.set_int_max_str_digits(100000)
        num = list(map(str,num))
        temp = ''.join(num)
        ans = []
        for i in str(int(temp)+k):
            ans.append(int(i))
        return ans