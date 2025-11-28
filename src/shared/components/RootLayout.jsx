import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

const RootLayout = () => {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
};

export default RootLayout;
