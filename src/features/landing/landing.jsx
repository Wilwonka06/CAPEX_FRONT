import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Landing;