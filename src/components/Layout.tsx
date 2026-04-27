import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useDeviceTracking } from '../hooks/useDeviceTracking';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, Package, 
  FileText, Share2, Settings, LogOut, Menu, X, Store
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { userProfile, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { vendasHoje, receitaHoje, vendasMes, receitaMes, totalClientes, totalProdutos } = useDashboard();
  
  // Tracking de dispositivo
  useDeviceTracking(user?.id || null);
  
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pdv', icon: ShoppingCart, label: 'PDV' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/produtos', icon: Package, label: 'Produtos/Serviços' },
    { path: '/relatorios', icon: FileText, label: 'Relatórios' },
    { path: '/dispositivos', icon: Store, label: 'Dispositivos' },
    { path: '/compartilhar', icon: Share2, label: 'Compartilhar' },
    ...(userProfile?.tipo === 'master' ? [{ path: '/lojas', icon: Store, label: 'Lojas' }] : []),
    ...(userProfile?.tipo === 'master' ? [{ path: '/config', icon: Settings, label: 'Config Master' }] : []),
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (userProfile?.bloqueado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Acesso Bloqueado</h2>
          <p>Sua conta foi bloqueada. Entre em contato com o administrador.</p>
          <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{ background: '#22c55e', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>LF Vendas</h1>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <LogOut size={20} />
        </button>
      </nav>

      {menuOpen && (
        <div style={{ background: 'white', padding: '1rem', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#22c55e' }}>R$ {receitaHoje.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Hoje</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#22c55e' }}>{vendasHoje}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Vendas Hoje</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#22c55e' }}>{totalClientes}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Clientes</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {menuItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: location.pathname === item.path ? '#22c55e' : '#f5f5f5',
                  color: location.pathname === item.path ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}