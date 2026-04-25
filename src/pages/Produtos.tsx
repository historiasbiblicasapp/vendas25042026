import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Produto } from '../types';
import { Plus, Edit2, Trash2, X, Package, Scissors } from 'lucide-react';

export default function Produtos() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduto, setEditProduto] = useState<Produto | null>(null);
  const [tipo, setTipo] = useState<'produto' | 'servico'>('produto');
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', estoque: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').eq('usuario_id', user?.id).order('nome');
    if (data) setProdutos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const payload = {
      nome: form.nome,
      descricao: form.descricao || null,
      preco: parseFloat(form.preco),
      tipo,
      estoque: tipo === 'produto' ? parseInt(form.estoque) || 0 : null
    };

    if (editProduto) {
      const { error } = await supabase.from('produtos').update(payload).eq('id', editProduto.id);
      if (error) {
        setMessage('Erro ao atualizar');
      } else {
        setMessage('Atualizado!');
        fetchProdutos();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase.from('produtos').insert({ ...payload, usuario_id: user.id });
      if (error) {
        setMessage('Erro ao cadastrar');
      } else {
        setMessage('Cadastrado!');
        fetchProdutos();
        setShowModal(false);
      }
    }
    setLoading(false);
    setForm({ nome: '', descricao: '', preco: '', estoque: '' });
    setEditProduto(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const editarProduto = (produto: Produto) => {
    setEditProduto(produto);
    setTipo(produto.tipo);
    setForm({ 
      nome: produto.nome, 
      descricao: produto.descricao || '', 
      preco: produto.preco.toString(), 
      estoque: produto.estoque?.toString() || '' 
    });
    setShowModal(true);
  };

  const excluirProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    await supabase.from('produtos').delete().eq('id', id);
    fetchProdutos();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Produtos e Serviços</h2>
        <button
          onClick={() => { setEditProduto(null); setForm({ nome: '', descricao: '', preco: '', estoque: '' }); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      {message && (
        <div style={{ background: message.includes('sucesso') || message.includes('Cadastrado') || message.includes('Atualizado') ? '#dcfce7' : '#fee2e2', color: message.includes('sucesso') || message.includes('Cadastrado') || message.includes('Atualizado') ? '#166534' : '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {produtos.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Nenhum produto ou serviço cadastrado</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Nome</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Preço</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Estoque</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(produto => (
                <tr key={produto.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem' }}>{produto.nome}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: produto.tipo === 'produto' ? '#dbeafe' : '#fce7f3', color: produto.tipo === 'produto' ? '#1d4ed8' : '#be185d', borderRadius: '4px', fontSize: '0.875rem' }}>
                      {produto.tipo === 'produto' ? <Package size={14} /> : <Scissors size={14} />}
                      {produto.tipo === 'produto' ? 'Produto' : 'Serviço'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#22c55e', fontWeight: 600 }}>R$ {produto.preco.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>{produto.estoque ?? '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button onClick={() => editarProduto(produto)} style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => excluirProduto(produto.id)} style={{ marginLeft: '0.5rem', padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{editProduto ? 'Editar' : 'Novo'} Produto/Serviço</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setTipo('produto')}
                style={{ flex: 1, padding: '0.75rem', background: tipo === 'produto' ? '#22c55e' : '#f5f5f5', color: tipo === 'produto' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Package size={18} /> Produto
              </button>
              <button
                type="button"
                onClick={() => setTipo('servico')}
                style={{ flex: 1, padding: '0.75rem', background: tipo === 'servico' ? '#22c55e' : '#f5f5f5', color: tipo === 'servico' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Scissors size={18} /> Serviço
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Preço *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              {tipo === 'produto' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={form.estoque}
                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}