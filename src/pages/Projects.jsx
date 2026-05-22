import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Database, FolderOpen, MoreHorizontal, GitBranch, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [planCounts, setPlanCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', team: '', environments: ['dev', 'staging', 'production'] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const data = await base44.entities.Project.list('-created_date', 50);
      setProjects(data);
      const plans = await base44.entities.DBPlan.list('-created_date', 200);
      const counts = {};
      plans.forEach(p => { counts[p.project_id] = (counts[p.project_id] || 0) + 1; });
      setPlanCounts(counts);
    } finally { setLoading(false); }
  };

  const createProject = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Project.create({ ...form, status: 'active', db_type: 'PostgreSQL' });
      setShowCreate(false);
      setForm({ name: '', description: '', team: '', environments: ['dev', 'staging', 'production'] });
      loadProjects();
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage database projects across your teams</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-card border border-border rounded-lg animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first project to get started</p>
          <Button onClick={() => setShowCreate(true)} size="sm" className="mt-4 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} className="group bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <StatusBadge status={project.status} />
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
              {project.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>}
              {project.team && <p className="text-xs text-muted-foreground mt-1 font-medium">{project.team}</p>}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{planCounts[project.id] || 0} plans</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(project.created_date).toLocaleDateString()}</span>
                <span className="ml-auto font-mono text-xs text-primary/70">PostgreSQL</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Project Name *</Label>
              <Input placeholder="e.g. E-commerce Platform" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea placeholder="Brief description..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="bg-background border-border resize-none h-20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Team / Department</Label>
              <Input placeholder="e.g. Platform Engineering" value={form.team} onChange={e => setForm(f => ({...f, team: e.target.value}))} className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} size="sm">Cancel</Button>
            <Button onClick={createProject} disabled={saving || !form.name.trim()} size="sm">{saving ? 'Creating...' : 'Create Project'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}