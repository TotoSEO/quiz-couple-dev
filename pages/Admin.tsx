import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const Admin = () => {
  const { isAuthenticated, isLoading, error, login, logout, getToken } = useAdminAuth();

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} error={error} isLoading={isLoading} />;
  }

  return <AdminDashboard onLogout={logout} getToken={getToken} />;
};

export default Admin;
