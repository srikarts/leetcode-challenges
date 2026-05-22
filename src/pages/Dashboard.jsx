import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Database, GitBranch, CheckSquare, AlertTriangle, ArrowRight, Clock, Activity } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Dashboard() {
  const { user } = useOutletContext() || {};
  const [stats, setStats] = useState({ projects: 0, plans: 0, pending: 0, migrations: 0 });
  const [recentPlans, setRecentPlans] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projects, plans, migrations, audit] = await Promise.all([
        base44.entities.Project.list('-created_date', 50),
        base44.entities.DBPlan.list('-created_date', 50),
        base44.entities.MigrationScript.list('-created_date', 20),
        base44.entities.AuditEntry.list('-created_date', 10),
      ]);
      const pending = plans.filter(p => ['pending_approval', 'dba_review'].includes(p.status));
      setStats({ projects: projects.length, plans: plans.length, pending: pending.length, migrations: migrations.length });
      setRecentPlans(plans.slice(0, 6));
      setAuditEntries(audit.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: Database, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'DB Plans', value: stats.plans, icon: GitBranch, color: 'text-chart-2', bg: 'bg-chart-2/10' },
    { label: 'Pending Review', value: stats.pending, icon: CheckSquare, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Migrations', value: stats.migrations, icon: Activity, color: 'text-chart-5', bg: 'bg-chart-5/10' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</h2>
        <p className="text-sm text-muted-foreground mt-1">Here's what's happening across your database projects.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <div className={`w-7 h-7 rounded-md ${bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Plans */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Recent DB Plans</p>
            <Link to="/plans" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPlans.length === 0 && !loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No plans yet. <Link to="/plans/new" className="text-primary hover:underline">Create your first plan</Link></div>
            ) : (
              recentPlans.map(plan => (
                <Link key={plan.id} to={`/plans/${plan.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center">
                      <Database className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{plan.title}</p>
                      <p className="text-xs text-muted-foreground">v{plan.version || 1} · {new Date(plan.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={plan.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Audit Feed */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Activity</p>
            <Link to="/audit" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {auditEntries.length === 0 && !loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No activity yet</div>
            ) : (
              auditEntries.map(entry => (
                <div key={entry.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-foreground font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.actor_email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(entry.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}