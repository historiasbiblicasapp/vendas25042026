import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Produto, Cliente } from '../types';
import { ShoppingCart, Trash2, Plus, Minus, Search, User } from 'lucide-react';

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export default function PDV() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showClienteSelect, setShowClienteSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProdutos();
    fetchClientes();
  }, []);

  const fetchProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').eq('usuario_id', user?.id).order('nome');
    if (data) setProdutos(data);
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').eq('usuario_id', user?.id).order('nome');
    if (data) setClientes(data);
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.produto.id === produto.id);
      if (existente) {
        return prev.map(item => item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const atualizarQuantidade = (produtoId: string, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.produto.id === produtoId) {
        const novaQtd = item.quantidade + delta;
        return { ...item, quantidade: novaQtd > 0 ? novaQtd : 0 };
      }
      return item;
    }).filter(item => item.quantidade > 0));
  };

  const total = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);

  const finalizarVenda = async () => {
    if (!user || carrinho.length === 0) return;
    setLoading(true);

    const itens = carrinho.map(item => ({
      produto_id: item.produto.id,
      nome: item.produto.nome,
      quantidade: item.quantidade,
      preco: item.produto.preco,
      subtotal: item.produto.preco * item.quantidade
    }));

    const { error } = await supabase.from('vendas').insert({
      usuario_id: user.id,
      cliente_id: selectedCliente?.id,
      total,
      itens
    });

    if (error) {
      setMessage('Erro ao registrar venda');
    } else {
      setMessage('Venda registrada com sucesso!');
      setCarrinho([]);
      setSelectedCliente(null);
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>PDV - Ponto de Venda</h2>
      
      {message && (
        <div style={{ 
          background: message.includes('sucesso') ? '#dcfce7' : '#fee2e2', 
          color: message.includes('sucesso') ? '#166534' : '#991b1b',
          padding: '0.75rem', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {message}
        </div>
      )}

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <User size={18} color="#22c55e" />
          <button 
            onClick={() => setShowClienteSelect(true)}
            style={{ 
              background: 'none', 
              border: '1px solid #ddd', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {selectedCliente ? selectedCliente.nome : 'Selecionar Cliente (Opcional)'}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#999' }} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>Produtos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {produtosFiltrados.map(produto => (
              <button
                key={produto.id}
                onClick={() => adicionarAoCarrinho(produto)}
                style={{
                  padding: '0.75rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{produto.nome}</div>
                <div style={{ color: '#22c55e', fontWeight: 600 }}>
                  R$ {produto.preco.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  {produto.tipo === 'servico' ? 'Serviço' : 'Produto'} {produto.estoque !== undefined && `- Estoque: ${produto.estoque}`}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShoppingCart size={18} color="#22c55e" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Carrinho</h3>
          </div>
          
          {carrinho.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center' }}>Carrinho vazio</p>
          ) : (
            <>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                {carrinho.map(item => (
                  <div key={item.produto.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.produto.nome}</div>
                        <div style={{ fontSize: '0.875rem', color: '#22c55e' }}>
                          R$ {item.produto.preco.toFixed(2)} x {item.quantidade}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button onClick={() => atualizarQuantidade(item.produto.id, -1)} style={{ padding: '0.25rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ padding: '0 0.5rem' }}>{item.quantidade}</span>
                        <button onClick={() => atualizarQuantidade(item.produto.id, 1)} style={{ padding: '0.25rem', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removerDoCarrinho(item.produto.id)} style={{ marginLeft: '0.5rem', padding: '0.25rem', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 600 }}>
                      R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px solid #22c55e', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 600 }}>
                  <span>Total:</span>
                  <span style={{ color: '#22c55e' }}>R$ {total.toFixed(2)}</span>
                </div>
                <button
                  onClick={finalizarVenda}
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showClienteSelect && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Selecionar Cliente</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {clientes.map(cliente => (
                <button
                  key={cliente.id}
                  onClick={() => { setSelectedCliente(cliente); setShowClienteSelect(false); }}
                  style={{
                    width: '100%', padding: '0.75rem', background: 'none', border: '1px solid #e5e5e5',
                    borderRadius: '4px', marginBottom: '0.5rem', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{cliente.nome}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{cliente.telefone}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowClienteSelect(false)}
              style={{
                width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5',
                border: 'none', borderRadius: '4px', cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}