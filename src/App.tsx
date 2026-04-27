import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PDV from './pages/PDV';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Relatorios from './pages/Relatorios';
import Compartilhar from './pages/Compartilhar';
import ConfigMaster from './pages/ConfigMaster';
import GerenciarLojas from './pages/GerenciarLojas';
import Dispositivos from './pages/Dispositivos';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/pdv" element={<PrivateRoute><PDV /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
          <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
          <Route path="/compartilhar" element={<PrivateRoute><Compartilhar /></PrivateRoute>} />
          <Route path="/lojas" element={<PrivateRoute><GerenciarLojas /></PrivateRoute>} />
          <Route path="/config" element={<PrivateRoute><ConfigMaster /></PrivateRoute>} />
          <Route path="/dispositivos" element={<PrivateRoute><Dispositivos userId={useAuth().user?.id || ''} /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}