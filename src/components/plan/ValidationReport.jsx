import { CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react';

export default function ValidationReport({ report }) {
  if (!report) return null;
  const { score = 0, issues = [], warnings = [], passed_checks = [] } = report;
  const scoreColor = score >= 90 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-destructive';
  const scoreBg = score >= 90 ? 'bg-success/10' : score >= 70 ? 'bg-warning/10' : 'bg-destructive/10';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Score */}
      <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-5">
        <div className={`w-16 h-16 rounded-full ${scoreBg} border-2 ${score >= 90 ? 'border-success' : score >= 70 ? 'border-warning' : 'border-destructive'} flex items-center justify-center`}>
          <span className={`text-xl font-bold ${scoreColor}`}>{score}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Validation Score</p>
          <p className={`text-xs mt-0.5 ${scoreColor}`}>
            {score >= 90 ? 'Excellent — ready for production' : score >= 70 ? 'Good — minor issues to review' : 'Needs attention — critical issues found'}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3 h-3" />{issues.length} errors</span>
            <span className="flex items-center gap-1 text-warning"><AlertTriangle className="w-3 h-3" />{warnings.length} warnings</span>
            <span className="flex items-center gap-1 text-success"><CheckCircle className="w-3 h-3" />{passed_checks.length} checks passed</span>
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Errors ({issues.length})
          </p>
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-lg p-3">
              <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
              <div>
                {issue.table && <span className="text-xs font-mono text-destructive/80 mr-2">{issue.table}</span>}
                <span className="text-xs text-foreground">{issue.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-warning uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Warnings ({warnings.length})
          </p>
          {warnings.map((warn, i) => (
            <div key={i} className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-lg p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <div>
                {warn.table && <span className="text-xs font-mono text-warning/80 mr-2">{warn.table}</span>}
                <span className="text-xs text-foreground">{warn.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Passed */}
      {passed_checks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-success uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Passed Checks ({passed_checks.length})
          </p>
          <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-1.5">
            {passed_checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success shrink-0" />
                <span className="text-xs text-foreground">{check}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}