import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="superadmin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><FiMenu className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Admin Panel</h1>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
