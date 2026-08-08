const D = window.FOCO_DATA || { directory: [], metrics: [], monthWeeks: {} };
const $ = id => document.getElementById(id);
let view = 'rd';

const dir = (D.directory || []).map(d => ({ ...d, ceco: String(d.ceco) }));
const byCeco = Object.fromEntries(dir.map(d => [d.ceco, d]));
const metrics = {};
(D.metrics || []).forEach(r => {
  metrics[String(r.ceco) + '|' + Number(r.semana)] = r;
});

const monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const monthWeeks5 = {
  Ene: [1, 2, 3, 4, 5],
  Feb: [5, 6, 7, 8, 9],
  Mar: [9, 10, 11, 12, 13],
  Abr: [14, 15, 16, 17, 18],
  May: [18, 19, 20, 21, 22],
  Jun: [22, 23, 24, 25, 26],
  Jul: [27, 28, 29, 30, 31],
  Ago: [31, 32, 33, 34, 35],
  Sep: [36, 37, 38, 39, 40],
  Oct: [40, 41, 42, 43, 44],
  Nov: [45, 46, 47, 48, 49],
  Dic: [48, 49, 50, 51, 52]
};
const months = monthOrder.filter(m => monthWeeks5[m] || (D.monthWeeks && D.monthWeeks[m]));

const metricDefs = {
  omt: { name: 'OMT', short: 'OMT', fmt: 'num0', dir: 'up', threshold: 0 },
  seg: { name: 'Segundas Conexiones', short: 'Segundas Cx', fmt: 'num1', dir: 'up', threshold: 10 },
  cx: { name: 'Conexión', short: 'Conexión', fmt: 'pct1', dir: 'up', threshold: 0.60 },
  bebida: { name: 'Calidad de Bebidas', short: 'Bebida', fmt: 'pct1', dir: 'up', threshold: 0.71 },
  iplh: { name: 'IPLH / TPLH', short: 'IPLH/TPLH', fmt: 'num1', dir: 'up', threshold: 16 },
  peak: { name: 'Peak Hour', short: 'Peak Hour', fmt: 'num0', dir: 'up', threshold: 5 },
  costo: { name: 'Variación de Inventario', short: 'Inventario', fmt: 'pct1', dir: 'range', min: -0.009, max: 0.009, threshold: 0.009 },
  ctc: { name: 'Cada Taza Cuenta', short: 'CTC', fmt: 'pct1', dir: 'up', threshold: 0.10 }
};

const pillars = [
  { title: 'Obsesión por las ventas.', metrics: ['omt', 'seg'] },
  { title: 'Exceder las expectativas del cliente.', metrics: ['cx', 'bebida'] },
  { title: 'Partners correctos en el momento correcto.', metrics: ['iplh', 'peak'] },
  { title: 'Control de costo ideal.', metrics: ['costo', 'ctc'] }
];
const allMetricKeys = pillars.flatMap(p => p.metrics).filter(k => k !== 'peak');

let actions = JSON.parse(localStorage.focoV6Actions || localStorage.focoV5Actions || localStorage.focoV4Actions || '{}');
let objectives = JSON.parse(localStorage.focoV6Objectives || localStorage.focoV5Objectives || localStorage.focoV4Objectives || '{}');
let manual = JSON.parse(localStorage.focoV6Manual || localStorage.focoV5Manual || localStorage.focoV4Manual || '{}');

function init() {
  const dataStatus = $('dataStatus');
  if (dataStatus) dataStatus.textContent = D.updatedToWeek ? `Datos al S${D.updatedToWeek}` : 'Datos no disponibles';
  months.forEach(m => $('mes').add(new Option(m, m)));
  $('mes').value = D.defaultMonth && months.includes(D.defaultMonth) ? D.defaultMonth : (months.includes('Jul') ? 'Jul' : (months[0] || 'Ene'));

  [...new Set(dir.map(d => d.region).filter(Boolean))].sort().forEach(r => $('region').add(new Option(r, r)));
  if ([...$('region').options].some(o => o.value === 'Centro Norte')) $('region').value = 'Centro Norte';

  fillDMAll();
  fillStoreAll();
  if (typeof window.initExecutiveSlicers === 'function') window.initExecutiveSlicers();

  document.querySelectorAll('.tab').forEach(b => {
    b.onclick = () => {
      view = b.dataset.view;
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
      syncFilters();
      updatePageTitle();
      render();
    };
  });

  $('mes').onchange = render;
  $('region').onchange = render;
  $('dm').onchange = render;
  $('store').onchange = render;
  if ($('exportBtn')) $('exportBtn').onclick = exportPDF;

  syncFilters();
  updatePageTitle();
  render();
}


