import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Cliente, Produto, Venda } from '../types';

export function useDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vendasHoje, setVendasHoje] = useState(0);
  const [receitaHoje, setReceitaHoje] = useState(0);
  const [vendasMes, setVendasMes] = useState(0);
  const [receitaMes, setReceitaMes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState(0);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const { data: vendas } = await supabase
      .from('vendas')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('created_at', hoje.toISOString());

    const { data: vendasMesData } = await supabase
      .from('vendas')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('created_at', inicioMes.toISOString());

    const { data: clientes } = await supabase
      .from('clientes')
      .select('id', { count: 'exact' })
      .eq('usuario_id', user.id);

    const { data: produtos } = await supabase
      .from('produtos')
      .select('id', { count: 'exact' })
      .eq('usuario_id', user.id);

    setVendasHoje(vendas?.length || 0);
    setReceitaHoje(vendas?.reduce((acc, v) => acc + (v.total || 0), 0) || 0);
    setVendasMes(vendasMesData?.length || 0);
    setReceitaMes(vendasMesData?.reduce((acc, v) => acc + (v.total || 0), 0) || 0);
    setTotalClientes(clientes?.length || 0);
    setTotalProdutos(produtos?.length || 0);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return { loading, vendasHoje, receitaHoje, vendasMes, receitaMes, totalClientes, totalProdutos, refetch: fetchData };
}