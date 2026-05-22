import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CommentThread({ planId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => { loadComments(); }, [planId]);

  const loadComments = async () => {
    const data = await base44.entities.Comment.filter({ plan_id: planId }, '-created_date', 50);
    setComments(data);
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Comment.create({
        plan_id: planId,
        content: newComment,
        author_email: user?.email || '',
        author_name: user?.full_name || user?.email || 'Unknown',
        target_type: 'plan',
        resolved: false,
      });
      setNewComment('');
      loadComments();
    } finally { setPosting(false); }
  };

  const resolveComment = async (id) => {
    await base44.entities.Comment.update(id, { resolved: true });
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c));
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-semibold">Comments & Annotations</p>
        <span className="text-xs text-muted-foreground">({comments.filter(c => !c.resolved).length} open)</span>
      </div>

      {/* New comment */}
      <div className="bg-card border border-border rounded-lg p-3 space-y-2">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment, annotation, or flag an issue..."
          className="bg-background border-border resize-none h-20 text-sm"
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) postComment(); }}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={postComment} disabled={posting || !newComment.trim()} className="gap-1.5">
            <Send className="w-3 h-3" /> {posting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">No comments yet. Be the first to annotate this plan.</div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className={`bg-card border rounded-lg p-4 ${comment.resolved ? 'border-border opacity-50' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                    {(comment.author_name?.[0] || '?').toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-foreground">{comment.author_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(comment.created_date).toLocaleString()}</span>
                  {comment.resolved && <span className="text-xs text-success flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />Resolved</span>}
                </div>
                {!comment.resolved && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => resolveComment(comment.id)}>
                    Resolve
                  </Button>
                )}
              </div>
              <p className="text-sm text-foreground mt-2 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}