function updatePageTitle() {
  const title = $('pageTitle');
  if (!title) return;
  title.textContent = view === 'rd' ? 'Vista ejecutiva RD' : view === 'dm' ? 'Vista ejecutiva DM' : 'Vista ejecutiva Tienda';
}

function fillDMAll() {
  $('dm').innerHTML = '';
  [...new Set(dir.map(d => d.dm).filter(Boolean))].sort().forEach(d => $('dm').add(new Option(d, d)));
}

function fillStoreAll() {
  const sorted = dir.slice().sort((a, b) => a.tienda.localeCompare(b.tienda));
  $('store').innerHTML = '';
  sorted.forEach(s => $('store').add(new Option(`${s.tienda} · ${s.ceco}`, s.ceco)));
}

function syncFilters() {
  $('regionWrap').classList.toggle('hide', view !== 'rd');
  $('dmWrap').classList.toggle('hide', view !== 'dm');
  $('storeWrap').classList.toggle('hide', view !== 'tienda');
  $('filters').className = 'filters ' + view;
}

function weeks() {
  return ((D.monthWeeks && D.monthWeeks[$('mes').value]) || monthWeeks5[$('mes').value] || []).slice(0, 5);
}

function avg(arr) {
  arr = arr.filter(v => v != null && !Number.isNaN(v));
  return arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null;
}

function val(c, w, k) {
  if (k === 'peak') return manual[`peak|${c}|${w}`] ?? null;
  const r = metrics[String(c) + '|' + Number(w)];
  return r && r[k] != null ? Number(r[k]) : null;
}

function cls(k, v) {
  if (v == null || Number.isNaN(v)) return 'neutral';
  if (k === 'omt') return v < 0 ? 'red' : 'green';
  if (k === 'costo') return v >= metricDefs[k].min && v <= metricDefs[k].max ? 'green' : 'red';
  const t = metricDefs[k].threshold;
  if (metricDefs[k].dir === 'down') return v > t ? 'red' : 'green';
  return v < t ? 'red' : 'green';
}

function fmt(v, type) {
  if (v == null || Number.isNaN(v)) return '';
  if (type === 'pct1') return (v * 100).toFixed(1) + '%';
  if (type === 'num1') return Number(v).toFixed(1);
  return String(Math.round(v));
}

function entity(cecos, k) {
  const ws = weeks();
  const vals = ws.map(w => avg(cecos.map(c => val(c, w, k))));
  return { weeks: vals, prom: avg(vals) };
}

function score(cecos) {
  let total = 0;
  let ok = 0;
  allMetricKeys.forEach(k => {
    const p = entity(cecos, k).prom;
    if (p != null) {
      total++;
      if (cls(k, p) === 'green') ok++;
    }
  });
  return total ? ok / total : null;
}

