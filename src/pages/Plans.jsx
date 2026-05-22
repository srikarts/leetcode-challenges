import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Database, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project_id: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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

  const createPlan = async () => {
    if (!form.title.trim() || !form.project_id) return;
    setSaving(true);
    try {
      const plan = await base44.entities.DBPlan.create({ ...form, status: 'draft', version: 1, tables: [], relationships: [] });
      setShowCreate(false);
      navigate(`/plans/${plan.id}`);
    } finally { setSaving(false); }
  };

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUSES = ['draft','ai_analyzing','plan_ready','dba_review','dba_approved','migration_generated','pending_approval','approved','scheduled','executing','completed','rolled_back','rejected'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">DB Plans</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Design and manage database schema plans</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Plan
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 bg-card border-border h-8 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-8 text-xs bg-card border-border">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace(/_/g,' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Database className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No plans found</p>
          <p className="text-xs text-muted-foreground mt-1">Create a new plan to start designing your database</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Plan</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Project</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Tables</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(plan => (
                <tr key={plan.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/plans/${plan.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Database className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{plan.title}</p>
                        {plan.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{plan.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{projectMap[plan.project_id]?.name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={plan.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{plan.tables?.length || 0}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(plan.updated_date || plan.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>New DB Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Project *</Label>
              <Select value={form.project_id} onValueChange={v => setForm(f => ({...f, project_id: v}))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Plan Title *</Label>
              <Input placeholder="e.g. User & Auth Schema v2" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea placeholder="What does this plan address?" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="bg-background border-border resize-none h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} size="sm">Cancel</Button>
            <Button onClick={createPlan} disabled={saving || !form.title.trim() || !form.project_id} size="sm">{saving ? 'Creating...' : 'Create Plan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}