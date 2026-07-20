import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';

export default function ShopkeeperLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="shopkeeper" slug={slug} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><FiMenu className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Dashboard</h1>
        </header>
        <main className="p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
