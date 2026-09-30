/* Organograma zhouse — renderização e interação (sem dependências). Dados em js/data.js */
(function () {
  'use strict';

  var D = window.ORG_DATA;
  var root = document.getElementById('org-app');
  if (!D || !root) return;

  var state = { chart: null, zoom: 1, lastFocus: null, touched: false };
  var MIN_Z = 0.25, MAX_Z = 1.5;

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
      el('span', 'org-name', { text: info.name }),
      info.role ? el('span', 'org-role', { text: info.role }) : null,
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

  function branch(node, isRoot) {
    var li = el('li', 'org-branch');
    var block = nodeBlock(node, false);

    if (node.staff && node.staff.length) {
      var line = el('div', 'org-ceo-line');
      ['left', 'right'].forEach(function (side) {
        var s = node.staff.filter(function (x) { return (x.side || 'right') === side; });
        var holder = el('div', 'org-staff is-' + side);
        if (s.length) {
          var col = el('div', null, { style: 'display:flex;flex-direction:column;gap:8px' });
          s.forEach(function (x) { col.appendChild(card(x, true)); });
          if (side === 'left') { holder.appendChild(col); holder.appendChild(el('span', 'org-staff-link')); }
          else { holder.appendChild(el('span', 'org-staff-link')); holder.appendChild(col); }
        }
        if (side === 'left') line.appendChild(holder); else { line.appendChild(block); line.appendChild(holder); }
      });
      li.appendChild(line);
    } else {
      li.appendChild(block);
    }

    var items = [];
    (node.children || []).forEach(function (c) { items.push({ node: c }); });
    if (node.transversal && node.transversal.length) items.push({ group: 'transversal', nodes: node.transversal });
    if (node.consultants && node.consultants.length) items.push({ group: 'consultants', nodes: node.consultants, detached: true });

    if (items.length) {
      var ul = el('ul', 'org-row');
      var connected = [];
      items.forEach(function (it) {
        var child;
        if (it.group) { child = el('li', 'org-branch'); child.appendChild(groupBox(it.group, it.nodes)); }
        else child = branch(it.node, false);
        if (it.detached) child.classList.add('is-detached'); else connected.push(child);
        ul.appendChild(child);
      });
      if (!connected.length) ul.classList.add('no-line');
      else if (connected.length === 1) connected[0].classList.add('is-only');
      else { connected[0].classList.add('is-first'); connected[connected.length - 1].classList.add('is-last'); }
      li.appendChild(ul);
    }

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
  search.appendChild(el('div', 'org-search-field', null, [input, icon('search')]));
  search.appendChild(results);
  titlebar.appendChild(search);
  top.appendChild(titlebar);

  var tabs = el('div', 'org-tabs', { role: 'tablist', 'aria-label': 'Organogramas por área' });
  D.charts.forEach(function (c) {
    tabs.appendChild(el('button', 'org-tab', { type: 'button', role: 'tab', id: 'org-tab-' + c.id, 'aria-controls': 'org-viewport', 'aria-selected': 'false', 'data-chart': c.id, text: c.label, onclick: function () { showChart(c.id); } }));
  });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var list = [].slice.call(tabs.children), i = list.indexOf(document.activeElement);
    if (i < 0) return;
    var next = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
    next.focus(); next.click();
  });
  top.appendChild(tabs);

  var viewport = el('div', 'org-viewport', { id: 'org-viewport', role: 'tabpanel', tabindex: '-1' });
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
    el('button', 'org-tool', { type: 'button', 'aria-label': 'Ajustar à tela', title: 'Ajustar à tela', onclick: function () { fit(true); } }, [icon('fit_screen')]),
    el('button', 'org-tool', { type: 'button', 'aria-label': 'Tamanho real (100%)', title: 'Tamanho real', onclick: function () { setZoom(1); } }, [icon('crop_free')])
  ]);
  var legend = el('div', 'org-legend', { 'aria-hidden': 'true' });

  var shell = el('div', 'org-shell', { style: 'position:relative;flex:1;min-height:0;display:flex;flex-direction:column' }, [viewport, tools, legend]);
  root.appendChild(top);
  root.appendChild(shell);

  /* ---------- zoom / pan ---------- */
  function natural() { return { w: canvas.offsetWidth, h: canvas.offsetHeight }; }
  function sizeStage() {
    var n = natural(), z = state.zoom;
    stage.style.width = Math.ceil(n.w * z) + 'px';
    stage.style.height = Math.ceil(n.h * z) + 'px';
    var free = viewport.clientWidth - n.w * z;
    stage.style.marginLeft = free > 0 ? Math.floor(free / 2) + 'px' : '0';
    canvas.style.transform = 'scale(' + z + ')';
    zoomLabel.textContent = Math.round(z * 100) + '%';
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
  function fit(all) {
    if (!viewport.clientWidth) return;
    if (all) state.touched = true;
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
  function refit() { if (!viewport.clientWidth) return; if (state.touched) sizeStage(); else fit(false); }
  window.addEventListener('resize', refit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(viewport);

  /* ---------- troca de organograma ---------- */
  function hasKind(node, key) {
    if (!node) return false;
    if (key === 'units' && node.units && node.units.length) return true;
    if (key === 'interim' && node.tag) return true;
    if (node[key] && node[key].length) return true;
    return ['children', 'stack', 'transversal', 'consultants'].some(function (k) { return (node[k] || []).some(function (c) { return hasKind(c, key); }); });
  }

  function showChart(id, opts) {
    var c = chartById(id) || D.charts[0];
    state.chart = c.id;
    [].forEach.call(tabs.children, function (t) {
      var on = t.getAttribute('data-chart') === c.id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && t.scrollIntoViewIfNeeded) t.parentNode.scrollLeft = t.offsetLeft - 24;
    });
    viewport.setAttribute('aria-labelledby', 'org-tab-' + c.id);

    canvas.textContent = '';
    var tree = el('ul', 'org-tree');
    var rootNode = c.root;
    if (D.ceo && !rootNode.ceo) {
      // nos organogramas de área, o CEO aparece no topo (como no PPT)
      rootNode = Object.assign({}, D.ceo, { children: [c.root] });
    }
    tree.appendChild(branch(rootNode, true));
    canvas.appendChild(tree);

    legend.textContent = '';
    [['units', 'is-units', 'Subáreas'], ['transversal', 'is-transversal', 'Atuação transversal'], ['consultants', 'is-consultants', 'Consultores especializados'], ['interim', 'is-interim', 'Interino']].forEach(function (l) {
      if (hasKind(c.root, l[0])) legend.appendChild(el('span', null, null, [el('i', l[1]), l[2]]));
    });
    legend.style.display = legend.children.length ? '' : 'none';

    if (!opts || !opts.keepHash) {
      try { history.replaceState(null, '', '#' + c.id); } catch (e) { /* iframe sandbox */ }
    }
    state.touched = false;
    fit(false);
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
      ['staff', 'children', 'stack', 'transversal', 'consultants'].forEach(function (k) { (n[k] || []).forEach(walk); });
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
      node.tag ? el('span', 'org-tag', { text: node.tag }) : null
    ]);
    var body = el('div', 'org-dialog-body');
    if (node.note) body.appendChild(el('p', 'org-note', { text: node.note }));
    if (p.description) body.appendChild(el('p', 'org-desc', { text: p.description }));

    var contacts = el('div', 'org-contacts');
    if (p.email) contacts.appendChild(el('a', 'org-contact', { href: 'mailto:' + p.email }, [icon('mail'), p.email]));
    if (p.phone) contacts.appendChild(el('a', 'org-contact', { href: 'tel:' + p.phone.replace(/[^\d+]/g, '') }, [icon('call'), p.phone]));
    if (contacts.children.length) body.appendChild(contacts);
    if (!p.description && !p.email && !p.phone) body.appendChild(el('p', 'org-empty', { text: 'Apresentação e contatos ainda não cadastrados.' }));

    var others = (occurrences[node.person] || []).filter(function (o) { return !(o.chart === state.chart && o.role === (node.role || '')) && o.chart !== 'visao-geral'; });
    if (others.length) {
      var also = el('div', 'org-also', null, [el('span', 'org-also-title', { text: 'Também aparece em' })]);
      others.forEach(function (o) {
        var c = chartById(o.chart);
        also.appendChild(el('button', null, { type: 'button', onclick: function () { closeModal(); goToPerson(node.person, o.chart, o.role); } }, [icon('arrow_forward'), c.label + (o.role ? ' · ' + o.role : '') + (o.tag ? ' (' + o.tag + ')' : '')]));
      });
      body.appendChild(also);
    }
    if (node.chart && node.chart !== state.chart) {
      body.appendChild(el('div', null, null, [el('button', 'org-btn', { type: 'button', onclick: function () { closeModal(); showChart(node.chart); } }, ['Ver estrutura da área', icon('arrow_forward')])]));
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
      ['staff', 'children', 'stack', 'transversal', 'consultants'].forEach(function (k) { (n[k] || []).forEach(walk); });
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
          el('span', 'org-result-text', null, [el('strong', null, { text: r.info.name }), el('span', null, { text: [r.info.role, c.label].filter(Boolean).join(' · ') })])
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
    if (r.node.person) goToPerson(r.node.person, r.chart, r.node.role || '', true);
    else showChart(r.chart, { then: function () { highlight(findCard(function (n) { return n.textContent.indexOf(r.info.name) >= 0; })); } });
  }
  input.addEventListener('input', function () { renderResults(input.value.trim()); });
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
  function highlight(target) {
    if (!target) return;
    // expande ramos recolhidos
    var b = target.parentNode;
    while (b && b !== canvas) { if (b.classList && b.classList.contains('is-collapsed')) b.classList.remove('is-collapsed'); b = b.parentNode; }
    sizeStage();
    var vr = viewport.getBoundingClientRect(), tr = target.getBoundingClientRect();
    viewport.scrollLeft += (tr.left + tr.width / 2) - (vr.left + vr.width / 2);
    viewport.scrollTop += (tr.top + tr.height / 2) - (vr.top + vr.height / 2);
    target.classList.remove('is-highlight'); void target.offsetWidth; target.classList.add('is-highlight');
  }
  function goToPerson(pid, chartId, role, open) {
    var go = function () {
      var name = (D.people[pid] || {}).name;
      var target = findCard(function (n) {
        if (n.getAttribute('data-person') !== pid) return false;
        var r = n.querySelector('.org-role');
        return !role || (r && r.textContent === role);
      }) || findCard(function (n) { return n.getAttribute('data-person') === pid; });
      highlight(target);
      if (open && target) target.click();
    };
    if (state.chart === chartId) go(); else showChart(chartId, { then: go });
  }

  /* ---------- início ---------- */
  var initial = (location.hash || '').replace('#', '');
  showChart(chartById(initial) ? initial : D.charts[0].id, { keepHash: !chartById(initial) });
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (chartById(h) && h !== state.chart) showChart(h, { keepHash: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
})();
