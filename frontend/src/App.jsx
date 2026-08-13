import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transfers } from './pages/Transfers';
import { Purchases } from './pages/Purchases';
import { Assignments } from './pages/Assignments';
import { Expenditures } from './pages/Expenditures';
import { UserManagement } from './pages/UserManagement';


const ProtectedLayout = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
   const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} /> 

       <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/expenditures" element={<Expenditures />} />
        <Route path="/users" element={<UserManagement />} /> 
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route> 
      
       <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default function App() {
  return (
     <AuthProvider>
      <AppRoutes />
     </AuthProvider>
  );
}