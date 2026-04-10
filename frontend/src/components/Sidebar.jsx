import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Users,
  ArrowLeftRight,
  Wrench,
  Package,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets', icon: Monitor, label: 'Assets' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/assignments', icon: ArrowLeftRight, label: 'Assignments' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-xl">
          <Package size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">AssetTrack</h1>
          <p className="text-xs text-slate-400">Inventory Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">v1.0.0 · IT Asset Manager</p>
      </div>
    </aside>
  );
}
