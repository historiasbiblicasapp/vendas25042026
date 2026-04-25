import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kmrthcsnjbyufzsphsev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNjU5MzAwMCwiZXhwIjoyMDIyMTY5MDAwfQ.ZhuoF8yW5_-pXOYlNQV-7Q_qBvHJiTM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function criarUsuarios() {
  console.log('Criando usuários...');

  const usuariosIniciais = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'dono@lfvendas.com',
      nome: 'Dono da Loja',
      password: 'dono123',
      tipo: 'dono',
      bloqueado: false,
      dispositivos_permitidos: 1,
      cor_app: '#22c55e'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'master@lfvendas.com',
      nome: 'Admin Master',
      password: 'master123',
      tipo: 'master',
      bloqueado: false,
      dispositivos_permitidos: 999,
      cor_app: '#22c55e'
    }
  ];

  for (const usuario of usuariosIniciais) {
    const { error } = await supabase
      .from('usuarios')
      .upsert(usuario, { onConflict: 'email' });
    
    if (error) {
      console.log(`Erro ao criar ${usuario.email}:`, error.message);
    } else {
      console.log(`Usuário criado: ${usuario.email} / ${usuario.password}`);
    }
  }
  
  console.log('=============================');
  console.log('BEM VINDO AO LF VENDAS!');
  console.log('=============================');
  console.log('Usuários disponíveis:');
  console.log('1. Dono: dono@lfvendas.com | senha: dono123');
  console.log('2. Master: master@lfvendas.com | senha: master123');
  console.log('=============================');
}

criarUsuarios()
  .then(() => console.log('Concluído!'))
  .catch(err => console.error('Erro:', err));