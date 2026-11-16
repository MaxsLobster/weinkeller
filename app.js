/* Weinkeller – App-Logik (Vanilla JS, keine Abhängigkeiten) */
(function () {
  'use strict';

  const KEY = 'weinkeller.v1';
  const NOW_YEAR = () => new Date().getFullYear();
  const $app = document.getElementById('app');
  const BAD = (window.__wkBad = new Set());
  const imgTag = (src, attrs = '') => (src && !BAD.has(src) ? `<img src="${esc(src)}" alt="" loading="lazy" ${attrs} onerror="window.__wkBad.add(this.getAttribute('src'));this.remove()">` : '');

  // ---------- Speicher ----------
  function seed() {
    return { v: 1, wines: SEED_WINES.map((w) => ({ ...w, addedAt: Date.now() })), tastings: [], school: { right: {}, lessons: {} } };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      const s = JSON.parse(raw);
      // neue Stammdaten-Felder (Bilder, Texte) aus SEED nachziehen, Bestand + eigene Weine behalten
      const byId = Object.fromEntries(SEED_WINES.map((w) => [w.id, w]));
      s.wines = s.wines.map((w) => (byId[w.id] ? { ...byId[w.id], bottles: w.bottles, addedAt: w.addedAt } : w));
      return s;
    } catch (e) { return seed(); }
  }
  let S = load();
  const norm = () => { S.school = S.school || {}; S.school.right = S.school.right || {}; S.school.lessons = S.school.lessons || {}; };
  norm();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* Speicher nicht verfügbar */ } }
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}

  // ---------- UI-Zustand ----------
  const ui = { tab: 'keller', stack: [], filter: 'alle', searchOpen: false, sommelierWine: null, q: '', expanded: null, draft: null, showCmp: {}, confirmEmpty: null, showEmpty: false, learnOpen: null, sheet: null, quiz: null, mini: null, chOpen: null };

  // ---------- Helfer ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wine = (id) => S.wines.find((w) => w.id === id);
  const tasting = (id) => S.tastings.find((t) => t.id === id);
  const aroma = (id) => AROMAS.find((a) => a.id === id);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const COLOR = { rot: { label: 'Rot', dot: '#B4233C', lab: '#5E1420' }, weiss: { label: 'Weiß', dot: '#E9B949', lab: '#8C7A3A' }, rose: { label: 'Rosé', dot: '#E39A9A', lab: '#B5646A' } };
  const openTastingOf = (wid) => S.tastings.find((t) => t.wineId === wid && !t.done);

  function status(w) {
    const y = NOW_YEAR();
    if (openTastingOf(w.id)) return { k: 'open', t: 'offen', cls: 'p-open' };
    if (!w.bottles) return { k: 'leer', t: 'ausgetrunken', cls: 'p-wait' };
    if (w.from && y < w.from) return { k: 'wait', t: 'noch lagern', cls: 'p-wait' };
    if (w.to && y > w.to) return { k: 'late', t: 'bald trinken', cls: 'p-dec' };
    return { k: 'ok', t: 'trinkreif', cls: 'p-ok' };
  }
  const decantTxt = (w) => (w.decant >= 30 ? `${w.decant} Min dekantieren` : w.decant > 0 ? 'kurz belüften' : '');

  function fmtDur(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    if (h < 24) return r ? `${h} h ${r} min` : `${h} h`;
    const d = Math.floor(h / 24), hh = h % 24;
    return `${d} ${d === 1 ? 'Tag' : 'Tage'}${hh ? ' ' + hh + ' h' : ''}`;
  }
  function whenLabel(t, at) {
    const ms = at - t.openedAt;
    if (ms < 10 * 60000) return 'Beim Öffnen';
    if (ms > 18 * 3600000) return `Am nächsten Tag (+${fmtDur(ms)})`;
    return `nach ${fmtDur(ms)}`;
  }
  const clock = (ts) => {
    const d = new Date(ts), today = new Date();
    const hm = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === today.toDateString()) return `heute ${hm}`;
    const y = new Date(today); y.setDate(today.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return `gestern ${hm}`;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + hm;
  };
  function toast(msg) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el); setTimeout(() => el.remove(), 2200);
  }

  // ---------- Icons ----------
  const I = {
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polyline points="15,5 8,12 15,19"/></svg>',
    plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="20" y2="20"/></svg>',
    check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><polyline points="5,12 10,17 19,7"/></svg>',
    keller: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="18" x2="14" y2="18"/></svg>',
    glas: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 3h10l-1 7a4 4 0 0 1-8 0z"/><line x1="12" y1="14" x2="12" y2="20"/><line x1="8" y1="21" x2="16" y2="21"/></svg>',
    region: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 15l5-4 4 3 3-2 4 3"/></svg>',
    wall: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="3.5" width="7" height="8" rx="1.5"/><rect x="13" y="3.5" width="7" height="8" rx="1.5"/><rect x="4" y="13.5" width="7" height="8" rx="1.5"/><rect x="13" y="13.5" width="7" height="8" rx="1.5"/></svg>',
    chat: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16v11H10l-5 4v-4H4z"/></svg>',
    profil: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polygon points="12,3 20,8 20,16 12,21 4,16 4,8"/><polygon points="12,8 16,10.5 15,15 9,15 8,10.5"/></svg>'
  };

  // ---------- Bausteine ----------
  function labelEl(w, wpx, hpx, extra = '') {
    const c = COLOR[w.color] || COLOR.rot;
    return `<div class="label" style="width:${wpx}px;height:${hpx}px;background:${c.lab};${extra}">
      <div class="ph"><i></i><i></i><i></i></div>
      ${w.img ? `<img src="${esc(w.img)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
    </div>`;
  }
  function regionImg(rid, extra = '') {
    const r = REGIONS[rid];
    if (!r) return `<div style="position:absolute;inset:0;background:#EDE6E0"></div>`;
    return `<div style="position:absolute;inset:0;background:${r.tint}">
      <svg width="100%" height="100%" viewBox="0 0 330 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 Q70 30 150 55 T330 50 V120 H0z" fill="#9DBF8F"/><path d="M0 86 Q90 66 190 84 T330 80 V120 H0z" fill="#6E9A6A"/></svg></div>
      ${imgTag(r.img, 'style="position:absolute;inset:0" ' + extra)}`;
  }
  function aromaIcon(a) {
    const cols = { rot: '#E9A3B1', dunkel: '#9E7BB0', zitrus: '#F3D46B', obst: '#BFD98A', blumig: '#C9A6E4', kraeuter: '#9CCB9A', wuerze: '#D9A27A', erde: '#B59A7A', mineral: '#AEB9C4', holz: '#C9A27E' };
    return `<div class="ai"><div class="fb" style="background:${cols[a.cat] || '#ddd'}"></div>${imgTag(a.img, 'style="position:absolute"')}</div>`;
  }
  // Schwebende Leiste: Pille mit 4 Icons + eigener Sommelier-Knopf
  const DOCK = {
    keller: '<path d="M10 3.5h4v3.2c0 1.3 2.2 2.2 2.2 5.3v8a1.2 1.2 0 0 1-1.2 1.2H9a1.2 1.2 0 0 1-1.2-1.2v-8c0-3.1 2.2-4 2.2-5.3z"/><path d="M8.3 13.5h7.4v4.2H8.3z"/>',
    offen: '<path d="M7 3.5h10c.3 5.3-1.6 8.6-5 8.6S6.7 8.8 7 3.5z"/><path d="M7.4 7.2c2.8.8 6.4-.6 9.2.2"/><path d="M12 12.1v7.2"/><path d="M8.4 20.5h7.2"/>',
    regionen: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.8"/><rect x="14.4" y="8.2" width="3.6" height="4" rx=".4"/><path d="M6.3 10h5.2M6.3 13h5.2M6.3 15.8h3.4"/>',
    profil: '<path d="M12 3.6l7.3 4.2v8.4L12 20.4l-7.3-4.2V7.8z"/><path d="M12 8.2l3.4 2.3-.9 4.2H9.6l-1-4z"/>'
  };
  const dockIcon = (k) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DOCK[k]}</svg>`;
  const SOMM_SVG = '<svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M6 6h22a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H15l-6 5v-5H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#F3E4EA" stroke="#8C1D47" stroke-width="1.6"/><path d="M13.5 10h7c.2 3.4-1.2 5.4-3.5 5.4s-3.7-2-3.5-5.4z" fill="#8C1D47"/><path d="M17 15.4v3.4M15 19.4h4" stroke="#8C1D47" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const tabsHtml = () => {
    const open = S.tastings.filter((t) => !t.done).length;
    const names = { keller: 'Keller', offen: 'Offen', regionen: 'Regionen', profil: 'Profil' };
    const b = (id) => `<button class="${ui.tab === id ? 'on' : ''}" data-act="tab" data-id="${id}" aria-label="${names[id]}${id === 'offen' && open ? ` (${open} offen)` : ''}">${dockIcon(id)}${id === 'offen' && open ? '<span class="pip"></span>' : ''}</button>`;
    return `<div class="dock"><nav class="pill">${b('keller')}${b('offen')}${b('regionen')}${b('profil')}</nav>
      <button class="somm ${ui.tab === 'sommelier' ? 'on' : ''}" data-act="tab" data-id="sommelier" aria-label="Sommelier">${SOMM_SVG}${imgTag(ASSETS.sommelier)}</button></div>`;
  };
  // Header: Aquarell-Weinberg passend zur Jahreszeit
  function seasonKey(d = new Date()) { const m = d.getMonth(); return m >= 2 && m <= 4 ? 'fruehling' : m >= 5 && m <= 7 ? 'sommer' : m >= 8 && m <= 10 ? 'lese' : 'winter'; }
  const headerHtml = () => `<div class="hdr ${seasonKey()}">${imgTag((ASSETS.header || {})[seasonKey()])}</div>`;

  // ---------- Etikett (Foto oder gezeichnet) ----------
  const LABEL_STYLES = [
    { bg: '#F4EFE6', fg: '#2B2B2B', line: '#B9A98C', font: "'Cormorant Garamond',serif" },
    { bg: '#1F1E1C', fg: '#E9DCC0', line: '#6E654F', font: "'Fraunces',serif" },
    { bg: '#FFFFFF', fg: '#7A1C2A', line: '#D9C7C9', font: "'Bricolage Grotesque',sans-serif" },
    { bg: '#E9E1D2', fg: '#3A2A1E', line: '#A88F6E', font: "'Cormorant Garamond',serif" },
    { bg: '#262A33', fg: '#F2EBDD', line: '#596075', font: "'Bricolage Grotesque',sans-serif" },
    { bg: '#F7F1E8', fg: '#5E1420', line: '#C9B08E', font: "'Fraunces',serif" },
    { bg: '#14233A', fg: '#E7D7A8', line: '#4A5A73', font: "'Cormorant Garamond',serif" },
    { bg: '#E8E4DC', fg: '#1D1D1B', line: '#A8A294', font: "'Bricolage Grotesque',sans-serif" }
  ];
  function labelStyle(w) { let i = S.wines.indexOf(w); if (i < 0) { i = 0; for (const c of w.id) i = (i * 31 + c.charCodeAt(0)) >>> 0; } return LABEL_STYLES[(i * 3) % LABEL_STYLES.length]; }
  function typoLabel(w, k) { // k = Skalierung (1 = Kachel ~160px breit)
    const st = labelStyle(w), n = w.name || '';
    const fs = (n.length <= 7 ? 32 : n.length <= 11 ? 26 : n.length <= 18 ? 21 : 17) * k;
    const r = REGIONS[w.region];
    return `<div class="tlab" style="background:${st.bg};color:${st.fg};padding:${9 * k}px"><div class="tin" style="border-color:${st.line};gap:${7 * k}px;padding:${8 * k}px">
      <small style="font-size:${9 * k}px">${esc(w.producer || '')}</small><b style="font-family:${st.font};font-size:${fs}px">${esc(n)}</b><small style="font-size:${10 * k}px;letter-spacing:1px">${esc(r ? r.name : (w.grapes || ''))}</small></div></div>`;
  }
  function bigLabel(w, wpx, hpx) {
    return `<div class="biglabel" style="width:${wpx}px;height:${hpx}px">${typoLabel(w, wpx / 160)}${imgTag(w.img, w.labelPos ? `style="object-position:${esc(w.labelPos)};transform-origin:${esc(w.labelPos)}"` : '')}</div>`;
  }

  // ---------- Keller (Etiketten-Wand) ----------
  function vKeller() {
    const total = S.wines.reduce((n, w) => n + (w.bottles || 0), 0);
    const openN = S.tastings.filter((t) => !t.done).length;
    const inCellar = S.wines.filter((w) => w.bottles > 0 || openTastingOf(w.id));
    const cnt = (f) => inCellar.filter(f).reduce((n, w) => n + Math.max(1, w.bottles || 0), 0);
    const seg = (id, label) => `<button class="${ui.filter === id ? 'on' : ''}" data-act="filter" data-id="${id}">${label}</button>`;
    if (!inCellar.length) return `${headerHtml()}<div class="screen after-hdr"><div class="top"><div><h1 class="h1">Keller</h1></div><button class="iconbtn primary" data-act="add" aria-label="Flasche hinzufügen">${I.plus}</button></div>
      <div class="emptyart">${imgTag(ASSETS.emptyRack)}<b>Der Keller ist leer</b><span>Zeit für eine neue Bestellung – oder eine Flasche von Hand hinzufügen.</span></div></div>`;
    return `${headerHtml()}<div class="screen after-hdr">
      <div class="top"><div><div class="kicker">${total} Flaschen${openN ? ` · ${openN} offen` : ''}</div><h1 class="h1">Keller</h1></div>
        <div class="row"><button class="iconbtn" data-act="search" aria-label="Suchen">${I.search}</button><button class="iconbtn primary" data-act="add" aria-label="Flasche hinzufügen">${I.plus}</button></div></div>
      ${ui.searchOpen ? `<label class="search">${I.search}<input id="q" type="search" placeholder="Wein, Winzer, Rebsorte, Region …" value="${esc(ui.q)}" autocomplete="off"></label>` : ''}
      <div class="seg">${seg('rot', `Rot · ${cnt((w) => w.color === 'rot')}`)}${seg('weiss', `Weiß · ${cnt((w) => w.color !== 'rot')}`)}${seg('alle', 'Alle')}</div>
      <div id="klist">${kellerList()}</div></div>`;
  }
  function kellerList() {
    const q = (ui.q || '').trim().toLowerCase();
    let ws = S.wines.filter((w) => w.bottles > 0 || openTastingOf(w.id));
    if (ui.filter === 'rot') ws = ws.filter((w) => w.color === 'rot');
    else if (ui.filter === 'weiss') ws = ws.filter((w) => w.color !== 'rot');
    if (q) ws = ws.filter((w) => [w.name, w.producer, w.grapes, (REGIONS[w.region] || {}).name, String(w.vintage)].join(' ').toLowerCase().includes(q));
    const order = { open: 0, ok: 1, late: 2, wait: 3, leer: 4 };
    ws.sort((a, b) => order[status(a).k] - order[status(b).k] || (a.color === b.color ? 0 : a.color === 'rot' ? -1 : 1) || a.name.localeCompare(b.name));
    const empty = S.wines.filter((w) => !w.bottles && !openTastingOf(w.id));
    let html = ws.length ? `<div class="wall">${ws.map(tile).join('')}</div>` : `<div class="empty" style="margin-top:16px">Nichts gefunden.</div>`;
    if (empty.length) {
      html += `<button class="link" data-act="toggleEmpty" style="margin-top:12px">${ui.showEmpty ? 'Ausgetrunkene ausblenden' : `Ausgetrunken (${empty.length}) anzeigen`}</button>`;
      if (ui.showEmpty) html += `<div class="wall" style="opacity:.6">${empty.map(tile).join('')}</div>`;
    }
    return html;
  }
  function tile(w) {
    const st = status(w), ot = openTastingOf(w.id);
    const dot = { ok: '#2E8B57', wait: '#B9B0B6', late: '#F07B3F', leer: '#B9B0B6', open: '#8C1D47' }[st.k];
    const note = ot ? `offen seit ${fmtDur(Date.now() - ot.openedAt)}` : st.k === 'leer' ? 'ausgetrunken' : w.decant >= 30 ? `${w.decant} Min` : st.t;
    return `<button class="tile" data-act="wsheet" data-id="${w.id}">
      <div class="tframe">${bigLabel(w, 160, 200).replace('class="biglabel" style="width:160px;height:200px"', 'class="biglabel fill"')}
        <span class="tdot" style="background:${w.decant >= 30 && st.k === 'ok' ? '#F07B3F' : dot}"></span>
        ${ot ? '<span class="topen">offen</span>' : ''}${w.bottles > 1 ? `<span class="tcount">×${w.bottles}</span>` : ''}</div>
      <div class="tcap"><b>${w.vintage || '–'}</b><span>${esc(note)}</span></div></button>`;
  }
  function sheetWine(id) {
    const w = wine(id); if (!w) return '';
    const st = status(w), r = REGIONS[w.region], ot = openTastingOf(w.id);
    const ts = S.tastings.filter((t) => t.wineId === id && t.probes.length);
    const best = ts.length ? Math.max(...ts.flatMap((t) => t.probes.map((p) => p.rating || 0))) : 0;
    return `<div class="sheet-bg" data-act="closesheet"><div class="sheet" data-stop="1">
      <div class="grab"></div>
      <div class="row" style="gap:16px;align-items:flex-end">${bigLabel(w, 112, 148)}
        <div style="min-width:0;padding-bottom:4px"><div class="disp" style="font-weight:800;font-size:25px;line-height:1.03">${esc(w.name)} ${w.vintage || ''}</div>
          <div class="small" style="color:#4A3F48;margin-top:3px">${esc(w.producer || '')}${w.grapes ? ' · ' + esc(w.grapes.split(/[,(]|\s\d/)[0].trim()) : ''}</div>
          <div class="wrapchips" style="gap:6px;margin-top:8px">${ot ? `<span class="pill p-open">offen seit ${fmtDur(Date.now() - ot.openedAt)}</span>` : ''}<span class="pill ${st.k === 'open' ? 'p-ok' : st.cls}">${st.k === 'open' ? 'trinkreif' : st.t}</span>${w.bottles > 1 ? `<span class="pill p-wait">${w.bottles} Flaschen</span>` : ''}</div></div></div>
      ${r ? `<div class="strip" style="height:96px;margin-top:14px">${regionImg(w.region)}<div class="tag">${esc(r.name)} · ${esc(r.area)}</div></div>` : ''}
      <div class="facts" style="margin-top:12px">
        <div class="fact ${w.decant >= 30 ? 'dec' : ''}"><span>Dekantieren</span><b>${w.decant >= 30 ? w.decant + ' Min' : w.decant > 0 ? 'kurz' : 'nein'}</b></div>
        <div class="fact"><span>Temperatur</span><b>${esc(w.temp || '–')}${w.temp ? ' °C' : ''}</b></div>
        <div class="fact"><span>Proben</span><b>${ts.length ? ts.reduce((n, t) => n + t.probes.length, 0) + ' · ' + best + '/5' : '–'}</b></div>
      </div>
      <div class="btns" style="margin-top:14px"><button class="btn" data-act="wine" data-id="${w.id}">Weinkarte</button>
        ${ot ? `<button class="btn fill" data-act="probe" data-id="${ot.id}">Neue Probe</button>` : w.bottles > 0 ? `<button class="btn fill" data-act="open" data-id="${w.id}">Öffnen</button>` : ''}</div>
      <button class="link" style="width:100%;margin-top:6px" data-act="askSommelier" data-id="${w.id}">Sommelier zu diesem Wein fragen</button>
    </div></div>`;
  }

  // ---------- Sommelier (Platzhalter bis zur Claude-Anbindung) ----------
  function vSommelier() {
    const ctx = ui.sommelierWine ? wine(ui.sommelierWine) : null;
    const qs = ctx ? [`Wann sollte ich den ${ctx.name} öffnen?`, `Was koche ich zum ${ctx.name}?`, `Was ist typisch für ${(REGIONS[ctx.region] || {}).name || 'diese Region'}?`]
      : ['Wir grillen Lamm – was mach ich auf?', 'Warum riecht ein Wein nach Leder?', 'Was ist der Unterschied zwischen Mencía und Pinot?', 'Welcher Wein ist gerade am besten?'];
    return `<div class="screen stack" style="align-items:center;text-align:center">
      <div class="emblem">${imgTag(ASSETS.sommelier)}</div>
      <div><h1 class="h1" style="font-size:30px">Dein Sommelier</h1>
        <p class="small" style="color:#4A3F48;line-height:1.5;margin:8px 6px 0">Kennt deinen Keller, deine Proben und deinen Geschmack. Frag ihn, was du heute aufmachst, warum ein Wein so schmeckt oder was zum Essen passt.</p></div>
      ${ctx ? `<div class="softchip" style="background:var(--berry-soft);color:var(--berry);font-weight:600">Zu: ${esc(ctx.name)} ${ctx.vintage}</div>` : ''}
      <div class="stack" style="gap:8px;width:100%">${qs.map((q) => `<div class="card" style="text-align:left;font-size:14px;color:#4A3F48">„${esc(q)}“</div>`).join('')}</div>
      <div class="small muted" style="margin-top:4px">Die Anbindung an Claude kommt im nächsten Schritt.</div>
    </div>`;
  }

  // ---------- Weinkarte ----------
  function vWine(id) {
    const w = wine(id); if (!w) return vKeller();
    const r = REGIONS[w.region], st = status(w), y = NOW_YEAR();
    const lo = Math.min(w.from || y, y) - 2, hi = Math.max(w.to || y, y) + 2, span = hi - lo;
    const pct = (v) => ((v - lo) / span) * 100;
    const ts = S.tastings.filter((t) => t.wineId === id && t.probes.length);
    const others = S.wines.filter((o) => o.region === w.region && o.id !== w.id && o.bottles > 0);
    const ot = openTastingOf(w.id);
    return `<div style="position:relative">
      <button class="iconbtn back" data-act="back" aria-label="Zurück">${I.back}</button>
      <div class="hero">${regionImg(w.region)}<div class="shade"></div></div>
      <div class="idrow">${bigLabel(w, 88, 116)}
        <div style="padding-bottom:4px;min-width:0"><h1 class="disp" style="font-weight:800;font-size:28px;line-height:1.02">${esc(w.name)} ${w.vintage}</h1>
        <div class="small" style="color:#4A3F48;margin-top:3px">${esc(w.producer)}</div></div></div>
      <div class="screen stack" style="padding-top:16px">
        <div class="facts">
          <div class="fact ${st.k === 'ok' || st.k === 'open' ? 'ok' : st.k === 'late' ? 'dec' : 'wait'}"><span>Status</span><b>${st.t}</b></div>
          <div class="fact ${w.decant >= 30 ? 'dec' : ''}"><span>Dekantieren</span><b>${w.decant >= 30 ? w.decant + ' Min' : w.decant > 0 ? 'kurz' : 'nein'}</b></div>
          <div class="fact"><span>Temperatur</span><b>${esc(w.temp || '–')} °C</b></div>
        </div>
        ${w.from ? `<div class="card"><div class="flex-sb"><b style="font-size:14px">Trinkfenster ${w.from}–${w.to}</b><span class="small muted">${w.est ? 'geschätzt' : 'laut Lobenberg'}</span></div>
          <div class="window"><i style="left:${pct(w.from)}%;width:${pct(w.to) - pct(w.from)}%"></i><em style="left:calc(${pct(y)}% - 1px)"></em></div>
          <div class="flex-sb small muted"><span>${lo}</span><span>heute</span><span>${hi}</span></div></div>` : ''}
        <div class="card"><div class="small muted">Rebsorten</div><div style="font-weight:600;margin-top:2px">${esc(w.grapes || '–')}</div>
          ${w.glass ? `<div class="small muted" style="margin-top:8px">Glas: ${esc(w.glass)}</div>` : ''}</div>
        ${w.pairing && w.pairing.length ? `<div><div style="font-weight:600;font-size:13px;margin-bottom:8px">Passt zu</div><div class="wrapchips">${w.pairing.map((p) => `<span class="softchip">${esc(p)}</span>`).join('')}</div></div>` : ''}
        ${w.style && w.style.length ? `<div><div style="font-weight:600;font-size:13px;margin-bottom:8px">Stil laut Lobenberg</div><div class="wrapchips">${w.style.map((p) => `<span class="softchip">${esc(p)}</span>`).join('')}</div></div>` : ''}
        ${r ? `<div class="card"><div class="flex-sb"><b style="font-size:14px">Herkunft · ${esc(r.name)}</b><button class="link" style="padding:0;color:var(--berry);text-decoration:none;font-weight:600" data-act="region" data-id="${w.region}">Region ansehen</button></div>
          <div class="small" style="color:#4A3F48;margin-top:6px;line-height:1.45">${esc(r.country)}, ${esc(r.area)}. ${esc(r.text)}</div>
          ${others.length ? `<div class="small muted" style="margin-top:6px">Auch von dort in deinem Keller: ${others.map((o) => esc(o.name + ' ' + o.vintage)).join(', ')}</div>` : ''}</div>` : ''}
        <div class="card"><div class="flex-sb"><b style="font-size:14px">Deine Proben</b><span class="small muted">${ts.length ? ts.length + (ts.length === 1 ? ' Flasche' : ' Flaschen') : 'noch nicht verkostet'}</span></div>
          ${ts.map((t) => { const best = Math.max(...t.probes.map((p) => p.rating || 0)); return `<button class="wrow" style="padding:8px 0;background:none" data-act="tasting" data-id="${t.id}"><div class="t"><div class="n" style="font-size:14px">${clock(t.openedAt)}</div><div class="m">${t.probes.length} ${t.probes.length === 1 ? 'Probe' : 'Proben'}${t.done ? '' : ' · noch offen'}</div></div><span class="yr">${best ? best + '/5' : '–'}</span></button>`; }).join('')}</div>
        <div class="card flex-sb" style="align-items:center"><div><b style="font-size:14px">Im Keller</b><div class="small muted">${w.price ? w.price.toFixed(2).replace('.', ',') + ' € pro Flasche' : ''}</div></div>
          <div class="stepper"><button data-act="bottles" data-id="${w.id}" data-d="-1" aria-label="Eine Flasche weniger">−</button><b>${w.bottles}</b><button data-act="bottles" data-id="${w.id}" data-d="1" aria-label="Eine Flasche mehr">+</button></div></div>
        ${w.url ? `<a class="small muted" style="text-align:center" href="${esc(w.url)}" target="_blank" rel="noopener">Bei Lobenberg ansehen</a>` : ''}
        ${ot ? `<button class="big" data-act="tasting" data-id="${ot.id}">Zur offenen Flasche</button>` : w.bottles > 0 ? `<button class="big" data-act="open" data-id="${w.id}">Flasche öffnen</button>` : ''}
      </div></div>`;
  }

  // ---------- Offen ----------
  function vOffen() {
    const open = S.tastings.filter((t) => !t.done).sort((a, b) => b.openedAt - a.openedAt);
    const done = S.tastings.filter((t) => t.done).sort((a, b) => b.openedAt - a.openedAt).slice(0, 8);
    let html = `<div class="screen"><div class="top"><div><div class="kicker">Was gerade offen ist</div><h1 class="h1">Offen</h1></div></div>`;
    if (!open.length) html += `<div class="emptyart">${imgTag(ASSETS.emptyGlass)}<b>Gerade ist nichts offen</b><span>Im Keller ein Etikett antippen und „Öffnen“ wählen.</span></div>`;
    html += `<div class="list">` + open.map((t) => {
      const w = wine(t.wineId); if (!w) return '';
      const last = t.probes[t.probes.length - 1];
      return `<div class="exp" style="gap:10px"><button class="head" style="border:0;background:none;padding:0;text-align:left" data-act="tasting" data-id="${t.id}">${bigLabel(w, 52, 68)}
        <div style="flex:1;min-width:0"><div class="disp" style="font-weight:700;font-size:18px;line-height:1.1">${esc(w.name)} ${w.vintage}</div>
        <div class="small muted">offen seit <span data-since="${t.openedAt}">${fmtDur(Date.now() - t.openedAt)}</span></div>
        <div class="small muted">${t.probes.length} ${t.probes.length === 1 ? 'Probe' : 'Proben'}${last && last.rating ? ` · zuletzt ${last.rating}/5` : ''}</div></div></button>
        <div class="btns"><button class="btn" data-act="tasting" data-id="${t.id}">Verlauf</button><button class="btn fill" data-act="probe" data-id="${t.id}">Neue Probe</button></div></div>`;
    }).join('') + `</div>`;
    if (done.length) {
      html += `<div class="sec"><b>Zuletzt geleert</b></div><div class="list">` + done.map((t) => {
        const w = wine(t.wineId); if (!w) return '';
        const best = Math.max(0, ...t.probes.map((p) => p.rating || 0));
        return `<button class="wrow" data-act="tasting" data-id="${t.id}">${bigLabel(w, 38, 50)}<div class="t"><div class="n">${esc(w.name)} ${w.vintage}</div><div class="m">${clock(t.openedAt)} · ${t.probes.length} ${t.probes.length === 1 ? 'Probe' : 'Proben'}</div></div><span class="yr">${best ? best + '/5' : '–'}</span></button>`;
      }).join('') + `</div>`;
    }
    return html + `</div>`;
  }

  // ---------- Verlauf einer Flasche ----------
  function vTasting(id) {
    const t = tasting(id); if (!t) return vOffen();
    const w = wine(t.wineId);
    const best = Math.max(0, ...t.probes.map((p) => p.rating || 0));
    const shades = ['#B9B0B6', '#D9779C', '#C2577E', '#8C1D47'];
    const items = t.probes.map((p, i) => {
      const col = shades[Math.min(i, shades.length - 1)];
      const tags = [...(p.nose || []).map((a) => (aroma(a) || {}).label).filter(Boolean), ...(p.custom || [])];
      return `<div class="tli"><div class="rail"><i style="background:${col}"></i><b></b></div><div class="body">
        <div class="flex-sb"><b style="font-size:15px">${esc(whenLabel(t, p.at))}</b><span class="small muted">${clock(p.at)}</span></div>
        <div class="row"><div class="bar"><i style="width:${(p.rating || 0) * 20}%;background:${col}"></i></div><span class="yr" style="width:34px;text-align:right">${p.rating || '–'}</span></div>
        ${tags.length ? `<div class="wrapchips" style="gap:6px">${tags.map((x) => `<span class="minichip">${esc(x)}</span>`).join('')}</div>` : ''}
        ${p.note ? `<div class="small" style="color:#4A3F48">${esc(p.note)}</div>` : ''}
        ${best && p.rating === best && t.probes.length > 1 ? `<div class="best">Bisher am besten</div>` : ''}
      </div></div>`;
    }).join('');
    return `<div class="screen stack">
      <div class="row" style="gap:12px"><button class="iconbtn" data-act="back" aria-label="Zurück">${I.back}</button>
        <div class="small muted">${t.done ? 'geleert · geöffnet ' + clock(t.openedAt) : `offen seit <span data-since="${t.openedAt}">${fmtDur(Date.now() - t.openedAt)}</span>`}</div></div>
      <div><h1 class="disp" style="font-weight:800;font-size:28px;line-height:1.05">${esc(w ? w.name + ' ' + w.vintage : 'Wein')}</h1>
        <div class="small muted" style="margin-top:2px">${esc(w ? w.producer : '')} · ${t.probes.length} ${t.probes.length === 1 ? 'Probe' : 'Proben'}</div></div>
      <div class="tl">${items}${t.done ? '' : `<div class="tli"><div class="rail"><i style="border:2px dashed #B9B0B6;box-sizing:border-box"></i></div><div class="body small muted" style="padding-top:2px">Nächste Probe – wann du willst</div></div>`}</div>
      ${t.done ? '' : `<button class="big" data-act="probe" data-id="${t.id}">${I.plus} Neue Probe</button>`}
      <div class="row" style="justify-content:center;gap:4px;flex-wrap:wrap">
        ${t.probes.length && w ? `<button class="link" data-act="cmp" data-id="${t.id}">${ui.showCmp[t.id] ? 'Vergleich ausblenden' : 'Mit Kritikern vergleichen'}</button>` : ''}
        ${w ? `<button class="link" data-act="wine" data-id="${w.id}">Weinkarte</button>` : ''}
        ${t.done ? `<button class="link" data-act="reopen" data-id="${t.id}">Doch noch offen</button>` : `<button class="link" data-act="empty" data-id="${t.id}">${ui.confirmEmpty === t.id ? 'Wirklich leer? Nochmal tippen' : 'Flasche leer'}</button>`}
      </div>
      ${ui.showCmp[t.id] && w ? compareCard(t, w) : ''}
    </div>`;
  }
  function compareCard(t, w) {
    const mine = new Set(); t.probes.forEach((p) => (p.nose || []).forEach((a) => mine.add(a)));
    const ids = (w.critic && w.critic.ids) || [];
    const hitOf = (cid) => (cid.startsWith('cat:') ? [...mine].some((a) => (aroma(a) || {}).cat === cid.slice(4)) : mine.has(cid));
    const myHit = (a) => ids.some((cid) => (cid.startsWith('cat:') ? (aroma(a) || {}).cat === cid.slice(4) : cid === a));
    const hits = ids.filter(hitOf).length;
    const lab = (cid) => (cid.startsWith('cat:') ? AROMA_CATS[cid.slice(4)] : (aroma(cid) || {}).label);
    if (!ids.length) return `<div class="card"><h3>Du vs. Kritiker</h3><div class="small muted">Zu diesem Wein gibt es keine konkreten Aromen in der Beschreibung – nur: ${esc((w.critic && w.critic.words || []).join(', ') || '–')}.</div></div>`;
    return `<div class="card"><div class="flex-sb"><h3>Du vs. Kritiker</h3><span class="disp" style="font-weight:800;font-size:22px;color:var(--berry)">${hits}/${ids.length}</span></div>
      <div class="cmp"><div class="c"><div class="h">Du</div>${[...mine].map((a) => `<div class="x ${myHit(a) ? 'hit' : ''}">${esc((aroma(a) || {}).label)}</div>`).join('') || '<div class="small muted">noch keine Aromen</div>'}</div>
      <div class="c"><div class="h">Kritiker</div>${ids.map((cid) => `<div class="x ${hitOf(cid) ? 'hit' : ''}">${esc(lab(cid))}</div>`).join('')}</div></div>
      <div class="small muted" style="margin-top:10px">Originalbeschreibung (${esc(w.critic.src)}): ${esc(w.critic.words.join(', '))}</div></div>`;
  }

  // ---------- Probe ----------
  const WORDS = {
    saeure: ['mild', 'eher mild', 'mittel', 'frisch', 'sehr frisch'],
    tannin: ['kaum', 'samtig', 'mittel', 'griffig', 'kräftig'],
    koerper: ['leicht', 'eher leicht', 'mittel', 'voll', 'sehr voll'],
    abgang: ['kurz', 'eher kurz', 'mittel', 'lang', 'sehr lang']
  };
  const PAL = [['saeure', 'Säure'], ['tannin', 'Tannin'], ['koerper', 'Körper'], ['abgang', 'Abgang']];
  function vProbe(id) {
    const t = tasting(id); if (!t) return vOffen();
    const w = wine(t.wineId);
    if (!ui.draft || ui.draft.tid !== id) {
      const last = t.probes[t.probes.length - 1];
      ui.draft = { tid: id, nose: [], custom: [], palate: last ? { ...last.palate } : { saeure: 3, tannin: w && w.color !== 'rot' ? 1 : 3, koerper: 3, abgang: 3 }, rating: 0, note: '', adding: false };
    }
    const d = ui.draft, n = t.probes.length + 1;
    return `<div class="screen stack">
      <div class="row" style="gap:12px"><button class="iconbtn" data-act="back" aria-label="Abbrechen">${I.back}</button>
        <div style="min-width:0"><div class="disp" style="font-weight:700;font-size:18px;line-height:1.15">${esc(w ? w.name + ' ' + w.vintage : '')}</div><div class="small muted">${esc(w ? w.producer : '')}</div></div></div>
      <div class="timer"><div><small>offen seit ${clock(t.openedAt)}</small><b data-since="${t.openedAt}">${fmtDur(Date.now() - t.openedAt)}</b></div><small style="text-align:right">Probe ${n}</small></div>
      ${t.probes.length ? `<div class="prevs">${t.probes.map((p, i) => `<div class="prev"><span>Probe ${i + 1} · ${esc(whenLabel(t, p.at))}</span>${p.rating ? p.rating + '/5' : '–'}${(p.nose || []).length ? ' · ' + esc((aroma(p.nose[0]) || {}).label || '') : ''}</div>`).join('')}<div class="prev now"><span>Probe ${n} · jetzt</span>wird notiert …</div></div>` : ''}
      <div><h2 style="font-size:17px;margin-bottom:10px">Nase</h2>
        <div class="aromas">${AROMAS.map((a) => `<button class="aroma ${d.nose.includes(a.id) ? 'on' : ''}" data-act="aroma" data-id="${a.id}" aria-pressed="${d.nose.includes(a.id)}">${aromaIcon(a)}<span>${esc(a.label)}</span></button>`).join('')}</div>
        <div class="wrapchips" style="margin-top:10px">${d.custom.map((c, i) => `<button class="chip on" data-act="rmcustom" data-i="${i}">${esc(c)} ×</button>`).join('')}
          ${d.adding ? `<input id="customIn" class="chip" style="background:#fff;width:150px;outline:0;border:1.5px solid var(--berry)" placeholder="z. B. Lakritz" enterkeyhint="done">` : `<button class="chip" data-act="addcustom">+ eigenes</button>`}</div></div>
      <div class="card stack" style="gap:14px"><h2 style="font-size:17px;margin:0">Gaumen</h2>
        ${PAL.map(([k, l]) => `<div class="slider"><label for="s-${k}">${l}</label><input id="s-${k}" type="range" min="1" max="5" step="1" value="${d.palate[k]}" data-pal="${k}"><em id="w-${k}">${WORDS[k][d.palate[k] - 1]}</em></div>`).join('')}</div>
      <div class="flex-sb" style="align-items:center"><h2 style="font-size:17px">Gefällt mir</h2>
        <div class="stars">${[1, 2, 3, 4, 5].map((s) => `<button class="${d.rating === s ? 'on' : ''}" data-act="rate" data-v="${s}" aria-label="${s} von 5">${s}</button>`).join('')}</div></div>
      <textarea class="note" id="note" placeholder="Notiz (optional) – z. B. „öffnet sich, Holz tritt zurück“">${esc(d.note)}</textarea>
      <button class="big dark" data-act="saveprobe">Probe ${n} speichern</button>
    </div>`;
  }

  // ---------- Regionen ----------
  function vRegionen() {
    const used = {};
    S.wines.forEach((w) => { if (!w.region) return; used[w.region] = used[w.region] || { bottles: 0, wines: 0, tasted: false }; used[w.region].bottles += w.bottles || 0; used[w.region].wines++; });
    S.tastings.forEach((t) => { const w = wine(t.wineId); if (w && used[w.region] && t.probes.length) used[w.region].tasted = true; });
    const ids = Object.keys(used).sort((a, b) => used[b].bottles - used[a].bottles || REGIONS[a].name.localeCompare(REGIONS[b].name));
    const stamped = ids.filter((i) => used[i].tasted).length;
    return `<div class="screen"><div class="top"><div><div class="kicker">Postkarten-Sammlung · ${stamped}/${ids.length} gestempelt</div><h1 class="h1">Deine Regionen</h1></div></div>
      <p class="small" style="color:#4A3F48;margin:-4px 0 14px">Jede Region eine Karte. Verkostest du einen Wein von dort, bekommt sie einen Stempel.</p>
      <div class="pcgrid">${ids.map((id) => { const r = REGIONS[id], u = used[id]; return `<button class="pc ${u.bottles ? '' : 'dim'}" data-act="region" data-id="${id}">
        <div class="im">${regionImg(id)}${u.tasted ? `<div class="stamp">${I.check}</div>` : ''}${learnedRegions().has(id) ? '<span class="learned">gelernt</span>' : ''}</div>
        <div class="nm"><b>${esc(r.name)}</b><span class="small muted">${esc(r.country)} · ${u.bottles} ${u.bottles === 1 ? 'Flasche' : 'Flaschen'}</span></div></button>`; }).join('')}</div></div>`;
  }
  function sheetRegion(id) {
    const r = REGIONS[id]; if (!r) return '';
    const ws = S.wines.filter((w) => w.region === id);
    return `<div class="sheet-bg" data-act="closesheet"><div class="sheet" data-stop="1">
      <div class="strip" style="height:170px;margin:-4px 0 14px">${regionImg(id)}</div>
      <h2 style="font-size:24px">${esc(r.name)}</h2><div class="small muted">${esc(r.country)} · ${esc(r.area)}</div>
      <p style="line-height:1.5;color:#4A3F48">${esc(r.text)}</p>
      <div class="list">${ws.map((w) => `<button class="wrow" data-act="wine" data-id="${w.id}">${bigLabel(w, 38, 50)}<div class="t"><div class="n">${esc(w.name)}</div><div class="m">${esc(w.producer)} · ${w.bottles ? w.bottles + ' im Keller' : 'ausgetrunken'}</div></div><span class="yr">${w.vintage}</span></button>`).join('')}</div>
      <button class="big dark" style="margin-top:14px" data-act="closesheet">Schließen</button></div></div>`;
  }

  // ---------- Profil ----------
  function profileData() {
    const all = S.tastings.flatMap((t) => t.probes.map((p) => ({ ...p, w: wine(t.wineId) }))).filter((p) => p.w);
    const liked = all.filter((p) => (p.rating || 0) >= 4);
    const base = liked.length >= 2 ? liked : all;
    const avg = (k) => (base.length ? base.reduce((n, p) => n + (p.palate ? p.palate[k] : 3), 0) / base.length : 0);
    const nose = base.flatMap((p) => p.nose || []);
    const share = (cats) => (nose.length ? nose.filter((a) => cats.includes((aroma(a) || {}).cat)).length / nose.length : 0);
    const axes = [
      ['Frucht', 1 + 4 * share(['rot', 'dunkel', 'zitrus', 'obst'])], ['Säure', avg('saeure')], ['Tannin', avg('tannin')],
      ['Körper', avg('koerper')], ['Abgang', avg('abgang')], ['Würze', 1 + 4 * share(['wuerze', 'kraeuter', 'erde', 'mineral', 'holz'])]
    ];
    const groups = (keyFn) => {
      const m = {};
      S.tastings.forEach((t) => { const w = wine(t.wineId); if (!w || !t.probes.length) return; const k = keyFn(w); if (!k) return; const best = Math.max(...t.probes.map((p) => p.rating || 0)); (m[k] = m[k] || []).push(best); });
      return Object.entries(m).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length, v.length]).sort((a, b) => b[1] - a[1]).slice(0, 4);
    };
    const counts = {}; all.forEach((p) => (p.nose || []).forEach((a) => (counts[a] = (counts[a] || 0) + 1)));
    return { all, base, axes, grapes: groups((w) => (w.grapes || '').split(/[,(]|\s\d/)[0].trim()), regions: groups((w) => (REGIONS[w.region] || {}).name), top: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6) };
  }
  function radar(axes) {
    const cx = 120, cy = 112, R = 88, n = axes.length;
    const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; const r = (R * v) / 5; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const poly = (v) => axes.map((_, i) => pt(i, v).map((x) => x.toFixed(1)).join(',')).join(' ');
    const data = axes.map(([, v], i) => pt(i, Math.max(0.3, v)).map((x) => x.toFixed(1)).join(',')).join(' ');
    const labels = axes.map(([l], i) => { const [x, y] = pt(i, 5.9); return `<text x="${x.toFixed(0)}" y="${(y + 4).toFixed(0)}" text-anchor="middle" font-size="11" fill="#4A3F48" font-family="Inter">${l}</text>`; }).join('');
    return `<svg width="100%" viewBox="0 0 240 228" role="img" aria-label="Geschmacksprofil"><polygon points="${poly(5)}" fill="none" stroke="#ECE6EA"/><polygon points="${poly(2.5)}" fill="none" stroke="#ECE6EA"/><polygon points="${data}" fill="rgba(140,29,71,.16)" stroke="#8C1D47" stroke-width="2"/>${labels}</svg>`;
  }
  function sentence(axes) {
    const m = Object.fromEntries(axes);
    const parts = [];
    if (m['Säure'] >= 3.6) parts.push('frische Säure'); else if (m['Säure'] && m['Säure'] <= 2.4) parts.push('weiche, milde Weine');
    if (m['Tannin'] >= 3.6) parts.push('kräftiges Tannin'); else if (m['Tannin'] && m['Tannin'] <= 2.2) parts.push('feines, samtiges Tannin');
    if (m['Abgang'] >= 3.8) parts.push('lange Abgänge');
    if (m['Würze'] >= 3) parts.push('würzige Noten'); else if (m['Frucht'] >= 3) parts.push('viel Frucht');
    return parts.length ? 'Du magst ' + parts.slice(0, 3).join(', ').replace(/, ([^,]*)$/, ' und $1') + '.' : 'Noch zu wenig Proben für eine Aussage.';
  }
  function vProfil() {
    const P = profileData();
    const nT = S.tastings.filter((t) => t.probes.length).length;
    const favBlock = (title, arr) => arr.length ? `<div class="card favs"><b style="font-size:14px">${title}</b>${arr.map(([k, v, c]) => `<div class="f"><span>${esc(k)}</span><div class="bar"><i style="width:${v * 20}%;background:var(--berry)"></i></div><em>${v.toFixed(1).replace('.', ',')}</em></div>`).join('')}</div>` : '';
    return `<div class="screen stack">
      <div><div class="kicker">${nT} ${nT === 1 ? 'Flasche' : 'Flaschen'} verkostet · ${P.all.length} Proben</div><h1 class="h1">Dein Geschmack</h1></div>
      ${schoolCard()}
      ${P.all.length ? `<div class="card" style="text-align:center">${radar(P.axes)}<div class="small" style="color:#4A3F48;margin-top:4px">${esc(sentence(P.axes))}</div>
        <div class="small muted" style="margin-top:4px">${P.base.length === P.all.length ? 'aus allen Proben' : 'aus den Proben mit 4 oder 5 Punkten'}</div></div>`
        : `<div class="empty">Nach der ersten Verkostung wächst hier dein Profil – Netz, Lieblingsrebsorten, Lieblingsregionen.</div>`}
      ${favBlock('Lieblingsrebsorten', P.grapes)}${favBlock('Lieblingsregionen', P.regions)}
      ${P.top.length ? `<div class="card"><b style="font-size:14px">Was du am häufigsten riechst</b><div class="wrapchips" style="margin-top:8px">${P.top.map(([a, c]) => `<span class="softchip" style="background:var(--bg)">${esc((aroma(a) || {}).label)} · ${c}</span>`).join('')}</div></div>` : ''}
      <div class="card"><b style="font-size:14px">Daten</b><div class="small muted" style="margin:4px 0 10px">Alles liegt nur auf diesem Gerät. Ab und zu sichern.</div>
        <div class="btns"><button class="btn" data-act="export">Sichern</button><button class="btn" data-act="import">Einspielen</button></div></div>
    </div>`;
  }

  // ---------- Sheets ----------
  function sheetAdd() {
    const opts = Object.entries(REGIONS).map(([id, r]) => `<option value="${id}">${esc(r.name)} (${esc(r.country)})</option>`).join('');
    return `<div class="sheet-bg" data-act="closesheet"><div class="sheet" data-stop="1"><h2 style="font-size:22px;margin-bottom:12px">Flasche hinzufügen</h2>
      <div class="field"><label>Name</label><input id="f-name" placeholder="z. B. Château Laroque"></div>
      <div class="field"><label>Weingut</label><input id="f-prod"></div>
      <div class="row"><div class="field" style="flex:1"><label>Jahrgang</label><input id="f-year" inputmode="numeric" placeholder="2018"></div>
        <div class="field" style="flex:1"><label>Farbe</label><select id="f-col"><option value="rot">Rot</option><option value="weiss">Weiß</option><option value="rose">Rosé</option></select></div>
        <div class="field" style="width:80px"><label>Flaschen</label><input id="f-n" inputmode="numeric" value="1"></div></div>
      <div class="field"><label>Rebsorten</label><input id="f-grapes"></div>
      <div class="field"><label>Region</label><select id="f-reg"><option value="">– andere –</option>${opts}</select></div>
      <div class="row"><div class="field" style="flex:1"><label>Trinkreif ab</label><input id="f-from" inputmode="numeric"></div><div class="field" style="flex:1"><label>bis</label><input id="f-to" inputmode="numeric"></div></div>
      <button class="big" data-act="saveadd">Hinzufügen</button><button class="link" style="width:100%" data-act="closesheet">Abbrechen</button></div></div>`;
  }
  function sheetExport() {
    return `<div class="sheet-bg" data-act="closesheet"><div class="sheet" data-stop="1"><h2 style="font-size:22px;margin-bottom:8px">Daten sichern</h2>
      <p class="small muted">Kopieren und z. B. in Notizen ablegen. Mit „Einspielen“ kommt alles zurück.</p>
      <div class="field"><textarea id="exp" readonly>${esc(JSON.stringify(S))}</textarea></div>
      <button class="big" data-act="copyexp">Kopieren</button><button class="link" style="width:100%" data-act="closesheet">Schließen</button></div></div>`;
  }
  function sheetImport() {
    return `<div class="sheet-bg" data-act="closesheet"><div class="sheet" data-stop="1"><h2 style="font-size:22px;margin-bottom:8px">Daten einspielen</h2>
      <p class="small muted">Gesicherten Text einfügen. Ersetzt alles, was gerade in der App ist.</p>
      <div class="field"><textarea id="imp" placeholder="{&quot;v&quot;:1, …}"></textarea></div>
      <button class="big" data-act="doimport">Einspielen</button><button class="link" style="width:100%" data-act="closesheet">Abbrechen</button></div></div>`;
  }


  // ---------- Weinschule ----------
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const points = () => Object.keys(S.school.right).length * 10;
  function rankOf(p = points()) {
    let i = 0; RANKS.forEach((r, k) => { if (p >= r.min) i = k; });
    return { i, cur: RANKS[i], next: RANKS[i + 1] || null, p };
  }
  const lessonById = (lid) => { for (const c of SCHOOL) for (const l of c.lessons) if (l.id === lid) return { c, l }; return null; };
  const chapterDone = (c) => c.lessons.filter((l) => S.school.lessons[l.id]).length;
  function learnedRegions() {
    const set = new Set();
    SCHOOL.forEach((c) => c.lessons.forEach((l) => { if (S.school.lessons[l.id] && l.regions) l.regions.forEach((r) => set.add(r)); }));
    return set;
  }
  function rankBlock() {
    const R = rankOf();
    const span = R.next ? R.next.min - R.cur.min : 1, pct = R.next ? Math.round(((R.p - R.cur.min) / span) * 100) : 100;
    return `<div class="card rankcard"><div class="flex-sb"><div><div class="small muted">Dein Rang</div><div class="rankname">${esc(R.cur.name)}</div></div>
      <span class="small muted">${R.p}${R.next ? ' / ' + R.next.min : ''} Punkte</span></div>
      <div class="ladder"><span class="rail"></span><span class="rail on" style="width:${(R.i / (RANKS.length - 1)) * 75 + (R.next ? (pct / 100) * (75 / (RANKS.length - 1)) : 0)}%"></span>
      ${RANKS.map((r, k) => `<div class="${k < R.i ? 'past' : k === R.i ? 'now' : ''}"><i></i><span>${esc(r.name)}</span></div>`).join('')}</div></div>`;
  }
  function schoolCard() {
    const R = rankOf(), done = Object.keys(S.school.lessons).length, all = SCHOOL.reduce((n, c) => n + c.lessons.length, 0);
    return `<button class="schoolcard" data-act="schule"><span class="sc-ic">${dockIcon('keller')}</span>
      <span class="sc-t"><b>Weinschule</b><span>${esc(R.cur.name)} · ${R.p} Punkte · ${done}/${all} Lektionen</span></span>${I.back.replace('15,5 8,12 15,19', '9,5 16,12 9,19')}</button>`;
  }
  function vSchule() {
    const nowCh = SCHOOL.find((c) => chapterDone(c) < c.lessons.length);
    const lr = learnedRegions().size;
    const node = (st, col) => st === 'done' ? `<span class="nd done" style="background:${col}">${I.check}</span>` : st === 'now' ? `<span class="nd now" style="border-color:${col}"><i style="background:${col}"></i></span>` : '<span class="nd next"></span>';
    const path = SCHOOL.map((c, ci) => {
      const d = chapterDone(c), n = c.lessons.length, st = d === n ? 'done' : c === nowCh ? 'now' : 'next';
      const nextL = c.lessons.find((l) => !S.school.lessons[l.id]);
      const sub = c.id === 'regionen' && lr ? `${lr} Regionen gelernt` : c.sub;
      const open = ui.chOpen === c.id;
      const lessons = open ? `<div class="lessons">${c.lessons.map((l) => { const r = S.school.lessons[l.id]; return `<button class="lrow" data-act="quiz" data-id="${l.id}"><span>${esc(l.title)}</span><em>${r ? `${r.best}/${l.qs.length} ✓` : `${l.qs.length} Fragen`}</em></button>`; }).join('')}</div>` : '';
      const card = st === 'now' ? `<div class="chcard now" style="border-color:${c.color}"><button class="chhead" data-act="chap" data-id="${c.id}"><b>${esc(c.title)}</b><span>${d} / ${n}</span></button>
          <div class="bar"><i style="width:${(d / n) * 100}%;background:${c.color}"></i></div>
          <div class="flex-sb" style="align-items:center"><span class="small" style="color:#4A3F48">Weiter: ${esc(nextL.title)}</span><button class="minibtn" data-act="quiz" data-id="${nextL.id}">Weiter</button></div>${lessons}</div>`
        : `<div class="chcard ${st}"><button class="chhead" data-act="chap" data-id="${c.id}"><span class="cht"><b>${esc(c.title)}</b><span>${esc(sub)}</span></span><em style="color:${st === 'done' ? c.color : '#9A8F96'}">${d} / ${n}</em></button>${lessons}</div>`;
      return `<div class="chrow ${st}">${node(st, c.color)}${ci < SCHOOL.length - 1 ? `<span class="chline" style="background:${st === 'done' ? c.color : '#D9CFC9'}"></span>` : ''}${card}</div>`;
    }).join('');
    const kn = kellerPool().length;
    return `<div class="screen stack" style="gap:12px">
      <button class="backlink" data-act="back">${I.back}Profil</button>
      <h1 class="h1" style="font-size:30px">Weinschule</h1>
      ${rankBlock()}
      ${kn >= 4 ? `<button class="kround" data-act="quiz" data-id="keller"><span class="sc-ic">${dockIcon('keller')}</span><span class="sc-t"><b>Keller-Runde</b><span>${Math.min(8, kn)} Fragen zu deinen eigenen Flaschen</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg></button>` : ''}
      <div class="kicker caps">Dein Lernpfad</div>
      <div class="path">${path}</div>
      <p class="small muted" style="margin:4px 2px 0">Jede richtige Antwort zählt einmal 10 Punkte. Kapitel antippen zeigt alle Lektionen.</p>
    </div>`;
  }

  // Keller-Runde: Fragen aus deinen eigenen Flaschen
  const FALLBACK_GRAPES = { rot: ['Tempranillo', 'Pinot Noir', 'Syrah', 'Merlot', 'Garnacha', 'Malbec', 'Cabernet Sauvignon', 'Mencía', 'Nebbiolo', 'Sangiovese'], weiss: ['Riesling', 'Chardonnay', 'Sauvignon Blanc', 'Godello', 'Albariño', 'Grüner Veltliner', 'Chenin Blanc', 'Palomino Fino'] };
  const mainGrape = (w) => ((w.grapes || '').split(/[,(]/)[0] || '').replace(/\d+\s*%/, '').trim();
  function kellerPool() {
    const ws = S.wines.filter((w) => w.bottles > 0 || openTastingOf(w.id));
    const pool = [];
    ws.forEach((w) => {
      const r = REGIONS[w.region], nm = `${w.name} ${w.vintage}`;
      const g = mainGrape(w);
      if (g) {
        const col = w.color === 'weiss' ? 'weiss' : 'rot';
        const others = [...new Set([...S.wines.filter((o) => (o.color === 'weiss' ? 'weiss' : 'rot') === col).map(mainGrape), ...shuffle(FALLBACK_GRAPES[col])])]
          .filter((x) => x && x !== g && !(w.grapes || '').includes(x));
        if (others.length >= 3) pool.push({ t: 'mc', wine: w.id, qid: `k-grape-${w.id}`, q: `Welche Rebsorte prägt deinen ${w.name}?`, a: [g, ...shuffle(others).slice(0, 3)], x: `${w.grapes}.` });
      }
      if (r) {
        const others = shuffle(Object.keys(REGIONS).filter((k) => k !== w.region)).slice(0, 3).map((k) => REGIONS[k].name);
        pool.push({ t: 'mc', wine: w.id, qid: `k-region-${w.id}`, q: `Woher kommt dein ${nm}?`, a: [r.name, ...others], x: `${r.name}, ${r.country}. ${(r.text || '').split(/(?<=\.)\s/)[0]}` });
      }
      if (w.color === 'rot' && typeof w.decant === 'number') {
        const opts = ['Gar nicht – kurz schwenken reicht', '30–45 Minuten', 'Etwa eine Stunde', '90 Minuten oder länger'];
        const k = w.decant < 30 ? 0 : w.decant <= 45 ? 1 : w.decant <= 75 ? 2 : 3;
        pool.push({ t: 'mc', wine: w.id, qid: `k-decant-${w.id}`, q: `Wie lange dekantierst du den ${w.name}?`, a: [opts[k], ...opts.filter((_, i) => i !== k)], x: `Laut Weinkarte: ${decantTxt(w) || 'kein Dekantieren nötig'}.` });
      }
      const m = String(w.temp || '').match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
      if (m) { const lo = +m[1], hi = +(m[2] || m[1]); pool.push({ t: 'temp', wine: w.id, qid: `k-temp-${w.id}`, q: `Bei wie viel Grad servierst du deinen ${w.name}?`, ok: [lo - 1, hi + 1], show: [lo, hi], x: `Laut Weinkarte ${w.temp} °C – ein Grad drüber oder drunter zählt auch.` }); }
    });
    return pool;
  }
  function kellerRound() {
    const per = {}, out = [];
    for (const q of shuffle(kellerPool())) { if ((per[q.wine] || 0) >= 2) continue; per[q.wine] = (per[q.wine] || 0) + 1; out.push(q); if (out.length === 8) break; }
    return out;
  }
  function prep(q, qid) {
    const base = { ...q, qid: q.qid || qid };
    if (q.t === 'mc') return { ...base, opts: shuffle(q.a), correct: q.a[0] };
    if (q.t === 'pair') return { ...base, left: q.pairs.map((p) => p[0]), right: shuffle(q.pairs.map((p) => p[1])), map: Object.fromEntries(q.pairs) };
    return base;
  }
  function startQuiz(id) {
    let qs, title;
    if (id === 'keller') { qs = kellerRound(); title = 'Keller-Runde'; }
    else { const f = lessonById(id); if (!f) return; qs = f.l.qs.map((q, i) => prep(q, `${f.l.id}-${i}`)); title = f.l.title; }
    qs = qs.map((q) => (q.opts || q.left ? q : prep(q, q.qid)));
    ui.quiz = { id, title, qs, i: 0, ans: null, right: 0, gained: 0, pair: { sel: null, done: {}, miss: 0, wrong: null }, temp: 14 };
    const c = current();
    if (c && c.v === 'quiz') { render(); } else push('quiz', id);
  }
  function award(ok, qid) {
    const Q = ui.quiz;
    if (ok) { Q.right++; if (!S.school.right[qid]) { S.school.right[qid] = 1; Q.gained += 10; save(); } }
  }
  function quizPick(k) {
    const Q = ui.quiz, q = Q.qs[Q.i]; if (Q.ans) return;
    const ok = q.opts[k] === q.correct; Q.ans = { ok, pick: k }; award(ok, q.qid); render();
  }
  function quizPair(side, k) {
    const Q = ui.quiz, q = Q.qs[Q.i], P = Q.pair; if (Q.ans) return;
    P.wrong = null;
    if (side === 'l') { if (P.done[q.left[k]]) return; P.sel = k; render(); return; }
    if (P.sel === null) return;
    const L = q.left[P.sel], R = q.right[k];
    if (Object.values(P.done).includes(R)) return;
    if (q.map[L] === R) { P.done[L] = R; P.sel = null; } else { P.miss++; P.wrong = { l: P.sel, r: k }; P.sel = null; }
    if (Object.keys(P.done).length === q.left.length) { const ok = P.miss === 0; Q.ans = { ok, miss: P.miss }; award(ok, q.qid); }
    render();
  }
  function quizTemp() {
    const Q = ui.quiz, q = Q.qs[Q.i]; if (Q.ans) return;
    const ok = Q.temp >= q.ok[0] && Q.temp <= q.ok[1]; Q.ans = { ok, v: Q.temp }; award(ok, q.qid); render();
  }
  function quizNext() {
    const Q = ui.quiz; Q.i++; Q.ans = null; Q.pair = { sel: null, done: {}, miss: 0, wrong: null }; Q.temp = 14;
    if (Q.i >= Q.qs.length && Q.id !== 'keller') {
      const prev = S.school.lessons[Q.id]; S.school.lessons[Q.id] = { best: Math.max(Q.right, prev ? prev.best : 0), at: Date.now() }; save();
    }
    render();
  }
  function vQuiz() {
    const Q = ui.quiz; if (!Q) return vSchule();
    const n = Q.qs.length;
    if (Q.i >= n) {
      const R = rankOf();
      return `<div class="screen stack quiz" style="gap:16px">
        <div class="row"><button class="xbtn" data-act="qclose" aria-label="Schließen"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
        <div class="kicker caps berry">${esc(Q.title)}</div>
        <div class="result"><b>${Q.right} / ${n}</b><span>richtig</span></div>
        <div class="card" style="text-align:center"><b style="font-size:18px;color:${Q.gained ? 'var(--ok)' : 'var(--muted)'}">${Q.gained ? `+${Q.gained} Punkte` : 'Keine neuen Punkte'}</b>
          <div class="small muted" style="margin-top:4px">${Q.gained ? '' : 'Punkte gibt es pro Frage nur beim ersten Mal. '}${R.next ? `Noch ${R.next.min - R.p} bis ${esc(R.next.name)}.` : 'Höchster Rang erreicht.'}</div></div>
        ${rankBlock()}
        <div class="btns"><button class="btn" data-act="qagain">Nochmal</button><button class="btn fill" data-act="qclose">Fertig</button></div></div>`;
    }
    const q = Q.qs[Q.i], A = Q.ans, w = q.wine ? wine(q.wine) : null;
    const segs = Q.qs.map((_, k) => `<span class="${k < Q.i || (k === Q.i && A) ? 'on' : ''}"></span>`).join('');
    let body = '';
    if (q.t === 'mc') {
      body = `<div class="opts">${q.opts.map((o, k) => { const cls = !A ? '' : o === q.correct ? 'right' : k === A.pick ? 'wrong' : 'dim'; return `<button class="opt ${cls}" data-act="qpick" data-i="${k}">${esc(o)}${A && o === q.correct ? I.check : ''}</button>`; }).join('')}</div>`;
    } else if (q.t === 'pair') {
      const P = Q.pair, idx = (L) => q.left.indexOf(L);
      const doneR = Object.fromEntries(Object.entries(P.done).map(([l, r]) => [r, idx(l)]));
      body = `<p class="small muted" style="margin:-6px 0 0">Links antippen, dann das Passende rechts.</p><div class="pairs"><div>${q.left.map((L, k) => `<button class="opt pl ${P.done[L] ? 'matched m' + k : P.sel === k ? 'sel' : P.wrong && P.wrong.l === k ? 'wrong' : ''}" data-act="qpl" data-i="${k}">${esc(L)}</button>`).join('')}</div>
        <div>${q.right.map((R, k) => `<button class="opt pr ${R in doneR ? 'matched m' + doneR[R] : P.wrong && P.wrong.r === k ? 'wrong' : ''}" data-act="qpr" data-i="${k}">${esc(R)}</button>`).join('')}</div></div>`;
    } else if (q.t === 'temp') {
      const lo = 4, hi = 22, pos = (v) => ((v - lo) / (hi - lo)) * 100;
      body = `<div class="card tempq"><div id="tempVal" class="tempval">${A ? A.v : Q.temp} °C</div>
        <div class="trk">${A ? `<span class="okband" style="left:${pos(q.ok[0])}%;width:${pos(q.ok[1]) - pos(q.ok[0])}%"></span>` : ''}<input id="tempIn" type="range" min="${lo}" max="${hi}" step="1" value="${A ? A.v : Q.temp}" ${A ? 'disabled' : ''} aria-label="Temperatur"></div>
        <div class="flex-sb small muted"><span>4 °C · eiskalt</span><span>22 °C · Zimmer</span></div></div>
        ${A ? '' : '<button class="big" data-act="qtemp">Prüfen</button>'}`;
    }
    const fbTitle = A ? (A.ok ? ['Genau!', 'Richtig!', 'Sitzt.'][Q.i % 3] : q.t === 'pair' ? `Fast – ${A.miss} ${A.miss === 1 ? 'Fehlgriff' : 'Fehlgriffe'}` : q.t === 'temp' ? `Richtig wären ${(q.show || q.ok)[0]}–${(q.show || q.ok)[1]} °C` : 'Nicht ganz') : '';
    return `<div class="screen stack quiz ${A ? 'answered' : ''}" style="gap:18px">
      <div class="row" style="gap:14px"><button class="xbtn" data-act="qclose" aria-label="Schließen"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="segs">${segs}</div><span class="small muted" style="font-weight:600">${Q.i + 1} / ${n}</span></div>
      <div class="kicker caps berry">${esc(Q.title)}</div>
      ${w ? `<div class="row" style="gap:16px;align-items:center">${bigLabel(w, 92, 120)}<h2 class="qq">${esc(q.q)}</h2></div>` : `<h2 class="qq">${esc(q.q)}</h2>`}
      ${body}
      ${A ? `<div class="qfb ${A.ok ? 'ok' : 'no'}"><div class="flex-sb"><b>${esc(fbTitle)}</b>${Q.gained && A.ok && S.school.right[q.qid] ? '' : ''}</div><p>${esc(q.x || '')}</p>
        <button class="big ${A.ok ? 'okbtn' : 'dark'}" data-act="qnext">${Q.i + 1 < n ? 'Weiter' : 'Auswertung'}</button></div>` : ''}
    </div>`;
  }

  // Mini-Lektion nach einer Probe
  function pickMini(t) {
    const p = t.probes[t.probes.length - 1], w = wine(t.wineId);
    const m = MINIS.find((x) => !S.school.right['m-' + x.id] && x.when(p.palate || {}, t.probes.length, w));
    if (!m) return null;
    return { id: m.id, tid: t.id, at: p.at, opts: shuffle(m.q.a), correct: m.q.a[0], ans: null };
  }
  function miniPick(k) {
    const M = ui.mini; if (!M || M.ans !== null) return;
    M.ans = k; const ok = M.opts[k] === M.correct;
    if (ok && !S.school.right['m-' + M.id]) { S.school.right['m-' + M.id] = 1; M.gained = 10; save(); }
    ui._keepScroll = true; render();
  }
  function vMini(tid) {
    const M = ui.mini, t = tasting(tid); if (!M || !t) { ui.stack.pop(); return vTasting(tid); }
    const m = MINIS.find((x) => x.id === M.id), w = wine(t.wineId), p = t.probes[t.probes.length - 1];
    const v = m.dim && p.palate ? p.palate[m.dim] : null;
    const ok = M.ans !== null && M.opts[M.ans] === M.correct;
    return `<div class="screen stack mini" style="gap:16px">
      <div class="savedbar"><span class="ok">${I.check}</span><div><b>Probe gespeichert</b><div class="small muted">${esc(w ? w.name + ' ' + w.vintage : '')} · ${esc(whenLabel(t, p.at))}</div></div></div>
      <div class="kicker caps" style="color:#5E8A4C">Kurz gelernt · ${esc(m.kicker)}</div>
      <h1 class="mt">${esc(m.title)}</h1>
      ${v ? `<div class="card stack" style="gap:8px"><div class="flex-sb small"><span class="muted">Deine Angabe: ${esc((PAL.find((x) => x[0] === m.dim) || [])[1] || '')}</span><b style="color:var(--berry)">${esc(WORDS[m.dim][v - 1])}</b></div>
        <div class="gauge"><i style="left:${((v - 1) / 4) * 100}%"></i></div><div class="flex-sb" style="font-size:11px;color:#9A8F96"><span>${esc(WORDS[m.dim][0])}</span><span>${esc(WORDS[m.dim][4])}</span></div></div>` : ''}
      <p class="mtext">${esc(m.text)}</p>
      <b style="font-size:16px">${esc(m.q.q)}</b>
      <div class="opts">${M.opts.map((o, k) => { const cls = M.ans === null ? '' : o === M.correct ? 'right' : k === M.ans ? 'wrong' : 'dim'; return `<button class="opt sm ${cls}" data-act="mpick" data-i="${k}">${esc(o)}${M.ans !== null && o === M.correct ? I.check : ''}</button>`; }).join('')}</div>
      ${M.ans !== null ? `<div class="small" style="color:${ok ? 'var(--ok)' : 'var(--dec)'};font-weight:600">${ok ? (M.gained ? 'Richtig · +10 Punkte für die Weinschule' : 'Richtig') : 'Nicht ganz – richtig ist markiert. Beim nächsten Mal wieder.'}</div>` : ''}
      <div class="flex-sb" style="align-items:center;margin-top:4px"><span class="small muted">Zählt für die Weinschule</span><button class="btn ${M.ans !== null ? 'fill' : ''}" style="flex:0 0 auto;padding:0 22px" data-act="mdone">${M.ans !== null ? 'Fertig' : 'Später'}</button></div>
    </div>`;
  }

  // ---------- Render ----------
  function current() { return ui.stack[ui.stack.length - 1]; }
  function render() {
    const c = current();
    let body;
    if (c) body = { wine: vWine, tasting: vTasting, probe: vProbe, schule: vSchule, quiz: vQuiz, mini: vMini }[c.v](c.id);
    else body = { keller: vKeller, offen: vOffen, regionen: vRegionen, sommelier: vSommelier, profil: vProfil }[ui.tab]();
    let sheet = '';
    if (ui.sheet) sheet = ui.sheet.t === 'wine' ? sheetWine(ui.sheet.id) : ui.sheet.t === 'region' ? sheetRegion(ui.sheet.id) : ui.sheet.t === 'add' ? sheetAdd() : ui.sheet.t === 'export' ? sheetExport() : sheetImport();
    const keepScroll = ui._keepScroll; ui._keepScroll = false;
    const y = window.scrollY;
    $app.innerHTML = body + (c && ['probe', 'quiz', 'mini'].includes(c.v) ? '' : tabsHtml()) + sheet;
    if (keepScroll) window.scrollTo(0, y); else if (!ui.sheet) window.scrollTo(0, ui._scrollTo || 0);
    ui._scrollTo = 0;
    const ci = document.getElementById('customIn'); if (ci) ci.focus();
  }
  function push(v, id) { ui.stack.push({ v, id }); ui.sheet = null; render(); }
  function back() { ui.stack.pop(); ui.draft = null; render(); }

  // ---------- Aktionen ----------
  function openBottle(wid) {
    const w = wine(wid); if (!w || w.bottles < 1) return;
    w.bottles -= 1;
    const t = { id: uid(), wineId: wid, openedAt: Date.now(), probes: [], done: false };
    S.tastings.push(t); save();
    ui.stack = [{ v: 'tasting', id: t.id }, { v: 'probe', id: t.id }]; ui.tab = 'offen'; ui.draft = null; ui.sheet = null; render();
  }
  function saveProbe() {
    const d = ui.draft, t = d && tasting(d.tid); if (!t) return;
    const noteEl = document.getElementById('note'); if (noteEl) d.note = noteEl.value.trim();
    t.probes.push({ at: Date.now(), nose: d.nose.slice(), custom: d.custom.slice(), palate: { ...d.palate }, rating: d.rating, note: d.note });
    save(); ui.draft = null;
    ui.stack.pop(); if (!current() || current().v !== 'tasting') ui.stack.push({ v: 'tasting', id: t.id });
    const m = pickMini(t);
    if (m) { ui.mini = m; ui.stack.push({ v: 'mini', id: t.id }); render(); return; }
    render(); toast('Probe gespeichert');
  }

  $app.addEventListener('click', (e) => {
    const stop = e.target.closest('[data-stop]');
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (stop && el.dataset.act === 'closesheet' && el.classList.contains('sheet-bg')) return;
    const a = el.dataset.act, id = el.dataset.id;
    switch (a) {
      case 'tab': ui.tab = id; ui.stack = []; ui.draft = null; ui.sheet = null; ui.q = ''; ui.searchOpen = false; if (id !== 'sommelier') ui.sommelierWine = null; render(); break;
      case 'back': back(); break;
      case 'filter': ui.filter = id; ui.expanded = null; render(); break;
      case 'wsheet': ui.sheet = { t: 'wine', id }; ui._keepScroll = true; render(); break;
      case 'search': ui.searchOpen = !ui.searchOpen; if (!ui.searchOpen) ui.q = ''; ui._keepScroll = true; render(); { const q = document.getElementById('q'); if (q) q.focus(); } break;
      case 'askSommelier': ui.sommelierWine = id; ui.sheet = null; ui.stack = []; ui.tab = 'sommelier'; render(); break;
      case 'toggleEmpty': ui.showEmpty = !ui.showEmpty; ui._keepScroll = true; render(); break;
      case 'wine': ui.sheet = null; push('wine', id); break;
      case 'tasting': push('tasting', id); break;
      case 'probe': push('probe', id); break;
      case 'open': openBottle(id); break;
      case 'region': ui.sheet = { t: 'region', id }; ui._keepScroll = true; render(); break;
      case 'closesheet': ui.sheet = null; ui._keepScroll = true; render(); break;
      case 'add': ui.sheet = { t: 'add' }; ui._keepScroll = true; render(); break;
      case 'export': ui.sheet = { t: 'export' }; ui._keepScroll = true; render(); break;
      case 'import': ui.sheet = { t: 'import' }; ui._keepScroll = true; render(); break;
      case 'copyexp': { const ta = document.getElementById('exp'); try { navigator.clipboard.writeText(ta.value).then(() => toast('Kopiert'), () => { ta.select(); toast('Markiert – jetzt kopieren'); }); } catch (err) { ta.select(); } break; }
      case 'doimport': {
        const v = document.getElementById('imp').value;
        try { const s = JSON.parse(v); if (!s.wines || !s.tastings) throw 0; S = s; norm(); save(); ui.sheet = null; ui.stack = []; render(); toast('Eingespielt'); } catch (err) { toast('Das sieht nicht nach einer Sicherung aus'); }
        break;
      }
      case 'saveadd': {
        const g = (k) => (document.getElementById(k) || {}).value || '';
        const name = g('f-name').trim(); if (!name) { toast('Bitte einen Namen eingeben'); return; }
        S.wines.push({ id: 'own-' + uid(), name, producer: g('f-prod').trim(), vintage: parseInt(g('f-year'), 10) || '', color: g('f-col'), region: g('f-reg'), grapes: g('f-grapes').trim(),
          from: parseInt(g('f-from'), 10) || null, to: parseInt(g('f-to'), 10) || null, decant: 0, temp: '', pairing: [], style: [], critic: { src: '', words: [], ids: [] }, bottles: Math.max(1, parseInt(g('f-n'), 10) || 1), addedAt: Date.now() });
        save(); ui.sheet = null; render(); toast('Hinzugefügt');
        break;
      }
      case 'bottles': { const w = wine(id); w.bottles = Math.max(0, (w.bottles || 0) + parseInt(el.dataset.d, 10)); save(); ui._keepScroll = true; render(); break; }
      case 'aroma': { const d = ui.draft; d.nose = d.nose.includes(id) ? d.nose.filter((x) => x !== id) : [...d.nose, id]; el.classList.toggle('on'); el.setAttribute('aria-pressed', d.nose.includes(id)); break; }
      case 'addcustom': ui.draft.adding = true; ui.draft.note = (document.getElementById('note') || {}).value || ui.draft.note; ui._keepScroll = true; render(); break;
      case 'rmcustom': ui.draft.custom.splice(parseInt(el.dataset.i, 10), 1); ui.draft.note = (document.getElementById('note') || {}).value || ui.draft.note; ui._keepScroll = true; render(); break;
      case 'rate': ui.draft.rating = parseInt(el.dataset.v, 10); el.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el)); break;
      case 'saveprobe': saveProbe(); break;
      case 'cmp': ui.showCmp[id] = !ui.showCmp[id]; ui._keepScroll = true; render(); break;
      case 'empty':
        if (ui.confirmEmpty === id) { tasting(id).done = true; save(); ui.confirmEmpty = null; render(); toast('Als geleert markiert'); }
        else { ui.confirmEmpty = id; ui._keepScroll = true; render(); setTimeout(() => { if (ui.confirmEmpty === id) { ui.confirmEmpty = null; ui._keepScroll = true; render(); } }, 4000); }
        break;
      case 'reopen': tasting(id).done = false; save(); ui._keepScroll = true; render(); break;
      case 'learn': ui.learnOpen = ui.learnOpen === id ? null : id; ui._keepScroll = true; render(); break;
      case 'schule': push('schule'); break;
      case 'chap': ui.chOpen = ui.chOpen === id ? null : id; ui._keepScroll = true; render(); break;
      case 'quiz': startQuiz(id); break;
      case 'qpick': quizPick(parseInt(el.dataset.i, 10)); break;
      case 'qpl': case 'qpr': quizPair(a === 'qpl' ? 'l' : 'r', parseInt(el.dataset.i, 10)); break;
      case 'qtemp': quizTemp(); break;
      case 'qnext': quizNext(); break;
      case 'qagain': startQuiz(ui.quiz.id); break;
      case 'qclose': ui.quiz = null; back(); break;
      case 'mpick': miniPick(parseInt(el.dataset.i, 10)); break;
      case 'mdone': ui.mini = null; back(); break;
    }
  });
  $app.addEventListener('input', (e) => {
    if (e.target.id === 'q') { ui.q = e.target.value; const kl = document.getElementById('klist'); if (kl) kl.innerHTML = kellerList(); }
    const k = e.target.dataset && e.target.dataset.pal;
    if (k && ui.draft) { ui.draft.palate[k] = parseInt(e.target.value, 10); const w = document.getElementById('w-' + k); if (w) w.textContent = WORDS[k][ui.draft.palate[k] - 1]; }
    if (e.target.id === 'note' && ui.draft) ui.draft.note = e.target.value;
    if (e.target.id === 'tempIn' && ui.quiz) { ui.quiz.temp = parseInt(e.target.value, 10); const tv = document.getElementById('tempVal'); if (tv) tv.textContent = ui.quiz.temp + ' °C'; }
  });
  function commitCustom(inp) {
    const v = inp.value.trim(); ui.draft.adding = false;
    if (v) ui.draft.custom.push(v);
    ui._keepScroll = true; render();
  }
  $app.addEventListener('keydown', (e) => { if (e.target.id === 'customIn' && e.key === 'Enter') { e.preventDefault(); commitCustom(e.target); } });
  $app.addEventListener('focusout', (e) => { if (e.target.id === 'customIn' && ui.draft && ui.draft.adding) setTimeout(() => { if (ui.draft && ui.draft.adding) commitCustom(e.target); }, 0); });

  // laufende Uhren
  setInterval(() => document.querySelectorAll('[data-since]').forEach((el) => { el.textContent = fmtDur(Date.now() - parseInt(el.dataset.since, 10)); }), 30000);

  // Startbild (einmal pro Sitzung)
  (function splash() {
    let seen = false; try { seen = sessionStorage.getItem('wk.splash') === '1'; sessionStorage.setItem('wk.splash', '1'); } catch (e) {}
    if (seen) return;
    const el = document.createElement('div'); el.className = 'splash';
    el.innerHTML = `<img src="${ASSETS.splash}" alt="" onerror="this.remove()"><div class="splash-t"><b>Weinkeller</b><span>${S.wines.reduce((n, w) => n + (w.bottles || 0), 0)} Flaschen</span></div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('out'), 1300); setTimeout(() => el.remove(), 1900);
  })();

  render();
})();
