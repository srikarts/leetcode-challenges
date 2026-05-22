import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Database, Shield, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setProfile({ full_name: u?.full_name || '' }); }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: profile.full_name });
      toast.success('Profile updated');
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and system preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-sm font-semibold">Profile</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary">
              {(user?.full_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.full_name || 'No name set'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{user?.role || 'developer'}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Display Name</Label>
            <Input value={profile.full_name} onChange={e => setProfile(p => ({...p, full_name: e.target.value}))} className="bg-background border-border" placeholder="Your full name" />
          </div>
          <Button size="sm" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-sm font-semibold">System</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Database Engine', value: 'PostgreSQL 16' },
            { label: 'Migration Format', value: 'SQL DDL + Prisma ORM' },
            { label: 'AI Model', value: 'Advanced LLM' },
            { label: 'Platform', value: 'SchemaForge v1.0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-mono text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-sm font-semibold">Workflow Stages</p>
        </div>
        <div className="p-4 space-y-1">
          {[
            'Upload Input',
            'AI Analysis',
            'Plan Ready',
            'DBA Review',
            'DBA Approved',
            'Migration Generated',
            'Pending Approval',
            'Approved & Scheduled',
            'Execute with Backup Checkpoint',
            'Completed / Rolled Back',
          ].map((stage, i) => (
            <div key={stage} className="flex items-center gap-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary">{i + 1}</div>
              <span className="text-xs text-foreground">{stage}</span>
              {i < 9 && <div className="w-px h-3 bg-border ml-2 absolute mt-8" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}