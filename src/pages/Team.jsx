import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, Shield, Code2, Database, Eye, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ROLE_CONFIG = {
  admin: { icon: Crown, label: 'Admin', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', desc: 'Full system access' },
  approver: { icon: Shield, label: 'Approver', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', desc: 'Final approval authority' },
  dba: { icon: Database, label: 'DBA', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', desc: 'Technical review & validation' },
  developer: { icon: Code2, label: 'Developer', color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', desc: 'Create & submit plans' },
};

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [inviting, setInviting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await base44.entities.User.list('-created_date', 100);
      setUsers(data);
    } finally { setLoading(false); }
  };

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole === 'admin' ? 'admin' : 'user');
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail('');
      setInviteRole('developer');
    } catch (err) {
      toast.error('Failed to send invitation: ' + (err.message || 'Unknown error'));
    } finally { setInviting(false); }
  };

  const roleGroups = {
    admin: users.filter(u => u.role === 'admin'),
    approver: users.filter(u => u.role === 'approver'),
    dba: users.filter(u => u.role === 'dba'),
    developer: users.filter(u => !['admin','approver','dba'].includes(u.role)),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage team members and their roles</p>
        </div>
        <Button onClick={() => setShowInvite(true)} size="sm" className="gap-1.5">
          <UserPlus className="w-3.5 h-3.5" /> Invite Member
        </Button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const Icon = config.icon;
          const count = roleGroups[role]?.length || 0;
          return (
            <div key={role} className={`bg-card border ${config.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-md ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{config.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Members table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">All Members ({users.length})</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No team members found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Member</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => {
                const role = user.role || 'developer';
                const config = ROLE_CONFIG[role] || ROLE_CONFIG.developer;
                const Icon = config.icon;
                return (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                          {(user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
                        <Icon className="w-3 h-3" /> {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.created_date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Email Address *</Label>
              <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="engineer@company.com" type="email" className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="developer">Developer — Create & submit plans</SelectItem>
                  <SelectItem value="dba">DBA — Technical review</SelectItem>
                  <SelectItem value="approver">Approver — Final sign-off</SelectItem>
                  <SelectItem value="admin">Admin — Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button size="sm" onClick={inviteUser} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}