function trend(vals) {
  const clean = vals.filter(v => v != null && !Number.isNaN(v));
  if (clean.length < 2) return { delta: null, dir: 'flat' };
  const delta = clean[clean.length - 1] - clean[0];
  return { delta, dir: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat' };
}

function trendText(k, vals) {
  const t = trend(vals);
  if (t.delta == null) return '—';
  const arrow = t.delta > 0 ? '▲' : t.delta < 0 ? '▼' : '■';
  return `${arrow} ${fmt(Math.abs(t.delta), metricDefs[k].fmt)}`;
}

function trendClass(k, vals) {
  const t = trend(vals);
  if (t.delta == null || t.delta === 0) return 'neutral';
  let good;
  if (k === 'costo') {
    const clean = vals.filter(v => v != null && !Number.isNaN(v));
    good = Math.abs(clean[clean.length - 1]) <= Math.abs(clean[0]);
  } else {
    good = metricDefs[k].dir === 'down' ? t.delta < 0 : t.delta > 0;
  }
  return good ? 'green' : 'red';
}

function perfGap(k, v) {
  if (v == null) return null;
  if (k === 'omt') return v;
  if (k === 'costo') return metricDefs[k].threshold - Math.abs(v);
  const t = metricDefs[k].threshold;
  return metricDefs[k].dir === 'down' ? t - v : v - t;
}

function bestWorst(cecos) {
  const items = allMetricKeys.map(k => ({ k, prom: entity(cecos, k).prom })).filter(x => x.prom != null);
  if (!items.length) return { best: '—', worst: '—' };
  items.forEach(x => x.gap = perfGap(x.k, x.prom));
  items.sort((a, b) => (b.gap ?? -999) - (a.gap ?? -999));
  return {
    best: metricDefs[items[0].k].short,
    worst: metricDefs[items[items.length - 1].k].short
  };
}

function trendOverall(cecos) {
  const deltas = allMetricKeys.map(k => {
    const e = entity(cecos, k);
    const t = trend(e.weeks);
    if (t.delta == null) return null;
    const good = metricDefs[k].dir === 'down' || metricDefs[k].dir === 'range' ? -Math.abs(t.delta) : t.delta;
    return good;
  }).filter(v => v != null);

  if (!deltas.length) return { text: '—', cls: 'neutral' };
  const d = avg(deltas);
  return {
    text: d > 0 ? '▲ Mejorando' : d < 0 ? '▼ Atención' : '■ Estable',
    cls: d > 0 ? 'green' : d < 0 ? 'red' : 'neutral'
  };
}

function updateHeaderSubtitle(type, scopeLabel) {
  const m = $('mes').value;
  const viewLabel = type === 'rd' ? 'Vista RD' : type === 'dm' ? 'Vista DM' : 'Vista Tienda';
  $('appSubtitle').textContent = `${scopeLabel || 'Nacional'} | ${m} 2026 · ${viewLabel}`;
  if ($('printHeader')) $('printHeader').textContent = `FOCO 2026 | ${scopeLabel || 'Nacional'} | ${m} 2026 · ${viewLabel}`;
}

function render() {
  if (view === 'tienda') renderStore();
  else renderExec(view);
}

function renderContext(type, leader) {
  const m = $('mes').value;
  let text = '';
  if (type === 'rd') text = `Mes ${m} · ${escapeHtml($('region').value)} · Ranking ejecutivo de DMs por promedio mensual`;
  if (type === 'dm') text = `Mes ${m} · ${escapeHtml($('dm').value)} · Ranking ejecutivo de tiendas por promedio mensual`;
  if (type === 'tienda') text = `Mes ${m} · ${leader ? escapeHtml(leader.tienda) : 'Selecciona una tienda'}`;
  $('context').innerHTML = text;
}

function renderSummaryCards(type, scopeCecos, groups) {
  const sw = bestWorst(scopeCecos);
  const sc = score(scopeCecos);
  const tr = trendOverall(scopeCecos);
  const baseLabel = type === 'rd' ? 'DMs' : 'Tiendas';
  const baseVal = groups.length;
  const leaderLabel = type === 'rd' ? 'Mejor DM' : 'Mejor tienda';
  const leader = groups[0] ? groups[0].name : '—';

  return `<section class="summaryDeck">
    <article class="summaryCard"><span>${baseLabel}</span><strong>${baseVal}</strong></article>
    <article class="summaryCard"><span>Score FOCO</span><strong class="${clsScore(sc)}">${sc == null ? '—' : Math.round(sc * 100) + '%'}</strong></article>
    <article class="summaryCard"><span>${leaderLabel}</span><strong>${escapeHtml(leader)}</strong></article>
    <article class="summaryCard"><span>Mejor indicador</span><strong>${escapeHtml(sw.best)}</strong></article>
    <article class="summaryCard"><span>Oportunidad</span><strong class="red">${escapeHtml(sw.worst)}</strong></article>
    <article class="summaryCard"><span>Tendencia</span><strong class="${tr.cls}">${tr.text}</strong></article>
  </section>`;
}

function clsScore(sc) {
  if (sc == null) return 'neutral';
  return sc >= 0.75 ? 'green' : sc >= 0.5 ? 'neutral' : 'red';
}

function renderExec(type) {
  let groups = [];
  let scopeCecos = [];

  if (type === 'rd') {
    const region = $('region').value;
    scopeCecos = dir.filter(d => d.region === region).map(d => d.ceco);
    groups = [...new Set(dir.filter(d => d.region === region).map(d => d.dm).filter(Boolean))]
      .map(dm => ({ name: dm, cecos: dir.filter(d => d.region === region && d.dm === dm).map(d => d.ceco) }));
    updateHeaderSubtitle('rd', region);
  } else {
    const dm = $('dm').value;
    scopeCecos = dir.filter(d => d.dm === dm).map(d => d.ceco);
    groups = dir.filter(d => d.dm === dm).map(d => ({ name: d.tienda, cecos: [d.ceco] }));
    updateHeaderSubtitle('dm', dm);
  }

  groups = groups.map(g => ({ ...g, score: score(g.cecos) })).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  renderContext(type, groups[0] || null);

  let html = renderSummaryCards(type, scopeCecos, groups);
  html += `<div class="execGrid ${type === 'dm' ? 'dmView' : 'rdView'}">`;
  pillars.forEach(p => {
    html += `<section class="pillar"><h2 class="pillarTitle">${p.title}</h2>`;
    p.metrics.forEach(k => html += renderExecMetric(groups, scopeCecos, k, type));
    html += `</section>`;
  });
  html += `</div>`;
  $('content').innerHTML = html;
}

function metricDisplay(k, primary, secondary = null) {
  if (k !== 'iplh') return fmt(primary, metricDefs[k].fmt);
  if (primary == null && secondary == null) return '';
  return `<span class="metricPair">${primary == null ? '—' : fmt(primary, 'num1')} / ${secondary == null ? '—' : fmt(secondary, 'num1')}</span>`;
}

function renderScopeWeekSummary(k, metric, weekNums, secondary = null) {
  const def = metricDefs[k];
  const wk = metric.weeks.map((v, i) => `<div class="wk"><small>${weekNums[i]}</small><b class="${cls(k, v)}">${metricDisplay(k, v, secondary?.weeks[i])}</b></div>`).join('');
  return `<div class="metricSummary">${wk}<div class="promMini"><small>Prom</small><b class="${cls(k, metric.prom)}">${metricDisplay(k, metric.prom, secondary?.prom)}</b></div></div>`;
}

function renderExecMetric(groups, scopeCecos, k, type) {
  const w = weeks();
  const scopeMetric = entity(scopeCecos, k);
  const scopeSecondary = k === 'iplh' ? entity(scopeCecos, 'tplh') : null;
  const rows = groups.map(g => ({ ...g, m: entity(g.cecos, k), secondary: k === 'iplh' ? entity(g.cecos, 'tplh') : null }))
    .filter(g => g.m.prom != null)
    .sort((a, b) => k === 'costo' ? (a.m.prom ?? 999) - (b.m.prom ?? 999) : (b.m.prom ?? -999) - (a.m.prom ?? -999));

  const label = type === 'rd' ? 'Prom Regional' : 'Prom DM';
  const tableLabel = type === 'rd' ? 'DM' : 'Tienda';
  const def = metricDefs[k];
  const summary = renderScopeWeekSummary(k, scopeMetric, w, scopeSecondary);
  const trend = trendText(k, scopeMetric.weeks);
  const trendCls = trendClass(k, scopeMetric.weeks);

  let html = `<div class="metricBlock dashboardMetric">
    <div class="metricPanelHead">
      <div class="metricName"><span>${def.name}</span><b class="${trendCls}">${trend}</b></div>
      <div class="metricProm"><small>${label}</small><strong class="${cls(k, scopeMetric.prom)}">${metricDisplay(k, scopeMetric.prom, scopeSecondary?.prom)}</strong></div>
    </div>
    ${summary}
    <table class="cleanTable">
      <colgroup><col style="width:${type === 'rd' ? '42%' : '46%'}">${w.map(() => '<col>').join('')}<col style="width:64px"></colgroup>
      <thead><tr><th>${tableLabel}</th>${w.map(x => `<th>${x}</th>`).join('')}<th>Prom</th></tr></thead>
      <tbody>`;

  html += rows.map(g => `<tr><td title="${escapeHtml(g.name)}">${escapeHtml(g.name)}</td>${g.m.weeks.map((v, i) => `<td class="value ${cls(k, v)}">${metricDisplay(k, v, g.secondary?.weeks[i])}</td>`).join('')}<td class="value prom ${cls(k, g.m.prom)}">${metricDisplay(k, g.m.prom, g.secondary?.prom)}</td></tr>`).join('');
  html += `</tbody></table></div>`;
  return html;
}

function renderStore() {
  const c = $('store').value || (dir[0] && dir[0].ceco);
  const s = byCeco[c];
  renderContext('tienda', s);
  updateHeaderSubtitle('tienda', s ? s.tienda : 'Tienda');
  const w = weeks();

  let html = `<section class="storeSheet"><div class="storeGrid">`;
  pillars.forEach((p, pi) => {
    html += `<div class="storePillar"><h2>${p.title}</h2>
      <div class="storeMetricHead"><span></span><span>Objetivo</span>${w.map(x => `<span>${x}</span>`).join('')}<span>Prom</span></div>`;
    p.metrics.forEach((k, i) => html += storeMetric(c, k, i + 1, w));
    html += `<div class="actions"><h3>ACCIONES</h3><textarea placeholder="✱ Captura acciones del pilar..." oninput="saveAction('${c}',${pi},this.value)">${escapeHtml(actions[c + '|' + pi] || '')}</textarea></div></div>`;
  });
  html += `</div></section>`;
  $('content').innerHTML = html;
}

function storeMetric(c, k, n, w) {
  const def = metricDefs[k];
  const objKey = `${c}|${k}`;
  const obj = objectives[objKey];
  const vals = w.map(ww => val(c, ww, k));
  const prom = avg(vals);
  let cells = '';

  if (k === 'iplh') {
    cells = w.map(ww => {
      const a = val(c, ww, 'iplh');
      const b = val(c, ww, 'tplh');
      return `<div class="cell"><div class="split cleanSplit"><div class="splitRow"><b class="value ${cls('iplh', a)}">${fmt(a, 'num1')}</b></div><div class="splitRow"><b class="value neutral">${fmt(b, 'num1')}</b></div></div></div>`;
    }).join('');
  } else {
    cells = vals.map((v, i) => {
      if (k === 'peak') {
        return `<div class="cell"><input value="${v ?? ''}" onchange="manual['peak|${c}|${w[i]}']=this.value?parseFloat(this.value):null;localStorage.focoV6Manual=JSON.stringify(manual);render()"></div>`;
      }
      return `<div class="cell value ${obj != null ? diffCls(def, v, obj) : cls(k, v)}">${fmt(v, def.fmt)}</div>`;
    }).join('');
  }

  const iplhProm = avg(w.map(ww => val(c, ww, 'iplh')));
  const tplhProm = avg(w.map(ww => val(c, ww, 'tplh')));
  const promHtml = k === 'iplh'
    ? `<div class="split cleanSplit"><div class="splitRow"><b class="value ${cls('iplh', iplhProm)}">${fmt(iplhProm, 'num1')}</b></div><div class="splitRow"><b class="value neutral">${fmt(tplhProm, 'num1')}</b></div></div>`
    : fmt(prom, def.fmt);

  return `<div class="storeMetric"><div class="indexBox">${n}</div><div class="storeName ${k === 'bebida' ? 'alt' : ''}">${def.name}</div><div class="cell obj"><input placeholder="" value="${obj != null ? fmt(obj, def.fmt).replace('%', '') : ''}" onchange="setObjective('${c}','${k}',this.value,'${def.fmt}')"></div>${cells}<div class="cell value prom ${obj != null ? diffCls(def, prom, obj) : cls(k, prom)}">${promHtml}</div></div>`;
}

function diffCls(def, v, o) {
  if (v == null || o == null) return 'neutral';
  if (def.dir === 'range') return v >= def.min && v <= def.max ? 'green' : 'red';
  return def.dir === 'down' ? (v <= o ? 'green' : 'red') : (v >= o ? 'green' : 'red');
}

function setObjective(c, k, v, fmtType) {
  const key = c + '|' + k;
  if (v === '') {
    delete objectives[key];
  } else {
    const n = parseFloat(String(v).replace('%', '').replace(',', '.'));
    if (!Number.isNaN(n)) objectives[key] = fmtType === 'pct1' && n > 1 ? n / 100 : n;
  }
  localStorage.focoV6Objectives = JSON.stringify(objectives);
  render();
}

function saveAction(c, p, v) {
  actions[c + '|' + p] = v;
  localStorage.focoV6Actions = JSON.stringify(actions);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}


function exportPDF() {
  const btn = $('exportBtn');
  const selectedMonth = $('mes') ? $('mes').value : '';
  const selectedStore = $('store') && view === 'tienda' && byCeco[$('store').value] ? byCeco[$('store').value].tienda : '';
  const selectedDM = $('dm') && view === 'dm' ? $('dm').value : '';
  const selectedRegion = $('region') && view === 'rd' ? $('region').value : '';
  const scope = selectedStore || selectedDM || selectedRegion || 'FOCO 2026';
  const oldTitle = document.title;
  document.title = `FOCO 2026 - ${scope} - ${selectedMonth} 2026`;
  document.body.classList.add('exporting', `export-${view}`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Preparando PDF...';
  }
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('exporting', 'export-rd', 'export-dm', 'export-tienda');
      document.title = oldTitle;
      if (btn) {
        btn.disabled = false;
        btn.textContent = '⬇ Exportar PDF';
      }
    }, 700);
  }, 150);
}

window.addEventListener('afterprint', () => {
  document.body.classList.remove('exporting', 'export-rd', 'export-dm', 'export-tienda');
  const btn = $('exportBtn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = '⬇ Exportar PDF';
  }
});

init();
