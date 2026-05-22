import { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function TopBar({ title, user }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await base44.entities.Notification.filter({ recipient_email: user.email, read: false }, '-created_date', 20);
      setNotifications(data);
    } catch {}
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.length;

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative w-8 h-8">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-card border-border" align="end">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">All caught up</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-secondary/50 cursor-pointer border-b border-border/50 last:border-0" onClick={() => markRead(n.id)}>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}