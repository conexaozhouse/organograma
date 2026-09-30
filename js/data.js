/*
 * Organograma zhouse — DADOS
 * Fonte: 2026_09_29_ORGANOGRAMA_ZHOUSE.pptx (SET | 2026 · Fase 2)
 *
 * Para atualizar pessoas, edite "people". Para atualizar a estrutura, edite "charts".
 * Não é preciso mexer em organograma.js nem no HTML.
 *
 * people[id]
 *   name         nome exibido
 *   photo        caminho da foto, ex.: "images/organograma/rafael-fabrino.jpg"  (vazio = iniciais)
 *   email        vira link mailto:  (vazio = não aparece)
 *   phone        vira link tel:     (vazio = não aparece)
 *   description  mini texto de apresentação (vazio = não aparece)
 *
 * Nó da estrutura (charts[].root e filhos) — use UM destes:
 *   { person: "id" }         pessoa cadastrada em people
 *   { vacant: true }         posição "TBD"/"XX" no PPT (exibida como "A definir")
 *   { area: "Nome" }         área sem pessoa nomeada
 *   { entity: "Nome" }       empresa/parceiro externo
 * Campos opcionais do nó:
 *   role          cargo/área (2ª linha do card no PPT)
 *   tag           selo curto, ex.: "Interino"
 *   note          observação exibida na janela de detalhes
 *   chart         id de outro organograma (botão "Ver estrutura da área")
 *   units         lista de subáreas (caixas cinza do PPT)
 *   children      liderados diretos (em linha)
 *   stack         liderados empilhados sob o card (como no PPT)
 *   transversal   caixa "Atuação transversal" (conectada)
 *   consultants   caixa "Consultores Especializados" (sem conector, como no PPT)
 *   staff         assessorias ligadas lateralmente (side: "left" | "right")
 *   ceo           true = destaque do CEO
 */
