/* Organograma zhouse — renderização e interação (sem dependências). Dados em js/data.js */
(function () {
  'use strict';

  var D = window.ORG_DATA;
  var root = document.getElementById('org-app');
  if (!D || !root) return;

  var state = { chart: null, zoom: 1, lastFocus: null, touched: false };
  var MIN_Z = 0.15, MAX_Z = 1.5;

  /* ---------- utilitários ---------- */
  function el(tag, cls, attrs, kids) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(name) { return el('span', 'org-icon', { 'aria-hidden': 'true', text: name }); }
  function initials(name) {
    return (name || '').replace(/\(.*?\)/g, '').split(/[\s–-]+/).filter(function (w) { return w && /[A-Za-zÀ-ú]/.test(w[0]) && w.length > 1; })
      .slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }
  function norm(s) { return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function chartById(id) { for (var i = 0; i < D.charts.length; i++) if (D.charts[i].id === id) return D.charts[i]; return null; }
  function person(node) { return node && node.person ? D.people[node.person] || { name: node.person } : null; }

  function nodeInfo(node) {
    var p = person(node);
    if (p) return { kind: 'person', name: p.name, role: node.role || '', p: p };
    if (node.vacant) return { kind: 'vacant', name: 'A definir', role: node.role || '' };
    if (node.entity) return { kind: 'entity', name: node.entity, role: node.role || '' };
    return { kind: 'area', name: node.area || '', role: node.role || '' };
  }

  function photo(info, size) {
    var cls = 'org-photo' + (size ? ' org-photo--' + size : '');
    if (info.kind === 'vacant') return el('div', cls + ' is-vacant', { 'aria-hidden': 'true' }, [icon('person_outline')]);
    if (info.kind === 'entity') return el('div', cls + ' is-entity', { 'aria-hidden': 'true' }, [icon('business')]);
    if (info.kind === 'area') return el('div', cls + ' is-area', { 'aria-hidden': 'true' }, [icon('groups')]);
    var box = el('div', cls, { 'aria-hidden': 'true' }, [initials(info.name)]);
    if (info.p && info.p.photo) {
      var img = el('img', null, { src: info.p.photo, alt: '', loading: 'lazy', decoding: 'async' });
      img.addEventListener('error', function () { img.remove(); });
      box.appendChild(img);
    }
    return box;
  }

  /* ---------- cards ---------- */
  function card(node, compact) {
    var info = nodeInfo(node);
    var clickable = info.kind === 'person';
    var cls = compact ? 'org-mini' : 'org-card';
    if (node.ceo) cls += ' org-card--ceo';
    if (!compact && info.kind === 'area') cls += ' org-card--area';
    if (info.kind === 'vacant') cls += compact ? ' org-mini--vacant' : ' org-card--vacant';

    var text = el('div', 'org-text', null, [
      el('span', 'org-name', { text: info.name, title: info.name }),
      info.role ? el('span', 'org-role', { text: info.role, title: info.role }) : null,
      node.tag ? el('span', 'org-tag', { text: node.tag }) : null
    ]);
    var kids = [photo(info, compact ? 'sm' : null), text];
    var c;
    if (clickable) {
      c = el('button', cls, {
        type: 'button',
        'aria-haspopup': 'dialog',
        'aria-label': info.name + (info.role ? ', ' + info.role : '') + (node.tag ? ' (' + node.tag + ')' : '') + '. Ver detalhes',
        'data-person': node.person,
        onclick: function () { openModal(node); }
      }, kids);
    } else {
      c = el('div', cls, { role: 'group', 'aria-label': info.name + (info.role ? ', ' + info.role : '') }, kids);
    }
    return c;
  }

  /* ---------- nós e ramos ---------- */
  function stackList(items) {
    var ul = el('ul', 'org-stack');
    items.forEach(function (it) {
      var li = el('li');
      if (typeof it === 'string') li.appendChild(el('span', 'org-unit', { text: it }));
      else li.appendChild(nodeBlock(it, true));
      ul.appendChild(li);
    });
    return ul;
  }

  function nodeBlock(node, compact) {
    var wrap = el('div', 'org-node');
    wrap.appendChild(card(node, compact));
    var stacked = (node.stack || []).concat(node.units || []);
    if (stacked.length) wrap.appendChild(stackList(stacked));
    return wrap;
  }

  function countDesc(node) {
    var n = 0;
    ['children', 'stack', 'transversal', 'consultants'].forEach(function (k) { (node[k] || []).forEach(function (c) { n += 1 + countDesc(c); }); });
    return n + (node.units ? node.units.length : 0);
  }

  function groupBox(kind, nodes) {
    var title = kind === 'transversal' ? 'Atuação transversal' : 'Consultores especializados';
    var box = el('div', 'org-group org-group--' + kind, { role: 'group', 'aria-label': title }, [
      el('div', 'org-group-title', null, [icon(kind === 'transversal' ? 'sync_alt' : 'support_agent'), title])
    ]);
    nodes.forEach(function (n) { box.appendChild(nodeBlock(n, true)); });
    return box;
  }

  var linkSeq = 0, aligners = [];
  function alignRows() {
    var z = state.zoom || 1;
    aligners.forEach(function (a) {
      a.row.style.left = '0'; a.row.style.removeProperty('--drop-dx');
      var child = a.child.querySelector('.org-card, .org-mini');
      if (!child || !a.parent.offsetParent || !child.offsetParent) return;
      var pr = a.parent.getBoundingClientRect(), cr = child.getBoundingClientRect();
      var dx = ((cr.left + cr.width / 2) - (pr.left + pr.width / 2)) / z;
      a.row.style.position = 'relative';
      a.row.style.left = (-Math.round(dx)) + 'px';
      a.row.style.setProperty('--drop-dx', Math.round(dx) + 'px');
    });
  }
  function sideHolder(side, items) {
    var h = el('div', 'org-side is-' + side);
    items.forEach(function (it) {
      var row = el('div', 'org-side-item');
      var link = el('span', 'org-side-link' + (it.dashed ? ' is-dashed' : ''));
      if (side === 'left') { row.appendChild(it.content); row.appendChild(link); }
      else { row.appendChild(link); row.appendChild(it.content); }
      h.appendChild(row);
    });
    return h;
  }
  function matrixBox(units) {
    return el('div', 'org-matrix', { role: 'group', 'aria-label': 'Gestão matricial' },
      units.map(function (u) { return el('span', 'org-unit is-matrix', { text: u }); }));
  }

  function branch(node, isRoot) {
    var li = el('li', 'org-branch');
    var block = nodeBlock(node, false);
    var cardEl = block.firstChild;

    // laterais no mesmo nível do card (gestão matricial à esquerda, "aside" à direita)
    var left = [], right = [];
    if (node.matrix && node.matrix.length) left.push({ content: matrixBox(node.matrix), dashed: true });
    (node.aside || []).forEach(function (x) { right.push({ content: card(x, false), dashed: !!x.dashed }); });
    if (left.length || right.length) {
      li.appendChild(el('div', 'org-head', null, [sideHolder('left', left), block, sideHolder('right', right)]));
    } else {
      li.appendChild(block);
    }

    // assessorias (staff) abaixo do card, presas ao tronco
    if (node.staff && node.staff.length) {
      var sl = [], sr = [];
      node.staff.forEach(function (x) { (x.side === 'left' ? sl : sr).push({ content: card(x, false), dashed: !!x.dashed }); });
      li.appendChild(el('div', 'org-staffrow', null, [sideHolder('left', sl), el('span', 'org-trunk'), sideHolder('right', sr)]));
    }

    var main = [], aside = [];
    (node.children || []).forEach(function (c) { main.push(branch(c, false)); });
    if (node.transversal && node.transversal.length) {
      var id = 'l' + (++linkSeq);
      cardEl.setAttribute('data-link-id', id);
      var t = el('li', 'org-branch is-detached', { 'data-link-to': id });
      t.appendChild(groupBox('transversal', node.transversal));
      aside.push(t);
    }
    if (node.consultants && node.consultants.length) {
      var k = el('li', 'org-branch is-detached');
      k.appendChild(groupBox('consultants', node.consultants));
      aside.push(k);
    }
    var hasRow = main.length || aside.length;
    if (hasRow) {
      var ulMain = el('ul', 'org-row-main');
      main.forEach(function (m) { ulMain.appendChild(m); });
      if (main.length === 1) main[0].classList.add('is-only');
      else if (main.length) { main[0].classList.add('is-first'); main[main.length - 1].classList.add('is-last'); }
      var ulSide = el('ul', 'org-row-side');
      aside.forEach(function (x) { ulSide.appendChild(x); });
      var row = el('div', 'org-row' + (main.length ? '' : ' no-line'), null, [el('div', 'org-row-spacer'), ulMain, ulSide]);
      li.appendChild(row);
      if (typeof node.alignChild === 'number' && main[node.alignChild]) aligners.push({ row: row, parent: cardEl, child: main[node.alignChild] });
    }
    var items = hasRow ? [1] : [];

    // recolher/expandir quando há descendentes
    var total = countDesc(node);
    if (!isRoot && total > 0 && (items.length || (node.stack || node.units || []).length > 2)) {
      block.classList.add('has-toggle');
      var btn = el('button', 'org-toggle', { type: 'button', 'aria-expanded': 'true', 'aria-label': 'Recolher equipe de ' + nodeInfo(node).name });
      var setBtn = function (open) {
        btn.textContent = '';
        btn.appendChild(document.createTextNode(String(total)));
        btn.appendChild(icon(open ? 'expand_less' : 'expand_more'));
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', (open ? 'Recolher' : 'Expandir') + ' equipe de ' + nodeInfo(node).name + ' (' + total + ')');
      };
      setBtn(true);
      btn.addEventListener('click', function () {
        var open = li.classList.toggle('is-collapsed') === false;
        setBtn(open);
        sizeStage();
      });
      block.firstChild.after(btn);
    }
    return li;
  }

  /* ---------- layout base ---------- */
  var top = el('div', 'org-top');
  var titlebar = el('div', 'org-titlebar', null, [
    el('div', 'org-title', null, [
      el('div', 'org-title-badge', { 'aria-hidden': 'true' }, [icon('account_tree')]),
      el('div', null, null, [el('h1', null, { text: D.title || 'Organograma' }), D.period ? el('p', null, { text: D.period }) : null])
    ])
  ]);

  // busca
  var search = el('div', 'org-search');
  var input = el('input', null, { type: 'search', placeholder: 'Buscar pessoa, cargo ou área', 'aria-label': 'Buscar pessoa, cargo ou área', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'org-results', autocomplete: 'off' });
  var results = el('ul', 'org-results', { id: 'org-results', role: 'listbox', hidden: 'hidden' });
  var clearBtn = el('button', 'org-search-clear', { type: 'button', 'aria-label': 'Limpar busca', title: 'Limpar', hidden: 'hidden', onclick: function () { input.value = ''; clearBtn.hidden = true; renderResults(''); input.focus(); } }, [icon('close')]);
  var kbd = el('kbd', 'org-kbd', { text: '/', title: 'Atalho: /' });
  search.appendChild(el('div', 'org-search-field', null, [icon('search'), input, kbd, clearBtn]));
  search.appendChild(results);

  // seletor de área
  var picker = el('div', 'org-picker');
  var pickVal = el('span', 'org-picker-val');
  var pickBtn = el('button', 'org-picker-btn', { type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': 'org-menu' }, [el('span', 'org-picker-lbl', { text: 'Área' }), pickVal, icon('expand_more')]);
  var menu = el('ul', 'org-menu', { id: 'org-menu', role: 'listbox', 'aria-label': 'Escolher área', hidden: 'hidden' });
  D.charts.forEach(function (c, i) {
    var overview = c.id === 'visao-geral';
    var info = nodeInfo(c.root);
    var pic = overview ? el('span', 'org-menu-ic', { 'aria-hidden': 'true' }, [icon('account_tree')]) : photo(info, 'sm');
    menu.appendChild(el('li', i === 0 && overview ? 'org-menu-first' : null, { role: 'presentation' }, [
      el('button', 'org-menu-item', { type: 'button', role: 'option', 'aria-selected': 'false', 'data-chart': c.id, tabindex: '-1', onclick: function () { closeMenu(); showChart(c.id); } }, [
        pic,
        el('span', 'org-result-text', null, [el('strong', null, { text: c.label }), el('span', null, { text: overview ? 'Estrutura completa' : (info.name || '') })]),
        el('span', 'org-menu-check', { 'aria-hidden': 'true' }, [icon('check')])
      ])
    ]));
  });
  function menuItems() { return [].slice.call(menu.querySelectorAll('.org-menu-item')); }
  function openMenu() {
    menu.hidden = false; pickBtn.setAttribute('aria-expanded', 'true');
    var sel = menu.querySelector('[aria-selected="true"]') || menuItems()[0];
    if (sel) { sel.focus(); var li = sel.parentNode; if (li.offsetTop + li.offsetHeight > menu.clientHeight) menu.scrollTop = li.offsetTop - 6; }
  }
  function closeMenu(refocus) { if (menu.hidden) return; menu.hidden = true; pickBtn.setAttribute('aria-expanded', 'false'); if (refocus) pickBtn.focus(); }
  pickBtn.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
  pickBtn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(); } });
  menu.addEventListener('keydown', function (e) {
    var list = menuItems(), i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
    else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); closeMenu(e.key === 'Escape'); }
  });
  document.addEventListener('click', function (e) { if (!picker.contains(e.target)) closeMenu(); });
  picker.appendChild(pickBtn);
  picker.appendChild(menu);

  var homeBtn = el('button', 'org-icon-btn', { type: 'button', 'aria-label': 'Voltar para a visão geral', title: 'Voltar para a visão geral', onclick: function () { showChart(D.charts[0].id); } }, [icon('home')]);

  // ajuda
  var help = el('div', 'org-help');
  var helpBtn = el('button', 'org-icon-btn', { type: 'button', 'aria-label': 'Como usar o organograma', title: 'Como usar', 'aria-expanded': 'false', 'aria-controls': 'org-help-panel' }, [icon('help_outline')]);
  var helpTips = [
    ['account_tree', 'Navegue pelas áreas', 'Escolha uma área no seletor. A casinha leva de volta à visão geral.'],
    ['search', 'Encontre alguém', 'Busque por nome, cargo ou área. Atalho: tecla /'],
    ['touch_app', 'Veja os contatos', 'Clique em um cartão para abrir apresentação, e-mail e telefone.'],
    ['open_with', 'Mova e aproxime', 'Arraste para mover. Use Ctrl + rolagem ou os botões − e + para zoom.'],
    ['fit_screen', 'Veja tudo', 'Use “Ver organograma inteiro” para reenquadrar a área.']
  ];
  var tipIdx = 0;
  var toMobile = function () { try { sessionStorage.removeItem('org-view'); } catch (e) {} };
  var fromMobile = window.ORG_IS_PHONE; try { fromMobile = fromMobile || sessionStorage.getItem('org-view') === 'full'; } catch (e) {}
  var mobileLink = fromMobile ? el('a', 'org-help-link', { href: 'mobile.html', onclick: toMobile }, [icon('smartphone'), 'Voltar para a versão celular']) : null;

  var tipIc = el('span', 'org-tip-ic', { 'aria-hidden': 'true' });
  var tipTitle = el('strong', 'org-tip-title'), tipText = el('p', 'org-tip-text');
  var tipCount = el('span', 'org-tip-count');
  var dots = el('div', 'org-tip-dots', { role: 'tablist', 'aria-label': 'Dicas' }, helpTips.map(function (t, i) {
    return el('button', 'org-tip-dot', { type: 'button', role: 'tab', 'aria-label': 'Dica ' + (i + 1), onclick: function () { showTip(i); } });
  }));
  var prevBtn = el('button', 'org-tip-nav', { type: 'button', 'aria-label': 'Dica anterior', onclick: function () { showTip(tipIdx - 1); } }, [icon('chevron_left')]);
  var nextBtn = el('button', 'org-tip-nav', { type: 'button', 'aria-label': 'Próxima dica', onclick: function () { showTip(tipIdx + 1); } }, [icon('chevron_right')]);
  function showTip(i) {
    tipIdx = (i + helpTips.length) % helpTips.length;
    var t = helpTips[tipIdx];
    tipIc.textContent = ''; tipIc.appendChild(icon(t[0]));
    tipTitle.textContent = t[1]; tipText.textContent = t[2];
    tipCount.textContent = (tipIdx + 1) + ' de ' + helpTips.length;
    [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-selected', k === tipIdx ? 'true' : 'false'); });
  }
  showTip(0);
  var helpPanel = el('div', 'org-help-panel', { id: 'org-help-panel', role: 'dialog', 'aria-label': 'Como usar o organograma', hidden: 'hidden' }, [
    el('div', 'org-help-head', null, [
      el('span', 'org-help-badge', { 'aria-hidden': 'true' }, [icon('info_outline')]),
      el('div', null, null, [
        el('strong', 'org-help-title', { text: 'Sobre o organograma' }),
        D.updated ? el('span', 'org-help-updated', { text: 'Atualizado em ' + D.updated }) : null
      ])
    ]),
    D.about ? el('p', 'org-help-about', { text: D.about }) : null,
    el('div', 'org-tip', null, [
      el('div', 'org-tip-top', null, [el('span', 'org-tip-label', { text: 'Como usar' }), tipCount]),
      el('div', 'org-tip-body', { 'aria-live': 'polite' }, [tipIc, el('div', null, null, [tipTitle, tipText])]),
      el('div', 'org-tip-foot', null, [prevBtn, dots, nextBtn])
    ]),
    mobileLink
  ]);
  function closeHelp(refocus) { if (helpPanel.hidden) return; helpPanel.hidden = true; helpBtn.setAttribute('aria-expanded', 'false'); if (refocus) helpBtn.focus(); }
  helpBtn.addEventListener('click', function () { var o = helpPanel.hidden; helpPanel.hidden = !o; helpBtn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  helpPanel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeHelp(true); }
    else if (e.key === 'ArrowRight') showTip(tipIdx + 1);
    else if (e.key === 'ArrowLeft') showTip(tipIdx - 1);
  });
  document.addEventListener('click', function (e) { if (!help.contains(e.target)) closeHelp(); });
  help.appendChild(helpBtn); help.appendChild(helpPanel);

  titlebar.appendChild(el('div', 'org-controls', null, [homeBtn, picker, search, help]));
  top.appendChild(titlebar);


  var viewport = el('div', 'org-viewport', { id: 'org-viewport', role: 'region', tabindex: '-1' });
  var stage = el('div', 'org-stage');
  var canvas = el('div', 'org-canvas');
  stage.appendChild(canvas);
  viewport.appendChild(stage);

  var zoomLabel = el('span', 'org-zoom-label', { 'aria-live': 'polite' });
  var tools = el('div', 'org-tools', { role: 'toolbar', 'aria-label': 'Zoom' }, [
    el('button', 'org-tool', { type: 'button', 'aria-label': 'Diminuir zoom', title: 'Diminuir zoom', onclick: function () { setZoom(state.zoom - 0.1); } }, [icon('remove')]),
    zoomLabel,
    el('button', 'org-tool', { type: 'button', 'aria-label': 'Aumentar zoom', title: 'Aumentar zoom', onclick: function () { setZoom(state.zoom + 0.1); } }, [icon('add')]),
    el('span', 'org-tool-sep'),
    el('button', 'org-tool', { type: 'button', 'aria-label': 'Ver organograma inteiro', title: 'Ver organograma inteiro', onclick: function () { fit(true, true); } }, [icon('fit_screen')])
  ]);
  var legend = el('div', 'org-legend', { 'aria-hidden': 'true' });

  var shell = el('div', 'org-shell', { style: 'position:relative;flex:1;min-height:0;display:flex;flex-direction:column' }, [viewport, tools, legend]);
  root.appendChild(top);
  root.appendChild(shell);


  /* ---------- zoom / pan ---------- */
  function natural() { return { w: canvas.offsetWidth, h: canvas.offsetHeight }; }
  function drawLinks() {
    var svg = canvas.querySelector('.org-links');
    if (!svg) return;
    var n = natural(), z = state.zoom, c = canvas.getBoundingClientRect();
    svg.setAttribute('width', n.w); svg.setAttribute('height', n.h);
    svg.textContent = '';
    [].forEach.call(canvas.querySelectorAll('[data-link-to]'), function (to) {
      var from = canvas.querySelector('[data-link-id="' + to.getAttribute('data-link-to') + '"]');
      var box = to.firstChild;
      if (!from || !box || !box.offsetParent || !from.offsetParent) return;
      var fr = from.getBoundingClientRect(), br = box.getBoundingClientRect();
      var x1 = (fr.right - c.left) / z, y1 = (fr.top + fr.height / 2 - c.top) / z;
      var x2 = (br.left + br.width / 2 - c.left) / z, y2 = (br.top - c.top) / z;
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' H' + (x2 - 8) + ' Q' + x2 + ' ' + y1 + ' ' + x2 + ' ' + (y1 + 8) + ' V' + y2);
      svg.appendChild(p);
    });
  }
  function sizeStage() {
    var n = natural(), z = state.zoom;
    stage.style.width = Math.ceil(n.w * z) + 'px';
    stage.style.height = Math.ceil(n.h * z) + 'px';
    var free = viewport.clientWidth - n.w * z;
    stage.style.marginLeft = free > 0 ? Math.floor(free / 2) + 'px' : '0';
    canvas.style.transform = 'scale(' + z + ')';
    zoomLabel.textContent = Math.round(z * 100) + '%';
    alignRows();
    drawLinks();
  }
  function setZoom(z, anchor, auto) {
    if (!auto) state.touched = true;
    z = Math.max(MIN_Z, Math.min(MAX_Z, Math.round(z * 100) / 100));
    var old = state.zoom;
    var ax = anchor ? anchor.x : viewport.clientWidth / 2, ay = anchor ? anchor.y : viewport.clientHeight / 2;
    var cx = (viewport.scrollLeft + ax) / old, cy = (viewport.scrollTop + ay) / old;
    state.zoom = z;
    sizeStage();
    viewport.scrollLeft = cx * z - ax;
    viewport.scrollTop = cy * z - ay;
  }
  function fit(all, user) {
    if (!viewport.clientWidth) return;
    state.touched = !!user;
    var n = natural();
    var zw = (viewport.clientWidth - 8) / n.w, zh = (viewport.clientHeight - 8) / n.h;
    var z = all ? Math.min(zw, zh, 1) : Math.min(zw, 1);
    if (!all) z = Math.max(z, window.innerWidth < 600 ? 0.7 : 0.55);
    state.zoom = Math.max(MIN_Z, Math.min(MAX_Z, Math.round(z * 100) / 100));
    sizeStage();
    viewport.scrollTop = 0;
    viewport.scrollLeft = Math.max(0, (stage.offsetWidth - viewport.clientWidth) / 2);
  }
  viewport.addEventListener('wheel', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    var r = viewport.getBoundingClientRect();
    setZoom(state.zoom * (e.deltaY < 0 ? 1.1 : 0.9), { x: e.clientX - r.left, y: e.clientY - r.top });
  }, { passive: false });

  var pan = null;
  viewport.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, a, input')) return;
    pan = { x: e.clientX, y: e.clientY, l: viewport.scrollLeft, t: viewport.scrollTop, moved: false };
  });
  window.addEventListener('pointermove', function (e) {
    if (!pan) return;
    var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
    if (!pan.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    pan.moved = true; state.touched = true; viewport.classList.add('is-panning');
    viewport.scrollLeft = pan.l - dx; viewport.scrollTop = pan.t - dy;
  });
  window.addEventListener('pointerup', function () { pan = null; viewport.classList.remove('is-panning'); });
  function refit() { if (!viewport.clientWidth) return; if (state.touched) sizeStage(); else fit(true); }
  window.addEventListener('resize', refit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(viewport);

  /* ---------- troca de organograma ---------- */
  function hasKind(node, key) {
    if (!node) return false;
    if (key === 'units' && node.units && node.units.length) return true;
    if (key === 'interim' && node.tag) return true;
    if (node[key] && node[key].length) return true;
    return ['aside', 'children', 'stack', 'transversal', 'consultants'].some(function (k) { return (node[k] || []).some(function (c) { return hasKind(c, key); }); });
  }

  function showChart(id, opts) {
    var c = chartById(id) || D.charts[0];
    state.chart = c.id;
    menuItems().forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-chart') === c.id ? 'true' : 'false'); });
    pickVal.textContent = c.label;
    if (mobileLink) mobileLink.href = 'mobile.html#' + c.id;
    homeBtn.disabled = c.id === D.charts[0].id;
    viewport.setAttribute('aria-label', 'Organograma: ' + c.label);

    canvas.textContent = '';
    aligners = [];
    var tree = el('ul', 'org-tree');
    var rootNode = c.root;
    if (D.ceo && !rootNode.ceo) {
      // nos organogramas de área, o CEO aparece no topo (como no PPT)
      rootNode = Object.assign({}, D.ceo, { children: [c.root] });
    }
    tree.appendChild(branch(rootNode, true));
    canvas.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg')).setAttribute('class', 'org-links');
    canvas.appendChild(tree);

    legend.textContent = '';
    [['units', 'is-units', 'Subáreas'], ['matrix', 'is-matrix', 'Gestão matricial'], ['transversal', 'is-transversal', 'Atuação transversal'], ['consultants', 'is-consultants', 'Consultores especializados'], ['interim', 'is-interim', 'Interino']].forEach(function (l) {
      if (hasKind(c.root, l[0])) legend.appendChild(el('span', null, null, [el('i', l[1]), l[2]]));
    });
    legend.style.display = legend.children.length ? '' : 'none';

    if (!opts || !opts.keepHash) {
      try { history.replaceState(null, '', '#' + c.id); } catch (e) { /* iframe sandbox */ }
    }
    fit(true);
    if (opts && opts.then) opts.then();
  }

  /* ---------- janela de detalhes ---------- */
  var occurrences = {}; // personId -> [{chart, role, tag}]
  D.charts.forEach(function (c) {
    (function walk(n) {
      if (n.person) {
        var list = occurrences[n.person] = occurrences[n.person] || [];
        if (!list.some(function (o) { return o.chart === c.id && o.role === (n.role || ''); })) list.push({ chart: c.id, role: n.role || '', tag: n.tag || '' });
      }
      ['staff', 'aside', 'children', 'stack', 'transversal', 'consultants'].forEach(function (k) { (n[k] || []).forEach(walk); });
    })(c.root);
  });

  var modal = el('div', 'org-modal', { hidden: 'hidden' });
  var backdrop = el('div', 'org-modal-backdrop', { onclick: closeModal });
  var dialog = el('div', 'org-dialog', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'org-dialog-name', tabindex: '-1' });
  modal.appendChild(backdrop);
  modal.appendChild(dialog);
  root.appendChild(modal);

  function openModal(node) {
    var p = person(node); if (!p) return;
    state.lastFocus = document.activeElement;
    var info = nodeInfo(node);
    var chart = chartById(state.chart);
    dialog.textContent = '';

    var close = el('button', 'org-close', { type: 'button', 'aria-label': 'Fechar', onclick: closeModal }, [icon('close')]);
    var head = el('div', 'org-dialog-head', null, [
      photo(info, 'lg'),
      el('h2', null, { id: 'org-dialog-name', text: p.name }),
      el('div', 'org-dialog-roles', null, [
        info.role ? el('span', null, { text: info.role }) : null,
        chart && chart.id !== 'visao-geral' ? el('span', 'org-chart-name', { text: chart.label }) : null
      ]),
      node.tag ? el('span', 'org-tag', { text: node.tag }) : null,
      node.chart && node.chart !== state.chart ? el('button', 'org-btn org-btn--sm', { type: 'button', onclick: function () { closeModal(); showChart(node.chart); } }, ['Ver estrutura da área', icon('arrow_forward')]) : null
    ]);
    var body = el('div', 'org-dialog-body');
    if (node.note) body.appendChild(el('p', 'org-note', { text: node.note }));
    if (p.description) body.appendChild(el('p', 'org-desc', { text: p.description }));

    var contacts = el('div', 'org-contacts');
    if (p.email) contacts.appendChild(el('a', 'org-contact', { href: 'mailto:' + p.email }, [el('span', 'org-contact-ic', null, [icon('mail')]), el('span', 'org-contact-txt', null, [el('span', 'org-contact-lbl', { text: 'E-mail' }), el('span', 'org-contact-val', { text: p.email })])]));
    if (p.phone) contacts.appendChild(el('a', 'org-contact', { href: 'tel:' + p.phone.replace(/[^\d+]/g, '') }, [el('span', 'org-contact-ic', null, [icon('call')]), el('span', 'org-contact-txt', null, [el('span', 'org-contact-lbl', { text: 'Telefone' }), el('span', 'org-contact-val', { text: p.phone })])]));
    if (contacts.children.length) body.appendChild(contacts);
    if (!p.description && !p.email && !p.phone) body.appendChild(el('p', 'org-empty', { text: 'Apresentação e contatos ainda não cadastrados.' }));

    // "Também aparece em": só outras páginas — nem a atual, nem a(s) que a pessoa lidera, nem a visão geral
    var own = D.charts.filter(function (c) { return c.root.person === node.person; }).map(function (c) { return c.id; });
    if (node.chart) own.push(node.chart);
    var others = (occurrences[node.person] || []).filter(function (o) { return o.chart !== state.chart && o.chart !== 'visao-geral' && own.indexOf(o.chart) < 0; });
    if (others.length) {
      var also = el('div', 'org-also', null, [el('span', 'org-also-title', { text: 'Também aparece em' })]);
      others.forEach(function (o) {
        var c = chartById(o.chart);
        also.appendChild(el('button', null, { type: 'button', onclick: function () { closeModal(); goToPerson(node.person, o.chart, o.role); } }, [c.label + (o.role ? ' · ' + o.role : '') + (o.tag ? ' (' + o.tag + ')' : '')]));
      });
      body.appendChild(also);
    }

    dialog.appendChild(close);
    dialog.appendChild(head);
    dialog.appendChild(body);
    modal.hidden = false;
    close.focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    if (state.lastFocus && document.body.contains(state.lastFocus)) state.lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    if (e.key === 'Tab') {
      var f = dialog.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- busca ---------- */
  var index = [];
  D.charts.forEach(function (c) {
    (function walk(n) {
      var info = nodeInfo(n);
      if (info.kind === 'person' || info.kind === 'entity' || (info.kind === 'area' && info.name)) {
        index.push({ chart: c.id, node: n, info: info, key: norm(info.name + ' ' + info.role + ' ' + (n.units || []).join(' ')) });
      }
      ['staff', 'aside', 'children', 'stack', 'transversal', 'consultants'].forEach(function (k) { (n[k] || []).forEach(walk); });
    })(c.root);
  });

  var active = -1, current = [];
  function renderResults(q) {
    results.textContent = ''; active = -1;
    if (!q) { results.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    var terms = norm(q).split(/\s+/).filter(Boolean);
    current = index.filter(function (r) { return terms.every(function (t) { return r.key.indexOf(t) >= 0; }); }).slice(0, 30);
    if (!current.length) results.appendChild(el('li', 'org-result-empty', { text: 'Nenhum resultado para “' + q + '”.' }));
    current.forEach(function (r, i) {
      var c = chartById(r.chart);
      results.appendChild(el('li', null, { role: 'presentation' }, [
        el('button', 'org-result', { type: 'button', role: 'option', id: 'org-opt-' + i, 'aria-selected': 'false', tabindex: '-1', onclick: function () { pick(r); } }, [
          photo(r.info, 'sm'),
          el('span', 'org-result-text', null, [el('strong', null, { text: r.info.name }), r.info.role ? el('span', null, { text: r.info.role }) : null]),
          el('span', 'org-result-area', { text: c.label })
        ])
      ]));
    });
    results.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  function setActive(i) {
    var opts = results.querySelectorAll('.org-result');
    if (!opts.length) return;
    active = (i + opts.length) % opts.length;
    [].forEach.call(opts, function (o, k) { o.setAttribute('aria-selected', k === active ? 'true' : 'false'); });
    input.setAttribute('aria-activedescendant', opts[active].id);
    var o = opts[active], box = results;
    if (o.offsetTop < box.scrollTop) box.scrollTop = o.offsetTop; else if (o.offsetTop + o.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = o.offsetTop + o.offsetHeight - box.clientHeight;
  }
  function pick(r) {
    results.hidden = true; input.setAttribute('aria-expanded', 'false');
    input.value = r.info.name;
    input.blur();
    if (r.node.person) goToPerson(r.node.person, r.chart, r.node.role || '', true);
    else showChart(r.chart, { then: function () { var t = findCard(function (n) { return n.textContent.indexOf(r.info.name) >= 0; }); highlight(t, true); spotlight(t); } });
  }
  input.addEventListener('input', function () { clearBtn.hidden = !input.value; kbd.hidden = !!input.value; renderResults(input.value.trim()); });
  input.addEventListener('focus', function () { if (input.value.trim()) renderResults(input.value.trim()); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || !modal.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
    e.preventDefault(); closeMenu(); input.focus(); input.select();
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter' && current.length) { e.preventDefault(); pick(current[active >= 0 ? active : 0]); }
    else if (e.key === 'Escape') { results.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('click', function (e) { if (!search.contains(e.target)) { results.hidden = true; input.setAttribute('aria-expanded', 'false'); } });

  function findCard(test) {
    var cards = canvas.querySelectorAll('.org-card, .org-mini');
    for (var i = 0; i < cards.length; i++) if (test(cards[i])) return cards[i];
    return null;
  }
  function highlight(target, zoomIn) {
    if (!target) return;
    if (zoomIn && state.zoom < 0.8) { state.zoom = 0.8; state.touched = true; }
    // expande ramos recolhidos
    var b = target.parentNode;
    while (b && b !== canvas) { if (b.classList && b.classList.contains('is-collapsed')) b.classList.remove('is-collapsed'); b = b.parentNode; }
    sizeStage();
    var vr = viewport.getBoundingClientRect(), tr = target.getBoundingClientRect();
    viewport.scrollLeft += (tr.left + tr.width / 2) - (vr.left + vr.width / 2);
    viewport.scrollTop += (tr.top + tr.height / 2) - (vr.top + vr.height / 2);
    }
  var spotTimer, spotEl;
  function spotlight(target) {
    if (!target) return;
    clearTimeout(spotTimer);
    if (spotEl) spotEl.classList.remove('is-spot');
    var ov = canvas.querySelector('.org-dim') || canvas.appendChild(el('div', 'org-dim', { 'aria-hidden': 'true' }));
    spotEl = target; target.classList.add('is-spot');
    void ov.offsetWidth; ov.classList.add('is-on');
    var end = function () { ov.classList.remove('is-on'); var t = target; setTimeout(function () { if (spotEl === t) { t.classList.remove('is-spot'); spotEl = null; } }, 700); };
    spotTimer = setTimeout(end, 2200);
  }
  function goToPerson(pid, chartId, role, spot) {
    var go = function () {
      var name = (D.people[pid] || {}).name;
      var target = findCard(function (n) {
        if (n.getAttribute('data-person') !== pid) return false;
        var r = n.querySelector('.org-role');
        return !role || (r && r.textContent === role);
      }) || findCard(function (n) { return n.getAttribute('data-person') === pid; });
      highlight(target, spot);
      spotlight(target);
    };
    if (state.chart === chartId) go(); else showChart(chartId, { then: go });
  }

  /* ---------- início ---------- */
  var initial = (location.hash || '').replace('#', '');
  showChart(chartById(initial) ? initial : D.charts[0].id, { keepHash: !chartById(initial) });
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (chartById(h) && h !== state.chart) showChart(h, { keepHash: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
})();
