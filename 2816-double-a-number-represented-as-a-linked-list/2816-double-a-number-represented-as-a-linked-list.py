# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def __init__(self):
        self.hed = None

    def doubleIt(self, head: Optional[ListNode]) -> Optional[ListNode]:
        ptr = head
        while ptr:
            if self.hed is None:
                self.hed = ListNode(ptr.val,None)
            else:
                self.hed = ListNode(ptr.val,self.hed)
            ptr = ptr.next
        ptr2 = self.hed

        head3 = None
        carry = 0
        while ptr2:
            value = ((ptr2.val*2)+carry)%10
            carry = ((ptr2.val*2)+carry)//10
            if head3 is None:
                head3 = ListNode(value,None)
            else:
                head3 = ListNode(value,head3)
            ptr2=ptr2.next
        if carry:
            head3 = ListNode(carry,head3)
        return head3