window.ORG_DATA = {
  title: "Organograma zhouse",
  period: "SET | 2026 · Fase 2",
  ceo: { person: "rafael-fabrino", role: "CEO", ceo: true }, // exibido no topo de cada organograma de área

  people: {
    "rafael-fabrino":         { name: "Rafael Fabrino", photo: "", email: "", phone: "", description: "" },
    "anna-leticia-azevedo":   { name: "Anna Letícia Azevedo", photo: "", email: "", phone: "", description: "" },
    "bruno-bruschinelli":     { name: "Bruno Bruschinelli", photo: "", email: "", phone: "", description: "" },
    "danilo-zanatta":         { name: "Danilo Zanatta", photo: "", email: "", phone: "", description: "" },
    "gilberto-lima":          { name: "Gilberto Lima", photo: "", email: "", phone: "", description: "" },
    "pedro-treacher":         { name: "Pedro Treacher", photo: "", email: "", phone: "", description: "" },
    "fernanda-schwarzstein":  { name: "Fernanda Schwarzstein", photo: "", email: "", phone: "", description: "" },
    "flavia-aranha":          { name: "Flávia Aranha", photo: "", email: "", phone: "", description: "" },
    "daniela-veltri":         { name: "Daniela Veltri", photo: "", email: "", phone: "", description: "" },
    "evandro-salles":         { name: "Evandro Salles", photo: "", email: "", phone: "", description: "" },
    "peu-cleiuodson-lage":    { name: "Peu – Cleiuodson Lage", photo: "", email: "", phone: "", description: "" },
    "ricardo-tristao":        { name: "Ricardo Tristão", photo: "", email: "", phone: "", description: "" },
    "joao-sampaio":           { name: "João Sampaio", photo: "", email: "", phone: "", description: "" },
    "vaneide-nunes":          { name: "Vaneide Nunes", photo: "", email: "", phone: "", description: "" },
    "fabio-santos":           { name: "Fábio Santos", photo: "", email: "", phone: "", description: "" },
    "tatiana-carapinha":      { name: "Tatiana Carapinha", photo: "", email: "", phone: "", description: "" },
    "lucas-fernandez":        { name: "Lucas Fernandez", photo: "", email: "", phone: "", description: "" },
    "beatriz-galvao":         { name: "Beatriz Galvão", photo: "", email: "", phone: "", description: "" },
    "fernanda-zanetti":       { name: "Fernanda Zanetti", photo: "", email: "", phone: "", description: "" },
    "luciano-lima":           { name: "Luciano Lima", photo: "", email: "", phone: "", description: "" },
    "jorge-ferreira":         { name: "Jorge Ferreira", photo: "", email: "", phone: "", description: "" },
    "allan-figueiredo":       { name: "Allan Figueiredo", photo: "", email: "", phone: "", description: "" },
    "lais-castro":            { name: "Lais Castro", photo: "", email: "", phone: "", description: "" },
    "marco-picucci":          { name: "Marco Picucci", photo: "", email: "", phone: "", description: "" },
    "laura-bollick":          { name: "Laura Bollick", photo: "", email: "", phone: "", description: "" },
    "carolina-pegoraro":      { name: "Carolina Pegoraro", photo: "", email: "", phone: "", description: "" },
    "fernando-guerra":        { name: "Fernando Guerra", photo: "", email: "", phone: "", description: "" },
    "carolina-freitas":       { name: "Carolina Freitas", photo: "", email: "", phone: "", description: "" },
    "fernanda-carneiro":      { name: "Fernanda Carneiro", photo: "", email: "", phone: "", description: "" },
    "barbara-pereira":        { name: "Barbara Pereira", photo: "", email: "", phone: "", description: "" },
    "luiz-camargo":           { name: "Luiz Camargo", photo: "", email: "", phone: "", description: "" },
    "marcos-libretti":        { name: "Marcos Libretti", photo: "", email: "", phone: "", description: "" },
    "renata-luke":            { name: "Renata Luke", photo: "", email: "", phone: "", description: "" },
    "maria-luiza":            { name: "Maria Luiza", photo: "", email: "", phone: "", description: "" },
    "diego-badaro":           { name: "Diego Badaró", photo: "", email: "", phone: "", description: "" },
    "maria-cecilia":          { name: "Maria Cecilia", photo: "", email: "", phone: "", description: "" },
    "gabriel-pires":          { name: "Gabriel Pires", photo: "", email: "", phone: "", description: "" },
    "sr-pedro":               { name: "Sr. Pedro", photo: "", email: "", phone: "", description: "" },
    "thomaz-falcao":          { name: "Thomaz Falcão", photo: "", email: "", phone: "", description: "" },
    "carolina-pinheiro":      { name: "Carolina Pinheiro", photo: "", email: "", phone: "", description: "" },
    "eline-martins":          { name: "Eline Martins", photo: "", email: "", phone: "", description: "" },
    "jasmine-davies":         { name: "Jasmine Davies", photo: "", email: "", phone: "", description: "" },
    "carolina-rangel":        { name: "Carolina Rangel", photo: "", email: "", phone: "", description: "" },
    "thais-sereno":           { name: "Thais Sereno", photo: "", email: "", phone: "", description: "" },
    "julio-kuhner":           { name: "Julio Kuhner – Pitanga", photo: "", email: "", phone: "", description: "" },
    "fabio-ferreira":         { name: "Fabio Ferreira", photo: "", email: "", phone: "", description: "" },
    "monica-brizolla":        { name: "Monica Brizolla", photo: "", email: "", phone: "", description: "" },
    "alessandra-dias":        { name: "Alessandra Dias", photo: "", email: "", phone: "", description: "" },
    "maria-eduarda":          { name: "Maria Eduarda", photo: "", email: "", phone: "", description: "" },
    "jorge":                  { name: "Jorge", photo: "", email: "", phone: "", description: "" },
    "felipe-caliman":         { name: "Felipe Caliman", photo: "", email: "", phone: "", description: "" },
    "ana-julia":              { name: "Ana Julia", photo: "", email: "", phone: "", description: "" },
    "tatiana-padron":         { name: "Tatiana Padron", photo: "", email: "", phone: "", description: "" },
    "bruna-martins":          { name: "Bruna Martins", photo: "", email: "", phone: "", description: "" },
    "fabio-hage":             { name: "Fabio Hage", photo: "", email: "", phone: "", description: "" },
    "gilberto-santos":        { name: "Gilberto Santos", photo: "", email: "", phone: "", description: "" },
    "oscar-santos":           { name: "Oscar Santos", photo: "", email: "", phone: "", description: "" },
    "claudia-bechara":        { name: "Claudia Bechara", photo: "", email: "", phone: "", description: "" },
    "glaucia":                { name: "Glaucia", photo: "", email: "", phone: "", description: "" },
    "renata-pitombo":         { name: "Renata Pitombo", photo: "", email: "", phone: "", description: "" }
  },

  charts: [
    /* ---------- Slide 1 — visão geral ---------- */
    {
      id: "visao-geral",
      label: "Visão geral",
      root: {
        person: "rafael-fabrino", role: "CEO", ceo: true,
        staff: [
          { person: "anna-leticia-azevedo", role: "PMO de Transição Organizacional", side: "left" },
          { person: "bruno-bruschinelli", role: "Processos", side: "right" }
        ],
        children: [
          { person: "danilo-zanatta", role: "Operações Hospitalidade e Gastronomia", chart: "hospitalidade",
            units: ["Paraty", "Trijunção", "Pantanal", "Trancoso", "Tiradentes"] },
          { person: "gilberto-lima", role: "Produção Agrícola e Gestão de Terras", chart: "agro",
            units: ["Paraty/Cunha", "Trijunção", "Trancoso", "Piauí", "Baunilha", "Mel", "Orgânicos"] },
          { person: "pedro-treacher", role: "Comercial e Marketing", chart: "comercial",
            units: ["Comercial Hospitalidade", "Comercial Produtos Agro", "Planejamento & Preço", "Marketing & Desenvolvimento", "Automação e Eficiência"] },
          { person: "fernanda-schwarzstein", role: "Amma", chart: "amma" },
          { vacant: true, role: "Juçai", chart: "jucai" },
          { person: "flavia-aranha", role: "Flavia Aranha", chart: "flavia-aranha" },
          { vacant: true, role: "Desenvolvimento Territorial + NbS", chart: "territorial" },
          { person: "daniela-veltri", role: "Jurídico", chart: "juridico" },
          { person: "evandro-salles", role: "Centro de Serviços Compartilhados", chart: "csc",
            units: ["Pessoas & Cultura", "FP&A", "Compras", "Fiscal", "Controladoria", "Tesouraria", "TI", "Processos", "Data / Interatividade"] },
          { area: "Estrutura em evolução",
            units: ["Criadouro", "Fábricas Juçai e Amma", "Instituto Humanize", "Senior Living – EUA"] }
        ],
        consultants: [ { area: "Assessoria Reputacional" } ]
      }
    },

    /* ---------- Slide 2 ---------- */
    {
      id: "hospitalidade",
      label: "Hospitalidade e Gastronomia",
      root: {
        person: "danilo-zanatta", role: "Operações Hospitalidade e Gastronomia",
        units: ["Pantanal", "Alter do Chão"],
        children: [
          { person: "peu-cleiuodson-lage", role: "Rio do Brasil", units: ["Experiências e Projetos Sociais"] },
          { person: "ricardo-tristao", role: "Trancoso", units: ["Tutabel", "Tutabar", "Villas de Trancoso"] },
          { person: "danilo-zanatta", role: "Paraty", tag: "Interino",
            units: ["Literária", "Quintal das Letras", "Empório Daqui", "Livraria das Mares", "Villa Jequitibá", "Mamanguá"] },
          { person: "joao-sampaio", role: "Trijunção", units: ["Trijunção"] },
          { person: "vaneide-nunes", role: "Tiradentes", units: ["Villa da Matriz"] }
        ],
        transversal: [
          { person: "fabio-santos", role: "Manutenção" },
          { person: "tatiana-carapinha", role: "Comercial Vilas" },
          { person: "lucas-fernandez", role: "Qualidade" },
          { person: "beatriz-galvao", role: "Treinamentos" }
        ],
        consultants: [
          { person: "fernanda-zanetti", role: "Gastronomia" },
          { person: "luciano-lima", role: "Experiências e Conteúdos" },
          { person: "jorge-ferreira", role: "Experiências e Conteúdos" }
        ]
      }
    },

    /* ---------- Slide 3 ---------- */
    {
      id: "agro",
      label: "Produção Agrícola",
      root: {
        person: "gilberto-lima", role: "Produção Agrícola e Gestão de Terras",
        children: [
          { person: "gilberto-lima", role: "Piauí" },
          { person: "allan-figueiredo", role: "Trijunção" },
          { person: "lais-castro", role: "Paraty/Cunha" },
          { person: "marco-picucci", role: "Trancoso" }
        ],
        transversal: [
          { person: "marco-picucci", role: "Baunilha" },
          { person: "laura-bollick", role: "Mel" },
          { person: "allan-figueiredo", role: "Queijo de Ovelha" },
          { person: "allan-figueiredo", role: "Uva" }
        ]
      }
    },

    /* ---------- Slide 4 ---------- */
    {
      id: "comercial",
      label: "Comercial e Marketing",
      root: {
        person: "pedro-treacher", role: "Comercial e Marketing",
        children: [
          { person: "carolina-pegoraro", role: "Comercial Hospitalidade" },
          { person: "fernando-guerra", role: "Comercial Fazenda Bananal" }
        ],
        transversal: [
          { person: "carolina-freitas", role: "Planejamento e Projetos" },
          { vacant: true, role: "Planejamento Comercial & Operações" },
          { person: "fernanda-carneiro", role: "Mktg – Produtos" },
          { person: "barbara-pereira", role: "Mktg – Inhouse" },
          { area: "Automação e Eficiência" }
        ],
        consultants: [
          { person: "luiz-camargo", role: "Baunilha" },
          { person: "marcos-libretti", role: "Vinhos" },
          { person: "renata-luke", role: "Comercial Hospitalidade" }
        ]
      }
    },

    /* ---------- Slide 5 ---------- */
    {
      id: "amma",
      label: "Amma",
      root: {
        person: "fernanda-schwarzstein", role: "Amma",
        children: [
          { person: "maria-luiza", role: "Logística e Operações", units: ["Fábrica Salvador", "Qualidade", "Logística"] },
          { area: "Comercial", units: ["Vendas B2B", "E-commerce", "Loja Salvador", "Growth"] }
        ],
        consultants: [
          { person: "diego-badaro", role: "Cacau" },
          { entity: "Umuana", role: "Agência Mktg" },
          { entity: "Amazon", role: "Operação Logística" },
          { person: "maria-cecilia", role: "Vendas B2B" }
        ]
      }
    },

    /* ---------- Slide 6 ---------- */
    {
      id: "jucai",
      label: "Juçai",
      root: {
        vacant: true, role: "Juçai",
        children: [
          { person: "maria-luiza", role: "Logística e Operações", units: ["Fábrica Penedo", "Suprimentos"] },
          { area: "Comercial", units: ["Exportação", "Parques"] },
          { area: "Logística" }
        ],
        consultants: [
          { person: "gabriel-pires", role: "Comercial" },
          { person: "sr-pedro", role: "Juçara" }
        ]
      }
    },

    /* ---------- Slide 7 ---------- */
    {
      id: "flavia-aranha",
      label: "Flavia Aranha",
      root: {
        person: "flavia-aranha", role: "Operações Flavia Aranha",
        children: [
          { area: "Comercial", units: ["Loja Paraty", "Loja São Paulo", "E-commerce"] },
          { area: "Produção" },
          { area: "Desenvolvimento" },
          { area: "Pessoas e Cultura" },
          { area: "Administrativo e Financeiro" }
        ],
        consultants: [ { person: "thomaz-falcao", role: "Finanças e Operações" } ]
      }
    },

    /* ---------- Slide 8 ---------- */
    {
      id: "territorial",
      label: "Desenvolvimento Territorial",
      root: {
        vacant: true, role: "Desenvolvimento Territorial",
        children: [
          { person: "carolina-pinheiro", role: "Gestão Patrimonial" },
          { person: "eline-martins", role: "Sustentabilidade" },
          { area: "Projetos NbS" }
        ]
      }
    },

    /* ---------- Slide 9 ---------- */
    {
      id: "juridico",
      label: "Jurídico",
      root: {
        person: "daniela-veltri", role: "Jurídico",
        children: [
          { person: "jasmine-davies", role: "Projuris" },
          { person: "carolina-rangel" },
          { person: "thais-sereno" },
          { vacant: true },
          { person: "carolina-pinheiro", role: "Gestão Patrimonial", tag: "Interino", note: "Interino – finalizar regularizações" }
        ],
        consultants: [ { person: "julio-kuhner", role: "Societário e Tributário" } ]
      }
    },

    /* ---------- Slide 10 ---------- */
    {
      id: "csc",
      label: "CSC",
      root: {
        vacant: true, role: "CSC",
        children: [
          { area: "Pessoas & Cultura", stack: [
              { person: "fabio-ferreira", role: "Remuneração e Org Design" },
              { person: "monica-brizolla", role: "Gestão Social e Segurança do Trabalho" },
              { person: "alessandra-dias", role: "Parceira de Pessoas e Cultura",
                units: ["RH's Territórios", "Seleção / Desenvolvimento", "Cultura e Comunicação"] }
          ] },
          { area: "Compras", stack: [ { person: "maria-eduarda" }, { person: "jorge" } ] },
          { person: "felipe-caliman", role: "Finanças e Planejamento", stack: [ { person: "ana-julia" }, { person: "tatiana-padron" } ] },
          { person: "bruna-martins", role: "Controladoria" },
          { area: "Tesouraria", stack: [ { person: "fabio-hage" } ] }
        ],
        consultants: [
          { person: "gilberto-santos", role: "Contábil" },
          { person: "oscar-santos", role: "Tecnologia" },
          { entity: "ADP", role: "Gestão Social" },
          { person: "claudia-bechara", role: "Suporte Saúde" }
        ]
      }
    },

    /* ---------- Slide 11 ---------- */
    {
      id: "humanize",
      label: "Instituto Humanize",
      root: {
        area: "Instituto Humanize",
        children: [
          { person: "glaucia", role: "Políticas Públicas" },
          { person: "renata-pitombo", role: "Centro de Fauna Trijunção" },
          { person: "renata-pitombo", role: "Centro de Fauna Pantanal" },
          { area: "Facilitação de Territórios e Projetos de Educação" },
          { person: "lais-castro", role: "Projeto Cultivar" }
        ]
      }
    }
  ]
};
