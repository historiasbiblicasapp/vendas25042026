import { useDashboard } from '../hooks/useDashboard';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export default function Dashboard() {
  const { loading, vendasHoje, receitaHoje, vendasMes, receitaMes, totalClientes, totalProdutos } = useDashboard();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <DollarSign size={20} color="#22c55e" />
            <span style={{ fontSize: '0.875rem', color: '#666' }}>Receita Hoje</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>
            R$ {receitaHoje.toFixed(2)}
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShoppingCart size={20} color="#22c55e" />
            <span style={{ fontSize: '0.875rem', color: '#666' }}>Vendas Hoje</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>
            {vendasHoje}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <DollarSign size={20} color="#3b82f6" />
            <span style={{ fontSize: '0.875rem', color: '#666' }}>Receita Mês</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
            R$ {receitaMes.toFixed(2)}
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShoppingCart size={20} color="#3b82f6" />
            <span style={{ fontSize: '0.875rem', color: '#666' }}>Vendas Mês</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
            {vendasMes}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Users size={20} color="#8b5cf6" />
            <span style={{ fontSize: '0.875rem', color: '#666' }}>Total Clientes</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6' }}>
            {totalClientes}
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Package size={20} color="#8b5cf6" />
            <span style={{ fontSize: '0.875rem', color: '#666' }}>Total Produtos</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6' }}>
            {totalProdutos}
          </div>
        </div>
      </div>
    </div>
  );
}