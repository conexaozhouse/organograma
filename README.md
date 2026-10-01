# Organograma zhouse

Página estática (HTML + CSS + JS puro, sem bibliotecas) para publicar no GitHub Pages e incorporar na intranet Conexão via iframe.

```
organograma/
  index.html               página
  css/styles.css           estilos (todos escopados em .org-app)
  js/data.js               DADOS — pessoas e estrutura (edite aqui)
  js/organograma.js        renderização e interação (não precisa editar)
  fonts/                   Rubik + Material Icons (mesmas da intranet, servidas localmente)
  images/organograma/      fotos das pessoas (ver LEIA-ME.md)
```

## Publicar
1. Suba a pasta `organograma/` para um repositório e ative o GitHub Pages.
2. Na intranet, incorpore:
   ```html
   <iframe src="https://SEU-USUARIO.github.io/SEU-REPO/organograma/" title="Organograma zhouse"
           style="width:100%;height:800px;border:0"></iframe>
   ```
3. Link direto para uma área: adicione `#id` ao final, ex.: `.../organograma/#juridico`.
   Ids: `visao-geral`, `hospitalidade`, `agro`, `comercial`, `amma`, `jucai`, `flavia-aranha`, `territorial`, `juridico`, `csc`, `humanize`.

## Atualizar
Tudo fica em `js/data.js` (o cabeçalho do arquivo explica cada campo).
- **Contato/descrição/foto:** preencha `email`, `phone`, `description`, `photo` em `people`. Campos vazios não aparecem.
- **Nova pessoa:** adicione em `people` com um id (minúsculas, sem acento, com hífen) e use `{ person: "id", role: "…" }` na estrutura.
- **Mudar liderança:** mova o nó para dentro dos `children` (ou `stack`) do novo líder.
- **Nova área:** adicione um objeto em `charts` — a aba aparece sozinha.

## Como usar
- Abas no topo trocam entre a visão geral e cada área (setas ← → no teclado).
- Busca por nome, cargo ou área — leva até o card e abre os detalhes.
- Clique em uma pessoa para ver foto, cargo, apresentação e contatos. Esc fecha.
- Zoom: botões − / + , "Ajustar à tela", "Tamanho real", ou Ctrl + roda do mouse. Arraste o fundo para mover.
- O número abaixo de um card recolhe/expande a equipe.

## Leitura do PPT (2026_09_29_ORGANOGRAMA_ZHOUSE.pptx)
A hierarquia foi lida dos **conectores** de cada slide (quem liga a quem), não só da posição visual.

| Slide | Aba |
|---|---|
| 1 | Visão geral |
| 2 | Hospitalidade e Gastronomia |
| 3 | Produção Agrícola |
| 4 | Comercial e Marketing |
| 5 | Amma |
| 6 | Juçai |
| 7 | Flavia Aranha |
| 8 | Desenvolvimento Territorial |
| 9 | Jurídico |
| 10 | CSC |
| 11 | Instituto Humanize |

Convenções do PPT mantidas: caixas cinza = subáreas; caixa bege = **Atuação transversal** (conectada ao líder); caixa azul = **Consultores especializados** (sem conector no PPT); verde = **Interino**. "TBD" e "XX" aparecem como **A definir**.

### Decisões confirmadas
- **Anna Letícia Azevedo (PMO de Transição Organizacional)** — anexo do CEO: abaixo, à esquerda, linha pontilhada.
- **Bruno Bruschinelli (Processos)** — mesma altura da Anna, à direita, linha contínua. Os diretores não se ligam a eles.
- **Pantanal e Alter do Chão** = "Gestão Matricial" do slide 2: à esquerda do Danilo Zanatta, contorno e linha pontilhados.
- **Atuação transversal** sai da lateral direita do líder (Danilo, Gilberto, Pedro), sem se ligar à barra dos demais.
- **Carolina Pinheiro (Jurídico, interino)** sai da direita da Daniela Veltri.
- **Maria Luiza Silva** é a mesma pessoa em Amma e Juçai. **Jorge** (Compras) fica sem sobrenome.
- Todos os cards principais têm o mesmo tamanho (196 × 200 px); distância fixa de 32 px até as caixas de atuação transversal e consultores.

### Em aberto (ajustes futuros)
- CSC: slide 1 indica Evandro Salles; slide 10 indica XX — mantido como está.
- Instituto Humanize: no slide 1 sob "Estrutura em evolução"; no slide 11 direto abaixo do CEO — mantido como está.
- Cargos de Carolina Rangel, Thais Sereno e do card XX do Jurídico.
- Flávia Aranha: acento no slide 1, sem acento no slide 7 (pessoa com acento, marca sem).
- Umuana, Amazon e ADP tratados como empresas/parceiros.
- O PPT não traz fotos, e-mails, telefones nem descrições — campos vazios em `data.js`.
