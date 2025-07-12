// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar';
import AdminNavbar from './components/AdminNavbar';

const Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Navbar */}
        <AdminNavbar />
        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;