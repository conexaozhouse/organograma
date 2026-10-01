/*
 * Organograma zhouse — DADOS
 * Fonte: 2026_09_29_ORGANOGRAMA_ZHOUSE.pptx (SET | 2026 · Fase 2)
 *
 * Para atualizar pessoas, edite "people". Para atualizar a estrutura, edite "charts".
 * Não é preciso mexer em organograma.js nem no HTML.
 *
 * (PROVISÓRIO: descrições em "Lorem ipsum", e-mails @exemplo.com.br e telefones (00) 00000-0000
 *  são fictícios, só para visualização — substitua pelos dados reais ou deixe "" para ocultar.)
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
 *   staff         assessorias abaixo do card, presas ao tronco (side: "left" | "right", dashed: true = linha pontilhada)
 *   matrix        lista de "Gestão matricial" à esquerda do card (contorno e linha pontilhados)
 *   aside         nós à direita do card, no mesmo nível (ex.: interino ligado à liderança)
 *   ceo           true = destaque do CEO
 */
window.ORG_DATA = {
  title: "Organograma zhouse",
  period: "SET | 2026 · Fase 2",
  updated: "29/09/2026", // data exibida no botão de ajuda (?)
  about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
  ceo: { person: "rafael-fabrino", role: "CEO", ceo: true }, // exibido no topo de cada organograma de área

  people: {
    "rafael-fabrino":         { name: "Rafael Fabrino", photo: "", email: "rafael.fabrino@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "anna-leticia-azevedo":   { name: "Anna Letícia Azevedo", photo: "", email: "anna.leticia.azevedo@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "bruno-bruschinelli":     { name: "Bruno Bruschinelli", photo: "", email: "bruno.bruschinelli@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "danilo-zanatta":         { name: "Danilo Zanatta", photo: "", email: "danilo.zanatta@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "gilberto-lima":          { name: "Gilberto Lima", photo: "", email: "gilberto.lima@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "pedro-treacher":         { name: "Pedro Treacher", photo: "", email: "pedro.treacher@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fernanda-schwarzstein":  { name: "Fernanda Schwarzstein", photo: "", email: "fernanda.schwarzstein@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "flavia-aranha":          { name: "Flávia Aranha", photo: "", email: "flavia.aranha@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "daniela-veltri":         { name: "Daniela Veltri", photo: "", email: "daniela.veltri@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "evandro-salles":         { name: "Evandro Salles", photo: "", email: "evandro.salles@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "peu-cleiuodson-lage":    { name: "Peu – Cleiuodson Lage", photo: "", email: "peu.cleiuodson.lage@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "ricardo-tristao":        { name: "Ricardo Tristão", photo: "", email: "ricardo.tristao@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "joao-sampaio":           { name: "João Sampaio", photo: "", email: "joao.sampaio@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "vaneide-nunes":          { name: "Vaneide Nunes", photo: "", email: "vaneide.nunes@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fabio-santos":           { name: "Fábio Santos", photo: "", email: "fabio.santos@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "tatiana-carapinha":      { name: "Tatiana Carapinha", photo: "", email: "tatiana.carapinha@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "lucas-fernandez":        { name: "Lucas Fernandez", photo: "", email: "lucas.fernandez@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "beatriz-galvao":         { name: "Beatriz Galvão", photo: "", email: "beatriz.galvao@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fernanda-zanetti":       { name: "Fernanda Zanetti", photo: "", email: "fernanda.zanetti@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "luciano-lima":           { name: "Luciano Lima", photo: "", email: "luciano.lima@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "jorge-ferreira":         { name: "Jorge Ferreira", photo: "", email: "jorge.ferreira@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "allan-figueiredo":       { name: "Allan Figueiredo", photo: "", email: "allan.figueiredo@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "lais-castro":            { name: "Lais Castro", photo: "", email: "lais.castro@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "marco-picucci":          { name: "Marco Picucci", photo: "", email: "marco.picucci@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "laura-bollick":          { name: "Laura Bollick", photo: "", email: "laura.bollick@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "carolina-pegoraro":      { name: "Carolina Pegoraro", photo: "", email: "carolina.pegoraro@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fernando-guerra":        { name: "Fernando Guerra", photo: "", email: "fernando.guerra@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "carolina-freitas":       { name: "Carolina Freitas", photo: "", email: "carolina.freitas@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fernanda-carneiro":      { name: "Fernanda Carneiro", photo: "", email: "fernanda.carneiro@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "barbara-pereira":        { name: "Barbara Pereira", photo: "", email: "barbara.pereira@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "luiz-camargo":           { name: "Luiz Camargo", photo: "", email: "luiz.camargo@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "marcos-libretti":        { name: "Marcos Libretti", photo: "", email: "marcos.libretti@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "renata-luke":            { name: "Renata Luke", photo: "", email: "renata.luke@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "maria-luiza":            { name: "Maria Luiza Silva", photo: "", email: "maria.luiza@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "diego-badaro":           { name: "Diego Badaró", photo: "", email: "diego.badaro@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "maria-cecilia":          { name: "Maria Cecilia", photo: "", email: "maria.cecilia@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "gabriel-pires":          { name: "Gabriel Pires", photo: "", email: "gabriel.pires@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "sr-pedro":               { name: "Sr. Pedro", photo: "", email: "sr.pedro@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "thomaz-falcao":          { name: "Thomaz Falcão", photo: "", email: "thomaz.falcao@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "carolina-pinheiro":      { name: "Carolina Pinheiro", photo: "", email: "carolina.pinheiro@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "eline-martins":          { name: "Eline Martins", photo: "", email: "eline.martins@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "jasmine-davies":         { name: "Jasmine Davies", photo: "", email: "jasmine.davies@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "carolina-rangel":        { name: "Carolina Rangel", photo: "", email: "carolina.rangel@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "thais-sereno":           { name: "Thais Sereno", photo: "", email: "thais.sereno@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "julio-kuhner":           { name: "Julio Kuhner – Pitanga", photo: "", email: "julio.kuhner@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fabio-ferreira":         { name: "Fabio Ferreira", photo: "", email: "fabio.ferreira@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "monica-brizolla":        { name: "Monica Brizolla", photo: "", email: "monica.brizolla@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "alessandra-dias":        { name: "Alessandra Dias", photo: "", email: "alessandra.dias@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "maria-eduarda":          { name: "Maria Eduarda", photo: "", email: "maria.eduarda@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "jorge":                  { name: "Jorge", photo: "", email: "jorge@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "felipe-caliman":         { name: "Felipe Caliman", photo: "", email: "felipe.caliman@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "ana-julia":              { name: "Ana Julia", photo: "", email: "ana.julia@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "tatiana-padron":         { name: "Tatiana Padron", photo: "", email: "tatiana.padron@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "bruna-martins":          { name: "Bruna Martins", photo: "", email: "bruna.martins@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "fabio-hage":             { name: "Fabio Hage", photo: "", email: "fabio.hage@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "gilberto-santos":        { name: "Gilberto Santos", photo: "", email: "gilberto.santos@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "oscar-santos":           { name: "Oscar Santos", photo: "", email: "oscar.santos@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "claudia-bechara":        { name: "Claudia Bechara", photo: "", email: "claudia.bechara@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "glaucia":                { name: "Glaucia", photo: "", email: "glaucia@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." },
    "renata-pitombo":         { name: "Renata Pitombo", photo: "", email: "renata.pitombo@exemplo.com.br", phone: "(00) 00000-0000", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation." }
  },

  charts: [
    /* ---------- Slide 1 — visão geral ---------- */
    {
      id: "visao-geral",
      label: "Visão geral",
      root: {
        person: "rafael-fabrino", role: "CEO", ceo: true,
        staff: [
          { person: "anna-leticia-azevedo", role: "PMO de Transição Organizacional", side: "left", dashed: true },
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
        alignChild: 3, // alinha o 4º liderado (João Sampaio) embaixo do Danilo
        matrix: ["Pantanal", "Alter do Chão"],
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
          { vacant: true }
        ],
        aside: [ { person: "carolina-pinheiro", role: "Gestão Patrimonial", tag: "Interino" } ],
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
        vacant: true, role: "Instituto Humanize",
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
