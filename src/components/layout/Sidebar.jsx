import { Link, useLocation } from 'react-router-dom';
import { 
  Database, FolderOpen, GitBranch, Shield, 
  Users, Bell, Settings, ChevronRight, 
  Activity, FileCode, CheckSquare, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: BarChart3, path: '/' },
  { label: 'Projects', icon: FolderOpen, path: '/projects' },
  { label: 'DB Plans', icon: Database, path: '/plans' },
  { label: 'Migrations', icon: GitBranch, path: '/migrations' },
  { label: 'Approvals', icon: CheckSquare, path: '/approvals' },
  { label: 'Audit Log', icon: Activity, path: '/audit' },
  { label: 'Team', icon: Users, path: '/team' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ user }) {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border gap-2.5">
        <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Database className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">SchemaForge</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
              {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role || 'developer'}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}