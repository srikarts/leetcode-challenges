import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function AppLayout({ title = 'SchemaForge' }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={title} user={user} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}