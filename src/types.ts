export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  tipo: 'produto' | 'servico';
  estoque?: number;
  imagem?: string;
  created_at: string;
}

export interface Venda {
  id: string;
  cliente_id?: string;
  usuario_id: string;
  total: number;
  itens: VendaItem[];
  created_at: string;
}

export interface VendaItem {
  produto_id: string;
  nome: string;
  quantidade: number;
  preco: number;
  subtotal: number;
}