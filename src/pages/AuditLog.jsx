import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity, Filter, Download, User, Clock, Database, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ACTION_COLORS = {
  'AI Analysis Completed': 'bg-primary/10 text-primary',
  'DBA Approved': 'bg-success/10 text-success',
  'Migration Approved': 'bg-success/10 text-success',
  'Migration Generated': 'bg-primary/10 text-primary',
  'Migration Executed Successfully': 'bg-success/10 text-success',
  'Migration Rolled Back': 'bg-warning/10 text-warning',
  'Plan Rejected': 'bg-destructive/10 text-destructive',
  'Submitted for DBA Review': 'bg-warning/10 text-warning',
  'Submitted for Approval': 'bg-warning/10 text-warning',
};

export default function AuditLog() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [auditData, projectsData] = await Promise.all([
        base44.entities.AuditEntry.list('-created_date', 200),
        base44.entities.Project.list('-created_date', 50),
      ]);
      setEntries(auditData);
      setProjects(projectsData);
    } finally { setLoading(false); }
  };

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.action?.toLowerCase().includes(search.toLowerCase()) || e.actor_email?.toLowerCase().includes(search.toLowerCase());
    const matchProject = projectFilter === 'all' || e.project_id === projectFilter;
    return matchSearch && matchProject;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Audit Log</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Complete history of all database changes and approvals</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search actions, users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 bg-card border-border h-8 text-sm" />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48 h-8 text-xs bg-card border-border">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No audit entries found</div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {paginated.map(entry => (
                <div key={entry.id} className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <div className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium shrink-0 ${ACTION_COLORS[entry.action] || 'bg-muted text-muted-foreground'}`}>
                    {entry.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    {entry.details && <p className="text-xs text-muted-foreground truncate">{entry.details}</p>}
                    {entry.project_id && projectMap[entry.project_id] && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Database className="w-3 h-3 inline mr-1" />
                        {projectMap[entry.project_id].name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {entry.actor_email?.split('@')[0]}
                      {entry.actor_role && <span className="px-1.5 py-0.5 rounded bg-secondary capitalize">{entry.actor_role}</span>}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.created_date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="p-3 border-t border-border text-center">
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setPage(p => p + 1)}>
                  <ChevronDown className="w-3 h-3" /> Load more ({filtered.length - paginated.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}