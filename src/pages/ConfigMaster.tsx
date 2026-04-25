import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Settings, Lock, Unlock, Smartphone, Palette, Users, Save, X } from 'lucide-react';

interface DonoLoja {
  id: string;
  nome: string;
  email: string;
  bloqueado: boolean;
  dispositivos_permitidos: number;
  cor_app: string;
}

export default function ConfigMaster() {
  const { userProfile, updateProfile } = useAuth();
  const [donoLoja, setDonoLoja] = useState<DonoLoja | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [corApp, setCorApp] = useState('#22c55e');
  const [dispositivos, setDispositivos] = useState(1);
  const [bloqueado, setBloqueado] = useState(false);
  const [showCorPicker, setShowCorPicker] = useState(false);

  const cores = [
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', 
    '#f59e0b', '#ef4444', '#14b8a6', '#6366f1'
  ];

  useEffect(() => {
    if (userProfile?.tipo === 'master') {
      fetchDonoLoja();
    }
  }, [userProfile]);

  const fetchDonoLoja = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo', 'dono')
      .single();
    if (data) {
      setDonoLoja(data);
      setCorApp(data.cor_app || '#22c55e');
      setDispositivos(data.dispositivos_permitidos || 1);
      setBloqueado(data.bloqueado || false);
    }
  };

  const salvarConfigs = async () => {
    if (!donoLoja) return;
    setLoading(true);

    const { error } = await supabase
      .from('usuarios')
      .update({
        dispositivos_permitidos: dispositivos,
        bloqueado,
        cor_app: corApp
      })
      .eq('id', donoLoja.id);

    if (error) {
      setMessage('Erro ao salvar configurações');
    } else {
      setMessage('Configurações salvas!');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (userProfile?.tipo !== 'master') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Acesso restrito ao usuário master</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Configurações Master</h2>

      {message && (
        <div style={{ 
          background: message.includes('sucesso') || message.includes('salvas') ? '#dcfce7' : '#fee2e2', 
          color: message.includes('sucesso') || message.includes('salvas') ? '#166534' : '#991b1b',
          padding: '0.75rem', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {message}
        </div>
      )}

      {donoLoja && (
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Dono da Loja
          </h3>
          <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 500 }}>{donoLoja.nome}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{donoLoja.email}</div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <Lock size={18} /> Bloquear Acesso
            </label>
            <button
              onClick={() => setBloqueado(!bloqueado)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: bloqueado ? '#fee2e2' : '#dcfce7',
                color: bloqueado ? '#991b1b' : '#166534',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {bloqueado ? <Lock size={18} /> : <Unlock size={18} />}
              {bloqueado ? 'Conta Bloqueada' : 'Conta Ativa'}
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <Smartphone size={18} /> Dispositivos Permitidos
            </label>
            <input
              type="number"
              min="1"
              value={dispositivos}
              onChange={(e) => setDispositivos(parseInt(e.target.value) || 1)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Quantos dispositivos o usuário pode usar simultaneamente
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <Palette size={18} /> Cor do Aplicativo
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {cores.map(cor => (
                <button
                  key={cor}
                  onClick={() => setCorApp(cor)}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: cor,
                    border: corApp === cor ? '3px solid #333' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              Cor atual: <span style={{ color: corApp, fontWeight: 600 }}>{corApp}</span>
            </p>
          </div>

          <button
            onClick={salvarConfigs}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      )}

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Sua Conta</h3>
        <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px' }}>
          <div style={{ fontWeight: 500 }}>{userProfile?.nome}</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>{userProfile?.email}</div>
          <div style={{ fontSize: '0.875rem', color: '#22c55e', marginTop: '0.25rem' }}>
           Tipo: {userProfile?.tipo === 'master' ? 'Master' : 'Dono da Loja'}
          </div>
        </div>
      </div>
    </div>
  );
}