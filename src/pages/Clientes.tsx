import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Cliente } from '../types';
import { Plus, Edit2, Trash2, X, Phone } from 'lucide-react';

export default function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', endereco: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').eq('usuario_id', user?.id).order('nome');
    if (data) setClientes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    if (editCliente) {
      const { error } = await supabase.from('clientes').update(form).eq('id', editCliente.id);
      if (error) {
        setMessage('Erro ao atualizar');
      } else {
        setMessage('Cliente atualizado!');
        fetchClientes();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase.from('clientes').insert({ ...form, usuario_id: user.id });
      if (error) {
        setMessage('Erro ao cadastrar');
      } else {
        setMessage('Cliente cadastrado!');
        fetchClientes();
        setShowModal(false);
      }
    }
    setLoading(false);
    setForm({ nome: '', telefone: '', email: '', endereco: '' });
    setEditCliente(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const editarCliente = (cliente: Cliente) => {
    setEditCliente(cliente);
    setForm({ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email || '', endereco: cliente.endereco || '' });
    setShowModal(true);
  };

  const excluirCliente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    await supabase.from('clientes').delete().eq('id', id);
    fetchClientes();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Clientes</h2>
        <button
          onClick={() => { setEditCliente(null); setForm({ nome: '', telefone: '', email: '', endereco: '' }); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {message && (
        <div style={{ background: message.includes('sucesso') || message.includes('cadastrado') || message.includes('atualizado') ? '#dcfce7' : '#fee2e2', color: message.includes('sucesso') || message.includes('cadastrado') || message.includes('atualizado') ? '#166534' : '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {clientes.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Nenhum cliente cadastrado</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Nome</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Telefone</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem' }}>{cliente.nome}</td>
                  <td style={{ padding: '0.75rem' }}>{cliente.telefone}</td>
                  <td style={{ padding: '0.75rem' }}>{cliente.email || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button onClick={() => editarCliente(cliente)} style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => excluirCliente(cliente.id)} style={{ marginLeft: '0.5rem', padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
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
              <h3 style={{ margin: 0 }}>{editCliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X />
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telefone *</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
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