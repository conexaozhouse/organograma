/* Organograma zhouse — versão mobile (navegação por níveis). Usa os mesmos dados de js/data.js */
(function () {
  'use strict';
  var D = window.ORG_DATA;
  var app = document.getElementById('om-app');
  if (!D || !app) return;

  var state = { chart: null, path: [] };
  var rowMap = new Map();

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
  function icon(name) { return el('span', 'om-icon', { 'aria-hidden': 'true', text: name }); }
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
    var cls = 'om-photo' + (size ? ' om-photo--' + size : '');
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
  var KIDS = ['staff', 'aside', 'children', 'stack', 'transversal', 'consultants'];
  function objs(list) { return (list || []).filter(function (x) { return x && typeof x === 'object'; }); }
  function strs(list) { return (list || []).filter(function (x) { return typeof x === 'string'; }); }
  function countDesc(node) {
    var n = 0;
    ['children', 'stack', 'transversal', 'consultants', 'staff', 'aside'].forEach(function (k) { objs(node[k]).forEach(function (c) { n += 1 + countDesc(c); }); });
    return n + (node.units || []).length + strs(node.stack).length + (node.matrix || []).length;
  }
  function teamCount(node) {
    var n = 0;
    ['children', 'stack', 'transversal', 'consultants', 'staff', 'aside'].forEach(function (k) { objs(node[k]).forEach(function (c) { n += 1 + teamCount(c); }); });
    return n;
  }
  function chartLabel(id) { var c = chartById(id); return c ? c.label : ''; }

  /* ---------- topo ---------- */
  var helpBtn = el('button', 'om-icon-btn', { type: 'button', 'aria-label': 'Como usar', onclick: openHelp }, [icon('help_outline')]);
  var homeBtn = el('button', 'om-icon-btn', { type: 'button', 'aria-label': 'Voltar para a visão geral', onclick: function () { showChart(D.charts[0].id); } }, [icon('home')]);
  var pickVal = el('span', 'om-picker-val');
  var picker = el('button', 'om-picker', { type: 'button', 'aria-haspopup': 'dialog', onclick: openPicker }, [el('span', 'om-picker-lbl', { text: 'Área' }), pickVal, icon('expand_more')]);
  var input = el('input', null, { type: 'search', placeholder: 'Buscar pessoa, cargo ou área', 'aria-label': 'Buscar pessoa, cargo ou área', autocomplete: 'off', enterkeyhint: 'search', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'om-results' });
  var clearBtn = el('button', 'om-clear', { type: 'button', 'aria-label': 'Limpar busca', hidden: 'hidden', onclick: function () { input.value = ''; clearBtn.hidden = true; renderResults(''); input.focus(); } }, [icon('close')]);
  var results = el('ul', 'om-results', { id: 'om-results', role: 'listbox', hidden: 'hidden' });
  var search = el('div', 'om-search', null, [el('div', 'om-search-field', null, [icon('search'), input, clearBtn]), results]);
  var header = el('header', 'om-header', null, [
    el('div', 'om-bar', null, [el('div', 'om-title', null, [el('h1', null, { text: D.title || 'Organograma' }), D.period ? el('p', null, { text: D.period }) : null]), helpBtn]),
    el('div', 'om-controls', null, [homeBtn, picker]),
    search
  ]);
  var main = el('main', 'om-main');
  app.appendChild(header);
  app.appendChild(main);
  window.addEventListener('scroll', function () { header.classList.toggle('is-stuck', window.scrollY > 4); }, { passive: true });

  /* ---------- folhas ---------- */
  var sheet = null, lastFocus = null;
  function openSheet(content, label) {
    closeSheet(true);
    lastFocus = document.activeElement;
    var panel = el('div', 'om-sheet', { role: 'dialog', 'aria-modal': 'true', 'aria-label': label });
    var scroll = el('div', 'om-sheet-scroll', null, content);
    var grip = el('div', 'om-sheet-grip', { 'aria-hidden': 'true' });
    var close = el('button', 'om-sheet-close', { type: 'button', 'aria-label': 'Fechar', onclick: function () { closeSheet(); } }, [icon('close')]);
    panel.appendChild(grip); panel.appendChild(close); panel.appendChild(scroll);
    var wrap = el('div', 'om-sheet-wrap', null, [el('div', 'om-sheet-backdrop', { onclick: function () { closeSheet(); } }), panel]);
    app.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    // arrastar para fechar
    var startY = null, dy = 0;
    function down(e) { if (e.target.closest('button') && e.currentTarget !== grip) return; if (e.currentTarget === scroll && scroll.scrollTop > 0) return; startY = e.touches[0].clientY; dy = 0; panel.style.transition = 'none'; }
    function move(e) { if (startY == null) return; dy = Math.max(0, e.touches[0].clientY - startY); if (dy > 0) { panel.style.transform = 'translateY(' + dy + 'px)'; if (e.cancelable) e.preventDefault(); } }
    function up() { if (startY == null) return; startY = null; panel.style.transition = ''; panel.style.transform = ''; if (dy > 90) closeSheet(); }
    [grip, scroll].forEach(function (t) { t.addEventListener('touchstart', down, { passive: true }); t.addEventListener('touchmove', move, { passive: false }); t.addEventListener('touchend', up); });
    sheet = wrap;
    close.focus({ preventScroll: true });
    return scroll;
  }
  function closeSheet(instant) {
    if (!sheet) return;
    var w = sheet; sheet = null;
    document.body.style.overflow = '';
    if (instant) w.remove();
    else { w.classList.add('is-closing'); setTimeout(function () { w.remove(); }, 260); }
    if (!instant && lastFocus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet) closeSheet(); });

  /* ---------- seletor de área ---------- */
  function openPicker() {
    var list = el('ul', 'om-sheet-list', { role: 'listbox', 'aria-label': 'Escolher área' });
    D.charts.forEach(function (c, i) {
      var overview = i === 0;
      var info = nodeInfo(c.root);
      list.appendChild(el('li', null, { role: 'presentation' }, [
        el('button', 'om-opt', { type: 'button', role: 'option', 'aria-selected': c.id === state.chart ? 'true' : 'false', onclick: function () { closeSheet(); showChart(c.id); } }, [
          overview ? el('span', 'om-opt-ic', { 'aria-hidden': 'true' }, [icon('account_tree')]) : photo(info, 'sm'),
          el('span', 'om-text', null, [el('span', 'om-name', { text: c.label }), el('span', 'om-role', { text: overview ? 'Estrutura completa' : info.name })]),
          el('span', 'om-icon om-check', { 'aria-hidden': 'true', text: 'check' })
        ])
      ]));
      if (overview) list.appendChild(el('li', 'om-sep', { role: 'presentation' }));
    });
    openSheet([el('h2', 'om-sheet-title', { text: 'Escolher área' }), list], 'Escolher área');
  }

  /* ---------- ajuda ---------- */
  function openHelp() {
    var tips = [
      ['account_tree', 'Escolha a área', 'Use o seletor “Área”. A casinha leva de volta à visão geral.'],
      ['chevron_right', 'Desça um nível', 'Toque em quem tem equipe para ver os liderados. Use a seta no topo para voltar.'],
      ['touch_app', 'Veja os contatos', 'Toque no cartão principal ou em uma pessoa para ver apresentação, e-mail e telefone.'],
      ['search', 'Encontre alguém', 'Busque por nome, cargo ou área. O resultado aparece destacado.']
    ];
    var track = el('ul', 'om-tips', null, tips.map(function (t) {
      return el('li', 'om-tip', null, [el('span', 'om-tip-ic', { 'aria-hidden': 'true' }, [icon(t[0])]), el('strong', null, { text: t[1] }), el('p', null, { text: t[2] })]);
    }));
    var dots = el('div', 'om-dots', { 'aria-hidden': 'true' }, tips.map(function (_, i) { return el('span', 'om-dot' + (i === 0 ? ' is-on' : '')); }));
    track.addEventListener('scroll', function () {
      var w = track.firstChild.offsetWidth + 10, i = Math.round(track.scrollLeft / w);
      [].forEach.call(dots.children, function (d, k) { d.classList.toggle('is-on', k === i); });
    }, { passive: true });
    openSheet([el('div', 'om-help', null, [
      el('div', 'om-help-head', null, [el('span', 'om-help-badge', { 'aria-hidden': 'true' }, [icon('info_outline')]), el('div', null, null, [el('strong', null, { text: 'Sobre o organograma' }), D.updated ? el('span', null, { text: 'Atualizado em ' + D.updated }) : null])]),
      D.about ? el('p', 'om-help-about', { text: D.about }) : null,
      el('span', 'om-tips-label', { text: 'Como usar' }),
      track, dots,
      el('a', 'om-help-link', { href: 'index.html#' + state.chart, onclick: function () { try { sessionStorage.setItem('org-view', 'full'); } catch (e) {} } }, [icon('account_tree'), 'Ver em formato de fluxo'])
    ])], 'Sobre o organograma');
  }

  /* ---------- pessoa ---------- */
  var occurrences = {};
  D.charts.forEach(function (c) {
    (function walk(n) {
      if (n.person) {
        var list = occurrences[n.person] = occurrences[n.person] || [];
        if (!list.some(function (o) { return o.chart === c.id && o.role === (n.role || ''); })) list.push({ chart: c.id, role: n.role || '', tag: n.tag || '' });
      }
      KIDS.forEach(function (k) { objs(n[k]).forEach(walk); });
    })(c.root);
  });
  function openPerson(node) {
    var p = person(node); if (!p) return;
    var info = nodeInfo(node);
    var head = el('div', 'om-p-head', null, [
      photo(info, 'lg'),
      el('h2', null, { text: p.name }),
      el('div', 'om-p-roles', null, [info.role ? el('span', null, { text: info.role }) : null, state.chart !== D.charts[0].id ? el('span', 'om-p-chart', { text: chartLabel(state.chart) }) : null]),
      node.tag ? el('span', 'om-tag', { text: node.tag }) : null,
      node.chart && node.chart !== state.chart ? el('button', 'om-btn om-btn--soft', { type: 'button', onclick: function () { closeSheet(); showChart(node.chart); } }, ['Ver estrutura da área']) : null
    ]);
    var body = el('div', 'om-p-body');
    if (node.note) body.appendChild(el('p', 'om-note', { text: node.note }));
    if (p.description) body.appendChild(el('p', 'om-desc', { text: p.description }));
    var contacts = el('div', 'om-contacts');
    function contact(href, ic, lbl, val) { return el('a', 'om-contact', { href: href }, [el('span', 'om-contact-ic', null, [icon(ic)]), el('span', null, null, [el('span', 'om-contact-lbl', { text: lbl }), el('span', 'om-contact-val', { text: val })])]); }
    if (p.email) contacts.appendChild(contact('mailto:' + p.email, 'mail', 'E-mail', p.email));
    if (p.phone) contacts.appendChild(contact('tel:' + p.phone.replace(/[^\d+]/g, ''), 'call', 'Telefone', p.phone));
    if (contacts.children.length) body.appendChild(contacts);
    if (!p.description && !p.email && !p.phone) body.appendChild(el('p', 'om-p-empty', { text: 'Apresentação e contatos ainda não cadastrados.' }));
    var own = D.charts.filter(function (c) { return c.root.person === node.person; }).map(function (c) { return c.id; });
    if (node.chart) own.push(node.chart);
    var others = (occurrences[node.person] || []).filter(function (o) { return o.chart !== state.chart && o.chart !== D.charts[0].id && own.indexOf(o.chart) < 0; });
    if (others.length) {
      var also = el('div', 'om-also', null, [el('span', 'om-also-title', { text: 'Também aparece em' })]);
      others.forEach(function (o) {
        also.appendChild(el('button', null, { type: 'button', onclick: function () { closeSheet(); goToPerson(node.person, o.chart, o.role); } }, [chartLabel(o.chart) + (o.role ? ' · ' + o.role : '') + (o.tag ? ' (' + o.tag + ')' : '')]));
      });
      body.appendChild(also);
    }
    openSheet([head, body], p.name);
  }

  /* ---------- render ---------- */
  function rowAction(n) {
    if (n.chart && n.chart !== state.chart) return 'chart';
    if (teamCount(n) > 0) return 'drill';
    return n.person ? 'person' : null;
  }
  function row(n) {
    var info = nodeInfo(n), act = rowAction(n);
    var meta = null;
    if (act === 'drill') meta = el('span', 'om-meta', null, [el('span', 'om-count', { text: String(teamCount(n)), title: 'Pessoas na equipe' }), icon('chevron_right')]);
    else if (act === 'chart') meta = el('span', 'om-meta', null, [icon('chevron_right')]);
    var kids = [photo(info), el('span', 'om-text', null, [
      el('span', 'om-name-line', null, [el('span', 'om-name', { text: info.name }), n.tag ? el('span', 'om-tag', { text: n.tag }) : null]),
      info.role ? el('span', 'om-role', { text: info.role }) : null,
      unitLine(n, act)
    ]), meta];
    var cls = 'om-row' + (info.kind === 'vacant' ? ' om-row--vacant' : '');
    var r = act ? el('button', cls, { type: 'button', onclick: function () {
      if (act === 'chart') showChart(n.chart);
      else if (act === 'drill') { state.path.push(n); render(); window.scrollTo(0, 0); }
      else openPerson(n);
    } }, kids) : el('div', cls, null, kids);
    rowMap.set(n, r);
    return el('li', null, null, [r]);
  }
  function unitLine(n, act) {
    var u = (n.units || []).concat(strs(n.stack)).concat(n.matrix || []);
    if (!u.length || act === 'drill' || act === 'chart') return null;
    return el('span', 'om-units', null, u.map(function (x) { return el('span', 'om-unit', { text: x }); }));
  }
  function section(title, ic, nodes, mod) {
    if (!nodes.length) return null;
    return el('section', 'om-section' + (mod ? ' om-section--' + mod : ''), null, [
      el('h2', 'om-section-title', null, [ic ? icon(ic) : null, title, el('b', null, { text: String(nodes.length) })]),
      el('ul', 'om-list', null, nodes.map(row))
    ]);
  }
  function chips(title, list, mod) {
    if (!list.length) return null;
    return el('section', 'om-section', null, [
      el('h2', 'om-section-title', null, [title, el('b', null, { text: String(list.length) })]),
      el('ul', 'om-chips', null, list.map(function (u) { return el('li', 'om-chip' + (mod ? ' om-chip--' + mod : ''), { text: u }); }))
    ]);
  }
  function render() {
    rowMap = new Map();
    main.textContent = '';
    var c = chartById(state.chart);
    var node = state.path[state.path.length - 1];
    var info = nodeInfo(node);

    if (state.path.length > 1) {
      var crumbs = el('nav', 'om-crumbs', { 'aria-label': 'Caminho' }, [
        el('button', 'om-back', { type: 'button', 'aria-label': 'Voltar um nível', onclick: function () { state.path.pop(); render(); } }, [icon('arrow_back')])
      ]);
      state.path.forEach(function (n, i) {
        var last = i === state.path.length - 1;
        if (i) crumbs.appendChild(el('span', 'om-icon om-crumb-sep', { 'aria-hidden': 'true', text: 'chevron_right' }));
        crumbs.appendChild(el('button', 'om-crumb', { type: 'button', 'aria-current': last ? 'page' : null, onclick: last ? null : function () { state.path = state.path.slice(0, i + 1); render(); } }, [i === 0 ? c.label : (n.role || nodeInfo(n).name)]));
      });
      main.appendChild(crumbs);
      requestAnimationFrame(function () { crumbs.scrollLeft = crumbs.scrollWidth; });
    } else if (D.ceo && !c.root.ceo) {
      var ci = nodeInfo(D.ceo);
      main.appendChild(el('button', 'om-reports', { type: 'button', onclick: function () { openPerson(D.ceo); } }, [
        photo(ci, 'sm'), el('span', 'om-text', null, [el('span', 'om-reports-lbl', { text: 'Reporta a' }), el('span', 'om-name', { text: ci.name + ' · ' + (D.ceo.role || '') })])
      ]));
    }

    var fcls = 'om-focus' + (node.ceo ? ' om-focus--ceo' : '') + (info.kind === 'area' || info.kind === 'entity' ? ' om-focus--area' : '') + (info.kind === 'vacant' ? ' om-focus--vacant' : '');
    var fkids = [
      photo(info, 'lg'),
      el('span', 'om-text', null, [el('span', 'om-focus-name', { text: info.name }), info.role ? el('span', 'om-focus-role', { text: info.role }) : null]),
      node.tag ? el('span', 'om-tag', { text: node.tag }) : null
    ];
    var focus = info.kind === 'person' ? el('button', fcls, { type: 'button', onclick: function () { openPerson(node); } }, fkids) : el('div', fcls, null, fkids);
    rowMap.set(node, focus);
    main.appendChild(focus);
    if (node.chart && node.chart !== state.chart) main.appendChild(el('button', 'om-btn', { type: 'button', onclick: function () { showChart(node.chart); } }, ['Ver estrutura da área', icon('chevron_right')]));

    var parts = [
      chips('Gestão matricial', node.matrix || [], 'matrix'),
      section('Assessoria', null, objs(node.staff).concat(objs(node.aside))),
      chips('Subáreas', (node.units || []).concat(strs(node.stack))),
      section('Equipe', null, objs(node.children).concat(objs(node.stack))),
      section('Atuação transversal', 'sync_alt', objs(node.transversal), 'transversal'),
      section('Consultores especializados', 'support_agent', objs(node.consultants), 'consultants')
    ].filter(Boolean);
    if (!parts.length && state.path.length === 1) parts.push(el('p', 'om-empty', { text: 'Estrutura ainda não cadastrada.' }));
    parts.forEach(function (p) { main.appendChild(p); });
  }

  function showChart(id, keepHash) {
    var c = chartById(id) || D.charts[0];
    state.chart = c.id;
    state.path = [c.root];
    pickVal.textContent = c.label;
    homeBtn.disabled = c.id === D.charts[0].id;
    if (!keepHash) { try { history.replaceState(null, '', '#' + c.id); } catch (e) { /* sandbox */ } }
    render();
    window.scrollTo(0, 0);
  }

  /* ---------- busca ---------- */
  var index = [];
  D.charts.forEach(function (c) {
    (function walk(n, path) {
      var info = nodeInfo(n), here = path.concat([n]);
      if (info.kind === 'person' || info.kind === 'entity' || (info.kind === 'area' && info.name)) {
        index.push({ chart: c.id, node: n, info: info, path: here, key: norm(info.name + ' ' + info.role + ' ' + (n.units || []).join(' ')) });
      }
      KIDS.forEach(function (k) { objs(n[k]).forEach(function (x) { walk(x, here); }); });
    })(c.root, []);
  });
  function renderResults(q) {
    results.textContent = '';
    if (!q) { results.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var list = index.filter(function (r) { return terms.every(function (t) { return r.key.indexOf(t) >= 0; }); }).slice(0, 30);
    if (!list.length) results.appendChild(el('li', 'om-empty-result', { text: 'Nenhum resultado para “' + q + '”.' }));
    list.forEach(function (r) {
      results.appendChild(el('li', null, { role: 'presentation' }, [
        el('button', 'om-result', { type: 'button', role: 'option', onclick: function () { pick(r); } }, [
          photo(r.info, 'sm'),
          el('span', 'om-text', null, [el('span', 'om-name', { text: r.info.name }), r.info.role ? el('span', 'om-role', { text: r.info.role }) : null]),
          el('span', 'om-result-area', { text: chartLabel(r.chart) })
        ])
      ]));
    });
    results.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  function pick(r) {
    results.hidden = true; input.setAttribute('aria-expanded', 'false');
    input.value = r.info.name; clearBtn.hidden = false;
    input.blur();
    if (state.chart !== r.chart) showChart(r.chart);
    state.path = r.path.length > 1 ? r.path.slice(0, -1) : r.path.slice();
    render();
    spotlight(rowMap.get(r.node));
  }
  var spotTimer;
  function spotlight(t) {
    if (!t) return;
    var y = t.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 24;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    clearTimeout(spotTimer);
    t.classList.add('is-spot');
    spotTimer = setTimeout(function () { t.classList.remove('is-spot'); }, 2200);
  }
  function goToPerson(pid, chartId, role) {
    var r = index.filter(function (x) { return x.chart === chartId && x.node.person === pid && (!role || x.node.role === role); })[0]
      || index.filter(function (x) { return x.chart === chartId && x.node.person === pid; })[0];
    if (r) pick(r); else showChart(chartId);
    input.value = ''; clearBtn.hidden = true;
  }
  input.addEventListener('input', function () { clearBtn.hidden = !input.value; renderResults(input.value.trim()); });
  input.addEventListener('focus', function () { if (input.value.trim()) renderResults(input.value.trim()); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var b = results.querySelector('.om-result'); if (b) { e.preventDefault(); b.click(); } }
    else if (e.key === 'Escape') { results.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('click', function (e) { if (!search.contains(e.target)) { results.hidden = true; input.setAttribute('aria-expanded', 'false'); } });

  /* ---------- início ---------- */
  var initial = (location.hash || '').replace('#', '');
  showChart(chartById(initial) ? initial : D.charts[0].id, !chartById(initial));
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (chartById(h) && h !== state.chart) showChart(h, true); });
})();
