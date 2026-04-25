import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Download } from 'lucide-react';

interface VendaRelatorio {
  id: string;
  total: number;
  created_at: string;
  cliente_nome?: string;
  itens: { nome: string; quantidade: number; preco: number; subtotal: number }[];
}

export default function Relatorios() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState<VendaRelatorio[]>([]);
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState({ totalVendas: 0, totalReceita: 0 });

  useEffect(() => {
    fetchVendas();
  }, [dataInicio, dataFim]);

  const fetchVendas = async () => {
    if (!user) return;
    setLoading(true);

    const inicio = startOfDay(new Date(dataInicio));
    const fim = endOfDay(new Date(dataFim));

    const { data } = await supabase
      .from('vendas')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('created_at', inicio.toISOString())
      .lte('created_at', fim.toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      const vendasComCliente = await Promise.all(
        data.map(async (venda) => {
          let clienteNome = undefined;
          if (venda.cliente_id) {
            const { data: cliente } = await supabase.from('clientes').select('nome').eq('id', venda.cliente_id).single();
            clienteNome = cliente?.nome;
          }
          return { ...venda, cliente_nome: clienteNome };
        })
      );
      setVendas(vendasComCliente);
      
      const totalVendas = data.length;
      const totalReceita = data.reduce((acc, v) => acc + (v.total || 0), 0);
      setResumo({ totalVendas, totalReceita });
    }
    setLoading(false);
  };

  const quickFilters = [
    { label: 'Hoje', inicio: format(new Date(), 'yyyy-MM-dd'), fim: format(new Date(), 'yyyy-MM-dd') },
    { label: 'Esta Semana', inicio: format(startOfWeek(new Date()), 'yyyy-MM-dd'), fim: format(endOfWeek(new Date()), 'yyyy-MM-dd') },
    { label: 'Este Mês', inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'), fim: format(endOfMonth(new Date()), 'yyyy-MM-dd') },
  ];

  const gerarTextoRelatorio = () => {
    let texto = `📊 RELATÓRIO DE VENDAS\n`;
    texto += `Período: ${format(new Date(dataInicio), 'dd/MM/yyyy')} a ${format(new Date(dataFim), 'dd/MM/yyyy')}\n\n`;
    texto += `Total de Vendas: ${resumo.totalVendas}\n`;
    texto += `Receita Total: R$ ${resumo.totalReceita.toFixed(2)}\n\n`;
    texto += `--- Detalhes ---\n`;
    
    vendas.forEach((venda, index) => {
      texto += `${index + 1}. ${format(new Date(venda.created_at), 'dd/MM/yyyy HH:mm')}\n`;
      if (venda.cliente_nome) texto += `   Cliente: ${venda.cliente_nome}\n`;
      venda.itens?.forEach(item => {
        texto += `   ${item.nome} x${item.quantidade} = R$ ${item.subtotal.toFixed(2)}\n`;
      });
      texto += `   TOTAL: R$ ${venda.total.toFixed(2)}\n\n`;
    });
    
    return texto;
  };

  const exportarWhatsApp = () => {
    const texto = gerarTextoRelatorio();
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Relatórios</h2>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {quickFilters.map(filter => (
            <button
              key={filter.label}
              onClick={() => { setDataInicio(filter.inicio); setDataFim(filter.fim); }}
              style={{ padding: '0.5rem 1rem', background: dataInicio === filter.inicio && dataFim === filter.fim ? '#22c55e' : '#f5f5f5', color: dataInicio === filter.inicio && dataFim === filter.fim ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>{resumo.totalVendas}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Vendas</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>R$ {resumo.totalReceita.toFixed(2)}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Receita</div>
          </div>
        </div>

        <button
          onClick={exportarWhatsApp}
          style={{ width: '100%', padding: '0.75rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Download size={18} /> Enviar Relatório WhatsApp
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Carregando...</p>
        ) : vendas.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Nenhuma venda no período</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Data</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Cliente</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(venda => (
                <tr key={venda.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem' }}>{format(new Date(venda.created_at), 'dd/MM/yyyy HH:mm')}</td>
                  <td style={{ padding: '0.75rem' }}>{venda.cliente_nome || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>
                    R$ {venda.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}