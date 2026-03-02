class Solution:
    def trimTrailingVowels(self, s: str) -> str:
        vowels = 'aeiou'
        s = s[::-1]
        for i in range(len(s)):
            if s[i] not in vowels:
                return s[i:][::-1]
        return ''
                
        
            
        # return s.rstrip('aeiou')
                
        
                
            
            
                
        
                
                    
            
            
            