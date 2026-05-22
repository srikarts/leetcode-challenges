import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Upload, Zap, Eye, Code2, GitBranch, CheckCircle, AlertTriangle, FileText, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/ui/StatusBadge';
import CodeBlock from '@/components/ui/CodeBlock';
import ERCanvas from '@/components/er/ERCanvas';
import ValidationReport from '@/components/plan/ValidationReport';
import CommentThread from '@/components/plan/CommentThread';
import { toast } from 'sonner';

export default function PlanDetail() {
  const { id } = useParams();
  const { user } = useOutletContext() || {};
  const [plan, setPlan] = useState(null);
  const [project, setProject] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newArtifact, setNewArtifact] = useState({ type: 'requirements', title: '', content: '' });
  const [showAddArtifact, setShowAddArtifact] = useState(false);
  const [activeTab, setActiveTab] = useState('inputs');

  useEffect(() => { loadPlan(); }, [id]);

  const loadPlan = async () => {
    try {
      const [planData, artData] = await Promise.all([
        base44.entities.DBPlan.filter({ id }),
        base44.entities.InputArtifact.filter({ plan_id: id }),
      ]);
      const p = planData[0] || null;
      setPlan(p);
      setArtifacts(artData);
      if (p?.project_id) {
        const proj = await base44.entities.Project.filter({ id: p.project_id });
        setProject(proj[0] || null);
      }
    } finally { setLoading(false); }
  };

  const addArtifact = async () => {
    if (!newArtifact.title || !newArtifact.content) return;
    await base44.entities.InputArtifact.create({ ...newArtifact, plan_id: id, project_id: plan?.project_id });
    setArtifacts(prev => [...prev, { ...newArtifact, id: Date.now().toString() }]);
    setNewArtifact({ type: 'requirements', title: '', content: '' });
    setShowAddArtifact(false);
  };

  const runAIAnalysis = async () => {
    if (artifacts.length === 0) { toast.error('Add at least one input artifact before analyzing.'); return; }
    setAnalyzing(true);
    await base44.entities.DBPlan.update(id, { status: 'ai_analyzing' });
    setPlan(p => ({ ...p, status: 'ai_analyzing' }));

    try {
      const combinedInput = artifacts.map(a => `[${a.type.toUpperCase()}] ${a.title}:\n${a.content}`).join('\n\n---\n\n');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior PostgreSQL database architect. Analyze the following inputs and generate a complete database schema plan.

INPUTS:
${combinedInput}

Generate a JSON response with this EXACT structure:
{
  "tables": [
    {
      "name": "table_name",
      "description": "what this table stores",
      "fields": [
        {"name": "id", "type": "UUID", "nullable": false, "primary_key": true, "unique": true, "default_value": "gen_random_uuid()", "description": "Primary key"},
        {"name": "field_name", "type": "VARCHAR(255)", "nullable": false, "primary_key": false, "unique": false, "default_value": "", "description": "Field description"}
      ],
      "x": 100,
      "y": 100
    }
  ],
  "relationships": [
    {"from_table": "orders", "from_field": "user_id", "to_table": "users", "to_field": "id", "type": "one_to_many"}
  ],
  "ddl_sql": "-- Complete PostgreSQL DDL\\nCREATE TABLE...",
  "prisma_schema": "// Prisma Schema\\nmodel User {...}",
  "validation_report": {
    "score": 92,
    "issues": [{"severity": "error", "message": "issue description", "table": "table_name"}],
    "warnings": [{"severity": "warning", "message": "warning description", "table": "table_name"}],
    "passed_checks": ["All tables have primary keys", "Foreign key constraints defined"]
  }
}

Place tables in a grid layout with x/y coordinates (spaced 300px apart).
Generate comprehensive, production-ready PostgreSQL schemas.
Include indexes, constraints, and proper data types.
The DDL must be valid PostgreSQL syntax.`,
        response_json_schema: {
          type: "object",
          properties: {
            tables: { type: "array" },
            relationships: { type: "array" },
            ddl_sql: { type: "string" },
            prisma_schema: { type: "string" },
            validation_report: { type: "object" }
          }
        }
      });

      const updates = {
        status: 'plan_ready',
        tables: result.tables || [],
        relationships: result.relationships || [],
        ddl_sql: result.ddl_sql || '',
        prisma_schema: result.prisma_schema || '',
        validation_report: result.validation_report || {},
      };
      await base44.entities.DBPlan.update(id, updates);
      setPlan(p => ({ ...p, ...updates }));
      await base44.entities.AuditEntry.create({ project_id: plan?.project_id, plan_id: id, action: 'AI Analysis Completed', actor_email: user?.email || 'system', actor_role: user?.role || 'developer', details: `Generated ${result.tables?.length || 0} tables` });
      setActiveTab('diagram');
      toast.success('AI analysis complete! Schema generated.');
    } catch (err) {
      await base44.entities.DBPlan.update(id, { status: 'draft' });
      setPlan(p => ({ ...p, status: 'draft' }));
      toast.error('Analysis failed. Please try again.');
    } finally { setAnalyzing(false); }
  };

  const generateMigration = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate PostgreSQL migration scripts for the following DDL:

${plan.ddl_sql}

Return JSON with:
{
  "up_migration_sql": "-- UP Migration (create/alter tables)\\n...",
  "down_migration_sql": "-- DOWN Migration (rollback/drop)\\n..."
}

The UP migration should create all tables, indexes, and constraints.
The DOWN migration should safely reverse all changes (DROP TABLE IF EXISTS, etc.).
Add transaction wrapping and comments.`,
        response_json_schema: {
          type: "object",
          properties: {
            up_migration_sql: { type: "string" },
            down_migration_sql: { type: "string" }
          }
        }
      });

      const updates = {
        up_migration_sql: result.up_migration_sql || '',
        down_migration_sql: result.down_migration_sql || '',
        status: 'migration_generated',
      };
      await base44.entities.DBPlan.update(id, updates);
      setPlan(p => ({ ...p, ...updates }));
      await base44.entities.AuditEntry.create({ project_id: plan?.project_id, plan_id: id, action: 'Migration Generated', actor_email: user?.email || 'system', actor_role: user?.role || 'developer', details: 'UP and DOWN migration scripts generated' });
      setActiveTab('migration');
      toast.success('Migration scripts generated!');
    } catch (err) {
      toast.error('Migration generation failed.');
    } finally { setGenerating(false); }
  };

  const submitForReview = async () => {
    await base44.entities.DBPlan.update(id, { status: 'dba_review' });
    setPlan(p => ({ ...p, status: 'dba_review' }));
    await base44.entities.AuditEntry.create({ project_id: plan?.project_id, plan_id: id, action: 'Submitted for DBA Review', actor_email: user?.email, actor_role: user?.role, details: '' });
    toast.success('Plan submitted for DBA review');
  };

  const submitForApproval = async () => {
    await base44.entities.DBPlan.update(id, { status: 'pending_approval' });
    setPlan(p => ({ ...p, status: 'pending_approval' }));
    await base44.entities.AuditEntry.create({ project_id: plan?.project_id, plan_id: id, action: 'Submitted for Approval', actor_email: user?.email, actor_role: user?.role, details: '' });
    toast.success('Plan submitted for approval');
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!plan) return <div className="p-6 text-muted-foreground">Plan not found.</div>;

  const canAnalyze = plan.status === 'draft';
  const hasPlan = ['plan_ready','dba_review','dba_approved','migration_generated','pending_approval','approved','scheduled','executing','completed','rolled_back'].includes(plan.status);
  const canGenerateMigration = plan.status === 'dba_approved';
  const canSubmitReview = plan.status === 'plan_ready';
  const canSubmitApproval = plan.status === 'migration_generated';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/plans" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{plan.title}</h2>
              <StatusBadge status={plan.status} />
            </div>
            {project && <p className="text-xs text-muted-foreground mt-0.5">{project.name} · v{plan.version || 1}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAnalyze && (
            <Button onClick={runAIAnalysis} disabled={analyzing} size="sm" className="gap-1.5">
              <Zap className="w-3.5 h-3.5" /> {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </Button>
          )}
          {canSubmitReview && (
            <Button onClick={submitForReview} size="sm" variant="outline" className="gap-1.5 border-warning/50 text-warning hover:bg-warning/10">
              <Eye className="w-3.5 h-3.5" /> Submit for DBA Review
            </Button>
          )}
          {canGenerateMigration && (
            <Button onClick={generateMigration} disabled={generating} size="sm" className="gap-1.5">
              <GitBranch className="w-3.5 h-3.5" /> {generating ? 'Generating...' : 'Generate Migration'}
            </Button>
          )}
          {canSubmitApproval && (
            <Button onClick={submitForApproval} size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-black">
              <CheckCircle className="w-3.5 h-3.5" /> Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b border-border shrink-0">
          <TabsList className="h-auto p-0 bg-transparent border-0 gap-0">
            {[
              { value: 'inputs', label: 'Inputs', icon: Upload },
              { value: 'diagram', label: 'ER Diagram', icon: Eye, disabled: !hasPlan },
              { value: 'ddl', label: 'DDL / ORM', icon: Code2, disabled: !hasPlan },
              { value: 'migration', label: 'Migration', icon: GitBranch, disabled: !plan.up_migration_sql },
              { value: 'validation', label: 'Validation', icon: AlertTriangle, disabled: !plan.validation_report?.score },
              { value: 'comments', label: 'Comments', icon: FileText },
            ].map(({ value, label, icon: Icon, disabled }) => (
              <button
                key={value}
                onClick={() => !disabled && setActiveTab(value)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === value
                    ? 'border-primary text-primary'
                    : disabled
                    ? 'border-transparent text-muted-foreground/40 cursor-not-allowed'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </TabsList>
        </div>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="flex-1 overflow-y-auto p-6 mt-0">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Add inputs for AI to analyze — requirements, code, API payloads, or existing schemas.</p>
              <Button onClick={() => setShowAddArtifact(true)} size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Input
              </Button>
            </div>

            {showAddArtifact && (
              <div className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">New Input</p>
                  <button onClick={() => setShowAddArtifact(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <Select value={newArtifact.type} onValueChange={v => setNewArtifact(a => ({...a, type: v}))}>
                      <SelectTrigger className="bg-background border-border h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {['requirements','frontend_code','api_payload','existing_schema','document','other'].map(t => (
                          <SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g,' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input value={newArtifact.title} onChange={e => setNewArtifact(a => ({...a, title: e.target.value}))} placeholder="e.g. User requirements doc" className="bg-background border-border h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Content</Label>
                  <Textarea value={newArtifact.content} onChange={e => setNewArtifact(a => ({...a, content: e.target.value}))} placeholder="Paste your requirements, code, JSON payload, or SQL schema here..." className="bg-background border-border h-40 text-xs font-mono resize-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddArtifact(false)}>Cancel</Button>
                  <Button size="sm" onClick={addArtifact} disabled={!newArtifact.title || !newArtifact.content}>Add Input</Button>
                </div>
              </div>
            )}

            {artifacts.length === 0 && !showAddArtifact ? (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No inputs yet. Add requirements, frontend code, API payloads, or existing schemas.</p>
                <Button onClick={() => setShowAddArtifact(true)} size="sm" variant="outline" className="mt-4 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add First Input
                </Button>
              </div>
            ) : (
              artifacts.map(artifact => (
                <div key={artifact.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-secondary/30">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{artifact.type?.replace(/_/g,' ')}</span>
                    <span className="text-xs text-foreground font-medium">{artifact.title}</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-48 whitespace-pre-wrap">{artifact.content}</pre>
                </div>
              ))
            )}

            {artifacts.length > 0 && canAnalyze && (
              <div className="pt-2">
                <Button onClick={runAIAnalysis} disabled={analyzing} className="gap-1.5 w-full">
                  <Zap className="w-3.5 h-3.5" /> {analyzing ? 'Analyzing inputs...' : `Analyze ${artifacts.length} Input${artifacts.length > 1 ? 's' : ''} with AI`}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ER Diagram Tab */}
        <TabsContent value="diagram" className="flex-1 overflow-hidden mt-0 p-0">
          {hasPlan && plan.tables?.length > 0 ? (
            <ERCanvas tables={plan.tables || []} relationships={plan.relationships || []} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Run AI analysis to generate the ER diagram</div>
          )}
        </TabsContent>

        {/* DDL / ORM Tab */}
        <TabsContent value="ddl" className="flex-1 overflow-y-auto p-6 mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <CodeBlock code={plan.ddl_sql} title="PostgreSQL DDL" language="sql" />
            <CodeBlock code={plan.prisma_schema} title="Prisma ORM Schema" language="prisma" />
          </div>
        </TabsContent>

        {/* Migration Tab */}
        <TabsContent value="migration" className="flex-1 overflow-y-auto p-6 mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <CodeBlock code={plan.up_migration_sql} title="UP Migration (apply)" language="sql" />
            <CodeBlock code={plan.down_migration_sql} title="DOWN Migration (rollback)" language="sql" />
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="flex-1 overflow-y-auto p-6 mt-0">
          {plan.validation_report ? <ValidationReport report={plan.validation_report} /> : <div className="text-sm text-muted-foreground">No validation report yet.</div>}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="flex-1 overflow-y-auto p-6 mt-0">
          <CommentThread planId={id} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}