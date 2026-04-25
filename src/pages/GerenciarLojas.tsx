import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Store, Plus, Edit2, Trash2, X, Lock, Unlock, Palette, Smartphone, Save } from 'lucide-react';

interface Loja {
  id: string;
  nome: string;
  nome_loja: string;
  email: string;
  bloqueado: boolean;
  dispositivos_permitidos: number;
  cor_app: string;
  telefone?: string;
}

const cores = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#f59e0b', '#ef4444', '#14b8a6', '#6366f1'
];

export default function GerenciarLojas() {
  const { userProfile } = useAuth();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editLoja, setEditLoja] = useState<Loja | null>(null);
  const [form, setForm] = useState({
    nome: '',
    nome_loja: '',
    email: '',
    password: '',
    telefone: '',
    dispositivos_permitidos: 1,
    cor_app: '#22c55e'
  });

  useEffect(() => {
    if (userProfile?.tipo === 'master') {
      fetchLojas();
    }
  }, [userProfile]);

  const fetchLojas = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo', 'dono')
      .order('nome');
    if (data) setLojas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editLoja) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: form.nome,
          nome_loja: form.nome_loja,
          telefone: form.telefone,
          dispositivos_permitidos: form.dispositivos_permitidos,
          cor_app: form.cor_app
        })
        .eq('id', editLoja.id);
      if (error) {
        setMessage('Erro ao atualizar');
      } else {
        setMessage('Loja atualizada!');
        fetchLojas();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome: form.nome,
          nome_loja: form.nome_loja,
          email: form.email,
          password: form.password,
          telefone: form.telefone,
          tipo: 'dono',
          dispositivos_permitidos: form.dispositivos_permitidos,
          cor_app: form.cor_app,
          bloqueado: false
        });
      if (error) {
        setMessage('Erro ao criar: ' + error.message);
      } else {
        setMessage('Loja criada com sucesso!');
        fetchLojas();
        setShowModal(false);
      }
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleBloqueio = async (loja: Loja) => {
    await supabase
      .from('usuarios')
      .update({ bloqueado: !loja.bloqueado })
      .eq('id', loja.id);
    fetchLojas();
  };

  const excluirLoja = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return;
    await supabase.from('usuarios').delete().eq('id', id);
    fetchLojas();
  };

  const editarLoja = (loja: Loja) => {
    setEditLoja(loja);
    setForm({
      nome: loja.nome,
      nome_loja: loja.nome_loja || loja.nome,
      email: loja.email,
      telefone: loja.telefone || '',
      password: '',
      dispositivos_permitidos: loja.dispositivos_permitidos,
      cor_app: loja.cor_app || '#22c55e'
    });
    setShowModal(true);
  };

  if (userProfile?.tipo !== 'master') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Acesso restrito ao usuário Master</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Gerenciar Lojas</h2>
        <button
          onClick={() => { setEditLoja(null); setForm({ nome: '', nome_loja: '', email: '', password: '', telefone: '', dispositivos_permitidos: 1, cor_app: '#22c55e' }); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Plus size={18} /> Nova Loja
        </button>
      </div>

      {message && (
        <div style={{ background: message.includes('sucesso') ? '#dcfce7' : '#fee2e2', color: message.includes('sucesso') ? '#166534' : '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {lojas.map(loja => (
          <div key={loja.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${loja.cor_app || '#22c55e'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{loja.nome_loja || loja.nome}</h3>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>{loja.email}</p>
              </div>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px', 
                fontSize: '0.75rem',
                background: loja.bloqueado ? '#fee2e2' : '#dcfce7',
                color: loja.bloqueado ? '#991b1b' : '#166534'
              }}>
                {loja.bloqueado ? 'Bloqueada' : 'Ativa'}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
              <Smartphone size={14} style={{ marginRight: '0.25rem' }} />
              {loja.dispositivos_permitidos} dispositivo(s)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => editarLoja(loja)} style={{ flex: 1, padding: '0.5rem', background: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <Edit2 size={14} /> Editar
              </button>
              <button onClick={() => toggleBloqueio(loja)} style={{ flex: 1, padding: '0.5rem', background: loja.bloqueado ? '#dcfce7' : '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                {loja.bloqueado ? <Unlock size={14} /> : <Lock size={14} />}
              </button>
              <button onClick={() => excluirLoja(loja.id)} style={{ padding: '0.5rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'red' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {lojas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Nenhuma loja cadastrada
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '400px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{editLoja ? 'Editar Loja' : 'Nova Loja'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nome do Dono *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nome da Loja *</label>
                <input
                  type="text"
                  value={form.nome_loja}
                  onChange={(e) => setForm({ ...form, nome_loja: e.target.value })}
                  required
                  placeholder="Ex: LF Vendas"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email de Login *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={!!editLoja}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', background: editLoja ? '#f5f5f5' : 'white' }}
                />
              </div>
              {!editLoja && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Senha *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telefone</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  <Smartphone size={16} style={{ marginRight: '0.25rem' }} /> Dispositivos Permitidos
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.dispositivos_permitidos}
                  onChange={(e) => setForm({ ...form, dispositivos_permitidos: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  <Palette size={16} style={{ marginRight: '0.25rem' }} /> Cor do App
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {cores.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setForm({ ...form, cor_app: cor })}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: cor,
                        border: form.cor_app === cor ? '3px solid #333' : 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
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