class Solution:
    def countValidWords(self, sentence: str) -> int:
        temp = sentence.split(' ')
        ans = []
        for i in temp:
            if i!='':
                ans.append(i)
        def is_valid(word):
            hyphen_count = 0
            punctuation_count = 0
            
            for i, ch in enumerate(word):
                if ch.isdigit():
                    return False
                
                if not (ch.islower() or ch == '-' or ch in '!.,'):
                    return False
            
                if ch == '-':
                    hyphen_count += 1
                    
                    if hyphen_count > 1:
                        return False
                    
                    if i == 0 or i == len(word) - 1:
                        return False
                    
                    if not (word[i - 1].islower() and word[i + 1].islower()):
                        return False
                
                if ch in '!.,':
                    punctuation_count += 1
                    
                    if punctuation_count > 1:
                        return False
                    
                    if i != len(word) - 1:
                        return False
            
            return True


        res = 0
        for i in ans:
            if is_valid(i):
                res+=1
        return res






            # di = {'chars':0,'nums':0,'sym':0}
            # for val in i:
            #     if ord(i) in range(97,123):
            #         di[chars]+=1
            #     elif ord(i) in range(48,58):
            #         di[nums]+=1
            #     elif ord(i) in [33,44,45,46]:
            #         di[sym]+=1
            # if di[nums]==0 and di[sym]==1:
            #     if i.startswith()
        
