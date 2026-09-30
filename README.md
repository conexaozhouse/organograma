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

### Pontos ambíguos (não inventei — confirme)
1. **Anna Letícia Azevedo (PMO de Transição Organizacional)** — slide 1 sem conector; exibida como assessoria lateral do CEO, como no posicionamento do PPT.
2. **Bruno Bruschinelli (Processos)** — conector parte dele e não termina em nenhum card; exibido como assessoria lateral do CEO.
3. **CSC**: slide 1 indica **Evandro Salles**; slide 10 (Fase 2) indica **XX**. Mantive cada slide como está.
4. **Instituto Humanize**: no slide 1 está sob "Estrutura em evolução"; no slide 11 aparece diretamente abaixo do CEO.
5. **Legenda "Gestão Matricial"** (slide 2) — não há nenhum card identificável com essa marcação; não foi aplicada.
6. **Maria Luiza** aparece em Amma e em Juçai (Logística e Operações) — tratei como a mesma pessoa. Confirme.
7. **"Jorge"** (Compras, slide 10) — sem sobrenome; mantido separado de "Jorge Ferreira" (slide 2).
8. **Carolina Rangel, Thais Sereno** e o card **XX** do Jurídico não têm cargo no PPT.
9. **Flávia Aranha**: acento no slide 1, sem acento no slide 7. Pessoa com acento; marca "Flavia Aranha" sem acento.
10. **Umuana, Amazon, ADP** foram tratados como empresas/parceiros (não pessoas).
11. O PPT não traz **fotos, e-mails, telefones nem descrições** — todos os campos estão vazios em `data.js`.
