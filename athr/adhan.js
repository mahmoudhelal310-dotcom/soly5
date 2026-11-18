/* الأذان: اختيار المؤذن + تشغيل الأذان وقت الصلاة (يعمل والموقع/التطبيق مفتوح) */
(window.NoorModules = window.NoorModules || []).push((N) => {
  'use strict';
  const { $, $$, store, toast, esc } = N;
  // أضف مؤذنين جدداً هنا: { k: 'معرّف', name: 'الاسم', url: 'رابط mp3 مباشر' }
  const ADHANS = [
    { k: 'afasy', name: 'الشيخ مشاري راشد العفاسي', url: 'https://archive.org/download/AdhanMisharyRashid/Adhan%20Mishary%20Rashid.mp3' },
    { k: 'makkah', name: 'الحرم المكي', url: 'https://islamic.network/audio/adhan/makkah.mp3' },
  ];
  const PR = [['fajr', 'الفجر'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']];
  const cfg = () => Object.assign({ on: true, muezzin: 'afasy', off: {}, custom: [] }, store.get('adhan:cfg', {}));
  const save = (c) => store.set('adhan:cfg', c);
  const all = () => ADHANS.concat(cfg().custom);
  let audio = null, stopBtn = null;

  function stop() { if (audio) { audio.pause(); audio = null; } if (stopBtn) { stopBtn.remove(); stopBtn = null; } }
  function playUrl(url, onFail) {
    stop();
    window.dispatchEvent(new CustomEvent('noor:audio', { detail: 'adhan' }));
    audio = new Audio(url); audio.preload = 'auto';
    audio.onended = stop;
    audio.onerror = () => { stop(); if (onFail) onFail(); };
    audio.play().then(() => {
      stopBtn = document.createElement('button');
      stopBtn.className = 'adhan-stop'; stopBtn.textContent = '⏹ إيقاف الأذان'; stopBtn.onclick = stop;
      document.getElementById('athrRoot').appendChild(stopBtn);
    }).catch(() => { stop(); if (onFail) onFail(); });
  }
  window.athrAdhan = (key) => {
    const c = cfg(); if (!c.on || c.off[key]) return;
    const m = all().find((x) => x.k === c.muezzin) || all()[0];
    if (m) playUrl(m.url, () => toast('تعذّر تشغيل الأذان — افتح إعدادات الأذان وجرّب مؤذناً آخر'));
  };

  function openSettings() {
    const c = cfg();
    const sh = N.sheet(`<div class="sheet-ti">🔔 إعدادات الأذان</div>
      <label class="adh-line"><span>تشغيل الأذان وقت الصلاة</span><input type="checkbox" id="adOn" ${c.on ? 'checked' : ''}></label>
      <div class="adh-h">اختر المؤذن</div>
      <div id="adList">${all().map((m) => `<div class="adh-m ${m.k === c.muezzin ? 'sel' : ''}" data-k="${esc(m.k)}"><button class="adh-pick">${m.k === c.muezzin ? '◉' : '○'}</button><b>${esc(m.name)}</b><button class="adh-try" data-try="${esc(m.k)}">▶ تجربة</button></div>`).join('')}</div>
      <div class="adh-h">الصلوات</div>
      <div class="adh-prs">${PR.map(([k, n]) => `<label><input type="checkbox" data-pr="${k}" ${c.off[k] ? '' : 'checked'}> ${n}</label>`).join('')}</div>
      <div class="adh-h">إضافة مؤذن برابط mp3</div>
      <input id="adName" class="rd-search" placeholder="اسم المؤذن"><input id="adUrl" class="rd-search" placeholder="https://…/adhan.mp3" dir="ltr">
      <button class="btn block" id="adAdd">➕ إضافة</button>
      <p class="muted" style="font-size:.78rem;margin-top:10px">ملاحظة: يعمل الأذان طالما الموقع أو التطبيق مفتوح؛ المتصفحات توقف الصوت التلقائي في الخلفية أو قبل أول لمسة للصفحة.</p>`);
    const el = sh.el;
    $('#adOn', el).onchange = (e) => { const x = cfg(); x.on = e.target.checked; save(x); };
    $$('[data-pr]', el).forEach((b) => { b.onchange = () => { const x = cfg(); x.off[b.dataset.pr] = !b.checked; save(x); }; });
    $$('.adh-m', el).forEach((r) => { r.querySelector('.adh-pick').onclick = () => { const x = cfg(); x.muezzin = r.dataset.k; save(x); sh.close(); openSettings(); }; });
    $$('[data-try]', el).forEach((b) => { b.onclick = () => { const m = all().find((x) => x.k === b.dataset.try); playUrl(m.url, () => toast('تعذّر تحميل هذا الأذان')); }; });
    $('#adAdd', el).onclick = () => {
      const name = $('#adName', el).value.trim(), url = $('#adUrl', el).value.trim();
      if (!name || !/^https:\/\/.+/i.test(url)) { toast('اكتب الاسم ورابط https مباشراً'); return; }
      const x = cfg(); x.custom.push({ k: 'c' + Date.now(), name, url }); save(x); sh.close(); openSettings();
    };
  }
  window.openAdhanSettings = openSettings;
});
