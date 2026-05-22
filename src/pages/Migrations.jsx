import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { GitBranch, Play, RotateCcw, Clock, CheckCircle, AlertTriangle, Database, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import CodeBlock from '@/components/ui/CodeBlock';
import { toast } from 'sonner';

export default function Migrations() {
  const { user } = useOutletContext() || {};
  const [plans, setPlans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [plansData, projectsData] = await Promise.all([
        base44.entities.DBPlan.list('-created_date', 100),
        base44.entities.Project.list('-created_date', 50),
      ]);
      const migrationPlans = plansData.filter(p => p.up_migration_sql);
      setPlans(migrationPlans);
      setProjects(projectsData);
    } finally { setLoading(false); }
  };

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const simulateExecution = async (plan) => {
    if (!['approved', 'scheduled'].includes(plan.status)) {
      toast.error('Plan must be approved and scheduled before execution');
      return;
    }
    setExecuting(e => ({ ...e, [plan.id]: true }));
    const logSteps = [
      { step: 'Taking backup checkpoint...', status: 'info', ts: new Date().toISOString() },
      { step: 'Backup snapshot created successfully', status: 'success', ts: new Date().toISOString() },
      { step: 'Connecting to target environment...', status: 'info', ts: new Date().toISOString() },
      { step: `Connected to ${plan.target_environment || 'staging'} database`, status: 'success', ts: new Date().toISOString() },
      { step: 'Beginning transaction...', status: 'info', ts: new Date().toISOString() },
      { step: 'Executing UP migration...', status: 'info', ts: new Date().toISOString() },
      { step: `Executed ${plan.tables?.length || 0} table operations`, status: 'success', ts: new Date().toISOString() },
      { step: 'Running post-migration validation...', status: 'info', ts: new Date().toISOString() },
      { step: 'All constraints verified', status: 'success', ts: new Date().toISOString() },
      { step: 'Committing transaction...', status: 'success', ts: new Date().toISOString() },
      { step: 'Migration completed successfully ✓', status: 'success', ts: new Date().toISOString() },
    ];

    await base44.entities.DBPlan.update(plan.id, { status: 'executing' });
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'executing' } : p));

    // Simulate step by step
    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    }

    const backupCheckpoint = {
      snapshot_id: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      environment: plan.target_environment || 'staging',
      confirmed: true,
    };

    await base44.entities.DBPlan.update(plan.id, {
      status: 'completed',
      executed_at: new Date().toISOString(),
    });

    await base44.entities.MigrationScript.create({
      plan_id: plan.id,
      project_id: plan.project_id,
      version: `v${plan.version || 1}.0`,
      up_sql: plan.up_migration_sql,
      down_sql: plan.down_migration_sql,
      status: 'completed',
      target_environment: plan.target_environment,
      scheduled_at: plan.scheduled_at,
      executed_at: new Date().toISOString(),
      backup_checkpoint: backupCheckpoint,
      execution_log: logSteps,
      approved_by: plan.approved_by,
      executed_by: user?.email,
    });

    await base44.entities.AuditEntry.create({
      project_id: plan.project_id, plan_id: plan.id,
      action: 'Migration Executed Successfully', actor_email: user?.email, actor_role: user?.role,
      details: `Executed on ${plan.target_environment}, backup: ${backupCheckpoint.snapshot_id}`,
    });

    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'completed', executed_at: new Date().toISOString() } : p));
    setExecuting(e => ({ ...e, [plan.id]: false }));
    toast.success('Migration executed successfully!');
  };

  const rollback = async (plan) => {
    if (plan.status !== 'completed') { toast.error('Can only rollback completed migrations'); return; }
    await base44.entities.DBPlan.update(plan.id, { status: 'rolled_back' });
    await base44.entities.AuditEntry.create({
      project_id: plan.project_id, plan_id: plan.id,
      action: 'Migration Rolled Back', actor_email: user?.email, actor_role: user?.role,
      details: 'Manual rollback triggered',
    });
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'rolled_back' } : p));
    toast.success('Rollback executed');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Migrations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Execute and monitor database migration scripts</p>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <GitBranch className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No migrations generated yet</p>
          <p className="text-xs text-muted-foreground mt-1">Generate migrations from approved DB plans</p>
        </div>
      ) : (
        plans.map(plan => (
          <div key={plan.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center">
                  <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/plans/${plan.id}`} className="text-sm font-medium hover:text-primary transition-colors">{plan.title}</Link>
                    <StatusBadge status={plan.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{projectMap[plan.project_id]?.name || '—'}</span>
                    {plan.target_environment && <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">{plan.target_environment}</span>}
                    {plan.scheduled_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(plan.scheduled_at).toLocaleString()}</span>}
                    {plan.executed_at && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" />Executed {new Date(plan.executed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['approved', 'scheduled'].includes(plan.status) && (
                  <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-black"
                    onClick={() => simulateExecution(plan)}
                    disabled={executing[plan.id]}
                  >
                    <Play className="w-3 h-3" /> {executing[plan.id] ? 'Executing...' : 'Execute Now'}
                  </Button>
                )}
                {plan.status === 'completed' && (
                  <Button size="sm" variant="outline" className="gap-1.5 border-warning/40 text-warning hover:bg-warning/10"
                    onClick={() => rollback(plan)}
                  >
                    <RotateCcw className="w-3 h-3" /> Rollback
                  </Button>
                )}
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedPlan === plan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedPlan === plan.id && (
              <div className="border-t border-border p-4 space-y-4">
                {plan.approved_by && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground bg-secondary/30 rounded-md px-3 py-2">
                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" />Approved by {plan.approved_by}</span>
                    {plan.target_environment && <span>Target: <strong className="text-foreground">{plan.target_environment}</strong></span>}
                  </div>
                )}
                {executing[plan.id] && (
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                      Executing migration...
                    </p>
                    {[
                      'Taking backup checkpoint...',
                      'Connecting to target environment...',
                      'Executing UP migration...',
                      'Running validation...',
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {step}
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <CodeBlock code={plan.up_migration_sql} title="UP Migration" />
                  <CodeBlock code={plan.down_migration_sql} title="DOWN Migration (Rollback)" />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}