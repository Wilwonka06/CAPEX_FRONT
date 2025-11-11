// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar';
import AdminNavbar from './components/AdminNavbar';
import { useState } from 'react';

const Layout = () => {
  const [title, setTitle] = useState('');
  return (
    <div className="flex h-screen font-inter">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Navbar */}
        <AdminNavbar title={title} />
        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100">  
          <Outlet context={{ setTitle }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;