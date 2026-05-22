import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  draft:              { label: 'Draft',             color: 'text-muted-foreground bg-muted border-border' },
  ai_analyzing:       { label: 'Analyzing',         color: 'text-primary bg-primary/10 border-primary/30 animate-pulse' },
  plan_ready:         { label: 'Plan Ready',        color: 'text-primary bg-primary/10 border-primary/30' },
  dba_review:         { label: 'DBA Review',        color: 'text-warning bg-warning/10 border-warning/30' },
  dba_approved:       { label: 'DBA Approved',      color: 'text-success bg-success/10 border-success/30' },
  migration_generated:{ label: 'Migration Ready',   color: 'text-primary bg-primary/10 border-primary/30' },
  pending_approval:   { label: 'Pending Approval',  color: 'text-warning bg-warning/10 border-warning/30' },
  approved:           { label: 'Approved',          color: 'text-success bg-success/10 border-success/30' },
  scheduled:          { label: 'Scheduled',         color: 'text-primary bg-primary/10 border-primary/30' },
  executing:          { label: 'Executing',         color: 'text-warning bg-warning/10 border-warning/30 animate-pulse' },
  completed:          { label: 'Completed',         color: 'text-success bg-success/10 border-success/30' },
  rolled_back:        { label: 'Rolled Back',       color: 'text-destructive bg-destructive/10 border-destructive/30' },
  rejected:           { label: 'Rejected',          color: 'text-destructive bg-destructive/10 border-destructive/30' },
  active:             { label: 'Active',            color: 'text-success bg-success/10 border-success/30' },
  archived:           { label: 'Archived',          color: 'text-muted-foreground bg-muted border-border' },
  validated:          { label: 'Validated',         color: 'text-success bg-success/10 border-success/30' },
  failed:             { label: 'Failed',            color: 'text-destructive bg-destructive/10 border-destructive/30' },
};

export default function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'text-muted-foreground bg-muted border-border' };
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
}