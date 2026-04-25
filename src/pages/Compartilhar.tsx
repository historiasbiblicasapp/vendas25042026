import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Produto, Cliente } from '../types';
import { Share2, Package, Scissors, User, X } from 'lucide-react';

type TipoCompartilhamento = 'produto' | 'servico' | 'todos_produtos' | 'todos_servicos';

export default function Compartilhar() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoCompartilhamento | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').eq('usuario_id', user?.id).order('nome');
    if (data) setProdutos(data);
  };

  const gerarMensagem = () => {
    let mensagem = 'Olá';
    
    if (tipoSelecionado === 'produto' || tipoSelecionado === 'todos_produtos') {
      const produtosMsg = produtos.filter(p => p.tipo === 'produto');
      if (produtosMsg.length > 0) {
        mensagem += ', segue nossos produtos:\n\n';
        produtosMsg.forEach((p, i) => {
          mensagem += `${i + 1}. ${p.nome}\n`;
          mensagem += `   R$ ${p.preco.toFixed(2)}`;
          if (p.descricao) mensagem += ` - ${p.descricao}`;
          mensagem += `\n`;
        });
      }
    }
    
    if (tipoSelecionado === 'servico' || tipoSelecionado === 'todos_servicos') {
      const servicosMsg = produtos.filter(p => p.tipo === 'servico');
      if (servicosMsg.length > 0) {
        if (tipoSelecionado === 'todos_servicos') {
          mensagem += ', segue nossos serviços:\n\n';
        } else {
          mensagem += '\n\nE também oferecemos:\n\n';
        }
        servicosMsg.forEach((s, i) => {
          mensagem += `${i + 1}. ${s.nome}\n`;
          mensagem += `   R$ ${s.preco.toFixed(2)}`;
          if (s.descricao) mensagem += ` - ${s.descricao}`;
          mensagem += `\n`;
        });
      }
    }
    
    if (!mensagem || mensagem === 'Olá') {
      mensagem = 'Olá,无可alhes para compartilhar no momento.';
    }
    
    return mensagem;
  };

  const compartilharWhatsApp = () => {
    const mensagem = gerarMensagem();
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Compartilhar</h2>
      
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Selecione o que deseja compartilhar via WhatsApp:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => { setTipoSelecionado('todos_produtos'); compartilharWhatsApp(); }}
          disabled={loading}
          style={{
            padding: '1.5rem',
            background: 'white',
            border: '2px solid #e5e5e5',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Package size={32} color="#22c55e" />
          <span style={{ fontWeight: 500 }}>Todos os Produtos</span>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            {produtos.filter(p => p.tipo === 'produto').length} itens
          </span>
        </button>

        <button
          onClick={() => { setTipoSelecionado('todos_servicos'); compartilharWhatsApp(); }}
          disabled={loading}
          style={{
            padding: '1.5rem',
            background: 'white',
            border: '2px solid #e5e5e5',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Scissors size={32} color="#22c55e" />
          <span style={{ fontWeight: 500 }}>Todos os Serviços</span>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            {produtos.filter(p => p.tipo === 'servico').length} serviços
          </span>
        </button>
      </div>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Selecionar Itens Específicos</h3>
        
        {produtos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
            Nenhum produto ou serviço cadastrado
          </p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Produtos</h4>
              {produtos.filter(p => p.tipo === 'produto').map(produto => (
                <button
                  key={produto.id}
                  onClick={() => {
                    setTipoSelecionado('produto');
                    const msg = `Olá, segue informações do produto:\n\n${produto.nome}\nR$ ${produto.preco.toFixed(2)}${produto.descricao ? '\n' + produto.descricao : ''}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{produto.nome}</div>
                    <div style={{ fontSize: '0.875rem', color: '#22c55e', fontWeight: 600 }}>
                      R$ {produto.preco.toFixed(2)}
                    </div>
                  </div>
                  <Share2 size={18} color="#22c55e" />
                </button>
              ))}
            </div>
            
            <div>
              <h4 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Serviços</h4>
              {produtos.filter(p => p.tipo === 'servico').map(servico => (
                <button
                  key={servico.id}
                  onClick={() => {
                    setTipoSelecionado('servico');
                    const msg = `Olá, segue informações do serviço:\n\n${servico.nome}\nR$ ${servico.preco.toFixed(2)}${servico.descricao ? '\n' + servico.descricao : ''}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{servico.nome}</div>
                    <div style={{ fontSize: '0.875rem', color: '#22c55e', fontWeight: 600 }}>
                      R$ {servico.preco.toFixed(2)}
                    </div>
                  </div>
                  <Share2 size={18} color="#22c55e" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}