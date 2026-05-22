import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Clock, Calendar, Shield, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function Approvals() {
  const { user } = useOutletContext() || {};
  const [plans, setPlans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject' | 'dba_approve'
  const [scheduleAt, setScheduleAt] = useState('');
  const [targetEnv, setTargetEnv] = useState('staging');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [plansData, projectsData] = await Promise.all([
        base44.entities.DBPlan.list('-created_date', 100),
        base44.entities.Project.list('-created_date', 50),
      ]);
      setPlans(plansData);
      setProjects(projectsData);
    } finally { setLoading(false); }
  };

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const dbaReviewPlans = plans.filter(p => p.status === 'dba_review');
  const pendingApprovalPlans = plans.filter(p => p.status === 'pending_approval');
  const scheduledPlans = plans.filter(p => ['approved', 'scheduled', 'executing'].includes(p.status));

  const handleDBAApprove = async () => {
    setSaving(true);
    try {
      await base44.entities.DBPlan.update(selectedPlan.id, { status: 'dba_approved', dba_notes: notes });
      await base44.entities.AuditEntry.create({
        project_id: selectedPlan.project_id, plan_id: selectedPlan.id,
        action: 'DBA Approved', actor_email: user?.email, actor_role: user?.role,
        details: notes,
      });
      toast.success('DBA review approved');
      setSelectedPlan(null); setAction(null); setNotes('');
      loadData();
    } finally { setSaving(false); }
  };

  const handleApprove = async () => {
    if (!scheduleAt) { toast.error('Please set a scheduled execution time'); return; }
    setSaving(true);
    try {
      await base44.entities.DBPlan.update(selectedPlan.id, {
        status: 'approved',
        approved_by: user?.email,
        approval_notes: notes,
        scheduled_at: new Date(scheduleAt).toISOString(),
        target_environment: targetEnv,
      });
      await base44.entities.AuditEntry.create({
        project_id: selectedPlan.project_id, plan_id: selectedPlan.id,
        action: 'Migration Approved', actor_email: user?.email, actor_role: user?.role,
        details: `Scheduled for ${scheduleAt} on ${targetEnv}`,
      });
      toast.success('Migration approved and scheduled!');
      setSelectedPlan(null); setAction(null); setNotes(''); setScheduleAt('');
      loadData();
    } finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { toast.error('Please provide a rejection reason'); return; }
    setSaving(true);
    try {
      await base44.entities.DBPlan.update(selectedPlan.id, { status: 'rejected', rejection_reason: notes });
      await base44.entities.AuditEntry.create({
        project_id: selectedPlan.project_id, plan_id: selectedPlan.id,
        action: 'Plan Rejected', actor_email: user?.email, actor_role: user?.role,
        details: notes,
      });
      toast.success('Plan rejected');
      setSelectedPlan(null); setAction(null); setNotes('');
      loadData();
    } finally { setSaving(false); }
  };

  const PlanRow = ({ plan, actions }) => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/plans/${plan.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{plan.title}</Link>
            <StatusBadge status={plan.status} />
          </div>
          <p className="text-xs text-muted-foreground">{projectMap[plan.project_id]?.name || '—'} · {new Date(plan.updated_date || plan.created_date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Approvals</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Review and approve database plans across all stages</p>
      </div>

      {/* DBA Review Queue */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-warning/5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <p className="text-sm font-semibold">DBA Review Queue</p>
          <span className="text-xs text-muted-foreground">({dbaReviewPlans.length})</span>
        </div>
        {dbaReviewPlans.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No plans awaiting DBA review</div>
        ) : (
          dbaReviewPlans.map(plan => (
            <PlanRow key={plan.id} plan={plan} actions={
              <>
                <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1" onClick={() => { setSelectedPlan(plan); setAction('reject'); }}>
                  <XCircle className="w-3 h-3" /> Reject
                </Button>
                <Button size="sm" className="bg-success hover:bg-success/90 text-black gap-1" onClick={() => { setSelectedPlan(plan); setAction('dba_approve'); }}>
                  <CheckCircle className="w-3 h-3" /> DBA Approve
                </Button>
              </>
            } />
          ))
        )}
      </div>

      {/* Pending Approval Queue */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-primary/5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-sm font-semibold">Pending Final Approval</p>
          <span className="text-xs text-muted-foreground">({pendingApprovalPlans.length})</span>
        </div>
        {pendingApprovalPlans.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No plans pending final approval</div>
        ) : (
          pendingApprovalPlans.map(plan => (
            <PlanRow key={plan.id} plan={plan} actions={
              <>
                <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1" onClick={() => { setSelectedPlan(plan); setAction('reject'); }}>
                  <XCircle className="w-3 h-3" /> Reject
                </Button>
                <Button size="sm" className="gap-1" onClick={() => { setSelectedPlan(plan); setAction('approve'); }}>
                  <Shield className="w-3 h-3" /> Approve & Schedule
                </Button>
              </>
            } />
          ))
        )}
      </div>

      {/* Scheduled / In Progress */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-sm font-semibold">Scheduled & In Progress</p>
          <span className="text-xs text-muted-foreground">({scheduledPlans.length})</span>
        </div>
        {scheduledPlans.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No scheduled migrations</div>
        ) : (
          scheduledPlans.map(plan => (
            <PlanRow key={plan.id} plan={plan} actions={
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {plan.scheduled_at ? new Date(plan.scheduled_at).toLocaleString() : 'Unscheduled'}
                {plan.target_environment && <span className="ml-2 px-1.5 py-0.5 rounded bg-secondary text-xs">{plan.target_environment}</span>}
              </div>
            } />
          ))
        )}
      </div>

      {/* DBA Approve Dialog */}
      <Dialog open={action === 'dba_approve'} onOpenChange={() => { setAction(null); setSelectedPlan(null); setNotes(''); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>DBA Approval — {selectedPlan?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Confirm that the schema design is technically sound and ready for migration generation.</p>
            <div className="space-y-1.5">
              <Label className="text-xs">DBA Notes (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Technical notes for the team..." className="bg-background border-border resize-none h-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setAction(null); setNotes(''); }}>Cancel</Button>
            <Button size="sm" className="bg-success hover:bg-success/90 text-black" onClick={handleDBAApprove} disabled={saving}>{saving ? 'Approving...' : 'Confirm DBA Approval'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve & Schedule Dialog */}
      <Dialog open={action === 'approve'} onOpenChange={() => { setAction(null); setSelectedPlan(null); setNotes(''); setScheduleAt(''); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Approve & Schedule — {selectedPlan?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning">This migration will be executed against the target environment at the scheduled time. A backup checkpoint will be taken before execution.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Target Environment *</Label>
                <Select value={targetEnv} onValueChange={setTargetEnv}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Scheduled Execution *</Label>
                <Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} className="bg-background border-border text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Approval Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for the team..." className="bg-background border-border resize-none h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setAction(null); setNotes(''); setScheduleAt(''); }}>Cancel</Button>
            <Button size="sm" onClick={handleApprove} disabled={saving || !scheduleAt}>{saving ? 'Approving...' : 'Approve & Schedule'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={action === 'reject'} onOpenChange={() => { setAction(null); setSelectedPlan(null); setNotes(''); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Reject Plan — {selectedPlan?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Rejection Reason *</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Explain why this plan is being rejected..." className="bg-background border-border resize-none h-28" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setAction(null); setNotes(''); }}>Cancel</Button>
            <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={handleReject} disabled={saving || !notes.trim()}>{saving ? 'Rejecting...' : 'Reject Plan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}