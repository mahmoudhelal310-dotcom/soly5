/* التواشيح والابتهالات: فهرس خاص بالموقع (ibtihal-data.js) + مشغّل يوتيوب الرسمي عبر yt.html */
(window.NoorModules = window.NoorModules || []).push((N) => {
  'use strict';
  const { $, $$, store, toast, go, ar, esc, routes } = N;
  const DATA = (window.IBTIHAL_DATA || []).map((x, i) => ({ i, t: x.t, r: x.r, v: x.v }));
  const favs = () => store.get('tw:fav', []);
  const recs = () => { const m = new Map(); DATA.forEach((x) => m.set(x.r, (m.get(x.r) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };
  const itemsFor = (k) => (k === 'all' ? DATA : k === 'fav' ? DATA.filter((x) => favs().includes(x.v)) : DATA.filter((x) => { const r = recs()[+k]; return r && x.r === r[0]; }));
  const nameOf = (k) => (k === 'all' ? 'كل الابتهالات' : k === 'fav' ? '⭐ المفضلة' : (recs()[+k] || ['الابتهالات'])[0]);
  const norm = (s) => N.normAr(String(s)).toLowerCase();
  const thumb = (v) => `https://i.ytimg.com/vi/${v}/mqdefault.jpg`;

  function row(x, k, idx) {
    return `<button class="tw-row" data-go="ibw/${k}/${idx}"><span class="tw-th"><img src="${thumb(x.v)}" alt="" loading="lazy"><span class="tw-pl">▶</span></span>
      <span class="tw-tx"><b>${esc(x.t)}</b><small>🎙️ ${esc(x.r)}${favs().includes(x.v) ? ' — ★' : ''}</small></span></button>`;
  }
  const bindGo = (root) => $$('[data-go]', root).forEach((b) => { b.onclick = () => go(b.dataset.go); });

  function renderHome() {
    const R = recs(), F = favs().length;
    const draw = () => {
      const q = norm($('#twQ').value.trim());
      const box = $('#twBody');
      if (q) {
        const res = DATA.filter((x) => norm(x.t).includes(q) || norm(x.r).includes(q));
        box.innerHTML = res.length ? res.map((x) => row(x, 'all', x.i)).join('') : '<div class="card center muted">لا توجد نتائج</div>';
      } else {
        box.innerHTML = `<div class="tw-grid">
          <button class="tw-card all" data-go="ibt/all"><span>🎧</span><b>كل الابتهالات</b><small>${ar(DATA.length)} ابتهالاً</small></button>
          <button class="tw-card fav" data-go="ibt/fav"><span>⭐</span><b>المفضلة</b><small>${ar(F)}</small></button>
          ${R.map(([n, c], i) => `<button class="tw-card" data-go="ibt/${i}"><span>🎙️</span><b>${esc(n)}</b><small>${ar(c)} ${c > 2 ? 'ابتهالات' : 'ابتهال'}</small></button>`).join('')}
        </div>`;
      }
      bindGo(box);
    };
    N.view.innerHTML = `<div class="tw-hero"><h2>🎙️ تواشيح وابتهالات</h2><p>من روائع كبار المبتهلين — الابتهال التالي يبدأ تلقائياً</p></div>
      <input id="twQ" class="rd-search" type="search" placeholder="ابحث باسم الابتهال أو المبتهل…"><div id="twBody"></div>`;
    $('#twQ').oninput = draw; draw();
  }

  function renderList(k) {
    k = k || 'all';
    const items = itemsFor(k);
    routes.ibt.title = nameOf(k);
    N.setTitle(nameOf(k));
    N.view.innerHTML = `<input id="twQ2" class="rd-search" type="search" placeholder="ابحث في ${esc(nameOf(k))}…"><div id="twList"></div>`;
    const draw = () => {
      const q = norm($('#twQ2').value.trim());
      const shown = items.map((x, idx) => [x, idx]).filter(([x]) => !q || norm(x.t).includes(q));
      $('#twList').innerHTML = shown.length ? shown.map(([x, idx]) => row(x, k, idx)).join('') : `<div class="card center muted">${k === 'fav' ? 'لم تضف ابتهالات إلى المفضلة بعد' : 'لا توجد نتائج'}</div>`;
      bindGo($('#twList'));
    };
    $('#twQ2').oninput = draw; draw();
  }

  function renderWatch(k, idx) {
    k = k || 'all';
    const items = itemsFor(k);
    let i = Math.max(0, Math.min(items.length - 1, +idx || 0));
    const v = items[i];
    if (!v) { go(`ibt/${k}`); return; }
    routes.ibw.back = `ibt/${k}`;
    window.dispatchEvent(new CustomEvent('noor:audio', { detail: 'tawasheeh' }));
    const isFav = () => favs().includes(v.v);
    N.view.innerHTML = `<div class="tw-player"><iframe id="twF" src="athr/yt.html?v=${v.v}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="مشغّل الابتهال"></iframe></div>
      <h2 class="tw-title">${esc(v.t)}</h2><p class="muted" style="margin:0 0 12px">🎙️ ${esc(v.r)} — ${ar(i + 1)} من ${ar(items.length)}</p>
      <div class="tw-btns"><button class="btn ghost" id="twPrev" ${i <= 0 ? 'disabled' : ''}>⏮ السابق</button><button class="btn ghost" id="twNext" ${i >= items.length - 1 ? 'disabled' : ''}>التالي ⏭</button></div>
      <div class="tw-btns"><button class="btn ghost" id="twFav">${isFav() ? '★ في المفضلة' : '☆ أضف للمفضلة'}</button><button class="btn ghost" id="twShare">📤 مشاركة</button></div>`;
    $('#twPrev').onclick = () => go(`ibw/${k}/${i - 1}`);
    $('#twNext').onclick = () => go(`ibw/${k}/${i + 1}`);
    $('#twFav').onclick = (e) => { const F = favs(); const j = F.indexOf(v.v); if (j < 0) F.unshift(v.v); else F.splice(j, 1); store.set('tw:fav', F); e.currentTarget.textContent = j < 0 ? '★ في المفضلة' : '☆ أضف للمفضلة'; };
    $('#twShare').onclick = () => N.shareText(`🎙️ ${v.t}\n${v.r}\nhttps://youtu.be/${v.v}`);
    const frame = $('#twF');
    const onMsg = (e) => {
      const m = e.data || {}; if (m.src !== 'athar-yt' || e.source !== frame.contentWindow) return;
      if (m.type === 'state' && m.s === 0 && i < items.length - 1) go(`ibw/${k}/${i + 1}`);
      if (m.type === 'error') toast(m.code === 101 || m.code === 150 ? 'صاحب الفيديو لا يسمح بتشغيله خارج يوتيوب — جرّب التالي' : 'تعذّر تشغيل هذا الابتهال');
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }

  Object.assign(routes, {
    ibtihal: { title: 'تواشيح وابتهالات', render: renderHome, back: 'home' },
    ibt: { title: 'تواشيح وابتهالات', render: renderList, back: 'ibtihal' },
    ibw: { title: 'تواشيح وابتهالات', render: renderWatch, back: 'ibtihal' },
  });
});
