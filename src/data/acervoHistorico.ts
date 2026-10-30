export interface FotoAcervo {
  id: string;
  src: string;
  titulo: string;
  descricao: string;
  categoria: 'primeiros_alunos' | 'treinos_raiz' | 'graduacoes' | 'competicoes' | 'mestre';
  anoAproximado?: string;
  destaque?: boolean;
}

export const ACERVO_HISTORICO: FotoAcervo[] = [
  {
    id: 'hist-01',
    src: '/896309a9-9b23-4257-9fc0-05ddd198e16a.jpg',
    titulo: 'Primeiras Turmas da Família Gorillaz',
    descricao: 'Reunião dos primeiros guerreiros no tatame que deram início à trajetória do dojo.',
    categoria: 'primeiros_alunos',
    anoAproximado: 'Início da Equipe',
    destaque: true,
  },
  {
    id: 'hist-02',
    src: '/3b70842b-4722-4911-8d84-230828919e12.jpg',
    titulo: 'Treino Geral de Kimono',
    descricao: 'O espírito de irmandade e disciplina presente desde os primeiros passos da academia.',
    categoria: 'treinos_raiz',
    anoAproximado: 'Acervo Histórico',
    destaque: true,
  },
  {
    id: 'hist-03',
    src: '/7935cb82-6949-49d6-a8d1-92bbcf8028b3.jpg',
    titulo: 'Cerimônia de Graduação das Primeiras Faixas',
    descricao: 'Momento solene de entrega de faixas aos atletas que construíram a base técnica do time.',
    categoria: 'graduacoes',
    anoAproximado: 'Acervo Histórico',
    destaque: true,
  },
  {
    id: 'hist-04',
    src: '/fa15639e-36e5-461d-be70-01972bb16f23.jpg',
    titulo: 'Mestre Rogério no Tatame Clássico',
    descricao: 'Registros do Mestre instruindo posições fundamentais de guarda e passagem.',
    categoria: 'mestre',
    anoAproximado: 'Acervo Oficial',
    destaque: true,
  },
  {
    id: 'hist-05',
    src: '/22ef818b-527a-40f9-af12-37da1df5ce64.jpg',
    titulo: 'União e Companheirismo',
    descricao: 'A essência da Família Gorillaz: respeito mútuo, apoio entre irmãos de treino e superação.',
    categoria: 'primeiros_alunos',
    anoAproximado: 'Primeiros Anos',
  },
  {
    id: 'hist-06',
    src: '/60b2ffec-ef4a-419e-ad12-11c6455b4dfd.jpg',
    titulo: 'Ajuste Técnico Personalizado',
    descricao: 'A atenção rigorosa aos detalhes que define o método técnico de ensino da equipe.',
    categoria: 'treinos_raiz',
    anoAproximado: 'Acervo Histórico',
  },
  {
    id: 'hist-07',
    src: '/5d19ab58-b0ef-4a2a-8b61-bb918fe06b72.jpg',
    titulo: 'Equipe de Competição nos Primeiros Campeonatos',
    descricao: 'Representando o estandarte Gorillaz com bravura nos pódios estaduais e nacionais.',
    categoria: 'competicoes',
    anoAproximado: 'Competições Clássicas',
  },
  {
    id: 'hist-08',
    src: '/8068a3c2-1ba6-4d7f-b641-d6abcb90f983.jpg',
    titulo: 'Confraternização de Fim de Ano',
    descricao: 'O tradicional encerramento de temporada reunindo faixas brancas, graduados e famílias.',
    categoria: 'primeiros_alunos',
    anoAproximado: 'Confraternização',
  },
  {
    id: 'hist-09',
    src: '/82df803e-9521-4645-a388-f7d89595c593.jpg',
    titulo: 'Treino Duro • Raízes no Tatame',
    descricao: 'Sessão de rolas intensos com foco em resistência física, guarda impenetrável e finalizações.',
    categoria: 'treinos_raiz',
    anoAproximado: 'Treino Clássico',
  },
  {
    id: 'hist-10',
    src: '/84fce433-bf4a-4efe-8533-72ee2147c32c.jpg',
    titulo: 'Transmissão da Arte Suave',
    descricao: 'Mestre Rogério ensinando os conceitos de alavanca, equilíbrio e postura defensiva.',
    categoria: 'mestre',
    anoAproximado: 'Seminário Técnico',
  },
  {
    id: 'hist-11',
    src: '/8dbe90fd-fab2-40a8-bd88-1a9f0b2e3bf9.jpg',
    titulo: 'Guerreiros da Primeira Geração',
    descricao: 'Os pioneiros que ajudaram a pavimentar o legado e a identidade técnica do dojo.',
    categoria: 'primeiros_alunos',
    anoAproximado: 'Primeira Geração',
  },
  {
    id: 'hist-12',
    src: '/bf862814-abd2-4cf5-8a34-89c36ea8351b.jpg',
    titulo: 'Seminário de Graduação e Honra',
    descricao: 'Palestra de valores éticos e marciais antes da entrega solene de novos graus.',
    categoria: 'graduacoes',
    anoAproximado: 'Graduação Oficial',
  },
  {
    id: 'hist-13',
    src: '/6f621d8b-05fb-4542-bc9b-32fc0cb19542.jpg',
    titulo: 'O Início de Tudo',
    descricao: 'Primeiras fotos registradas no tatame que marcaram o surgimento da bandeira Gorillaz.',
    categoria: 'treinos_raiz',
    anoAproximado: 'Fundação',
  },
  {
    id: 'hist-14',
    src: '/f6f10161-d4e8-4c6f-852c-9f22e9d63ea9.jpg',
    titulo: 'Vitórias em Torneios Oficiais',
    descricao: 'Medalhas conquistadas com suor, respeito às regras e garra inabalável.',
    categoria: 'competicoes',
    anoAproximado: 'Campeonatos',
  },
  {
    id: 'hist-15',
    src: '/8d0dec35-e1c8-4417-9c63-9d25170837d2.jpg',
    titulo: 'Postura e Disciplina',
    descricao: 'A retidão moral ensinada aos alunos desde o primeiro cumprimento no tatame.',
    categoria: 'mestre',
    anoAproximado: 'Doutrina Marcial',
  },
  {
    id: 'hist-16',
    src: '/c2d05445-2d0c-4bf9-a2a6-8caaaf72a092.jpg',
    titulo: 'Tradição que Atravessa Gerações',
    descricao: 'A perpetuação dos valores da arte suave para formar campeões dentro e fora dos tatames.',
    categoria: 'primeiros_alunos',
    anoAproximado: 'Legado Gorillaz',
  },
];
