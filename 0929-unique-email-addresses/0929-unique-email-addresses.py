class Solution:
    def numUniqueEmails(self, emails: List[str]) -> int:
        res = []
        for i in emails:
            if i not in res:
                ans = ''
                temp = i.split('@')
                if '+' in temp[0]:
                    temp[0] = temp[0][:temp[0].index('+')]
                for i in temp[0]:
                    if i != '.':
                        ans+=i
                if ans+'@'+temp[1] not in res:
                    res.append(ans+'@'+temp[1])
        return len(res)
                
                