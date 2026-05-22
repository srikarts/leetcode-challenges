import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CodeBlock({ code, language = 'sql', title, className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
          <span className="text-xs font-mono text-muted-foreground">{title}</span>
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </Button>
        </div>
      )}
      {!title && (
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      )}
      <div className="relative">
        {!title && (
          <Button variant="ghost" size="icon" className="w-6 h-6 absolute top-2 right-2 z-10" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </Button>
        )}
        <pre className="p-4 text-xs font-mono text-foreground bg-background overflow-x-auto leading-relaxed">
          <code>{code || '-- No code generated yet'}</code>
        </pre>
      </div>
    </div>
  );
}