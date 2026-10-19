(function () {
  'use strict';

  const T = window.TAKO;
  const C = T.company;

  // ---------- helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const baht = (n) => '฿' + Number(n).toLocaleString('en-US');
  const hashToken = () => decodeURIComponent(location.hash.replace(/^#/, ''));
  const findTour = (id) => T.tours.find((t) => t.id === id);

  const store = {
    get(key) {
      try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked: page still works with defaults */ }
    }
  };

  const ICON = {
    clock: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    plane: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16l20-6-20-6 4 6z"/><path d="M6 10h8"/></svg>',
    cal: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    arrow: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
    check: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    phone: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    line: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11c0-4.4-4-8-9-8s-9 3.6-9 8c0 4 3.2 7.2 7.5 7.9L11 21l2.5-2.2C17.8 18 21 14.8 21 11z"/></svg>',
    ig: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
    mail: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    pin: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    menu: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  window.TAKO_ICON = ICON;

  // ---------- header / footer ----------
  const NAV = [
    { href: 'tours.html#international', label: 'ทัวร์ต่างประเทศ', key: 'international' },
    { href: 'tours.html#domestic', label: 'ทัวร์ในประเทศ', key: 'domestic' },
    { href: 'promotions.html', label: 'โปรโมชัน', key: 'promotions' },
    { href: 'private-group.html', label: 'กรุ๊ปส่วนตัว', key: 'private-group' },
    { href: 'about.html', label: 'เกี่ยวกับเรา', key: 'about' },
    { href: 'contact.html', label: 'ติดต่อเรา', key: 'contact' }
  ];

  function activeKey() {
    const page = document.body.dataset.page;
    if (page !== 'tours') return page;
    const h = hashToken();
    if (h === 'international' || ['japan', 'france', 'italy', 'bali'].includes(h)) return 'international';
    if (h === 'domestic' || h === 'thailand') return 'domestic';
    return 'tours';
  }

  function renderHeader() {
    const host = $('#site-header');
    if (!host) return;
    const overlay = document.body.dataset.page === 'home';
    host.outerHTML = `
      <header class="site-header${overlay ? ' is-overlay' : ''}">
        <div class="wrap nav-bar">
          <a class="brand" href="index.html" aria-label="Tako Tour หน้าแรก">
            <img src="assets/img/logo.svg" alt="" width="46" height="46">
            <span>TAKO TOUR</span>
          </a>
          <nav aria-label="เมนูหลัก" class="nav-links" id="nav-links">
            ${NAV.map((n) => `<a class="lnk" href="${n.href}" data-key="${n.key}">${n.label}</a>`).join('')}
            <a class="btn btn-accent mobile-only" href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} แอด LINE ${esc(C.line)}</a>
          </nav>
          <div class="nav-cta">
            <a class="btn btn-ghost" href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} แอด LINE ${esc(C.line)}</a>
            <button type="button" class="menu-btn" aria-expanded="false" aria-controls="nav-links" aria-label="เปิดเมนู">${ICON.menu}</button>
          </div>
        </div>
      </header>`;
    markActiveNav();
    const btn = $('.menu-btn');
    const links = $('#nav-links');
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
      btn.innerHTML = open ? ICON.close : ICON.menu;
    });
    $$('a', links).forEach((a) => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = ICON.menu;
    }));
  }

  function markActiveNav() {
    const key = activeKey();
    $$('#nav-links a[data-key]').forEach((a) => {
      if (a.dataset.key === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function renderFooter() {
    const host = $('#site-footer');
    if (!host) return;
    host.outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="foot-grid">
            <div class="foot-brand">
              <a class="brand" href="index.html" aria-label="Tako Tour หน้าแรก"><img src="assets/img/logo.svg" alt="" width="46" height="46"><span>TAKO TOUR</span></a>
              <address style="font-style: normal;">${esc(C.address)}</address>
              <span>ใบอนุญาตประกอบธุรกิจนำเที่ยว ${esc(C.license)}</span>
            </div>
            <nav aria-label="ทัวร์">
              <h2>ทัวร์</h2>
              <ul>
                <li><a href="tours.html#international">ทัวร์ต่างประเทศ</a></li>
                <li><a href="tours.html#domestic">ทัวร์ในประเทศ</a></li>
                <li><a href="promotions.html">โปรโมชัน</a></li>
                <li><a href="private-group.html">กรุ๊ปส่วนตัว</a></li>
              </ul>
            </nav>
            <nav aria-label="ช่วยเหลือ">
              <h2>ช่วยเหลือ</h2>
              <ul>
                <li><a href="how-to-book.html">วิธีการจองและชำระเงิน</a></li>
                <li><a href="cancellation.html">เงื่อนไขการยกเลิก</a></li>
                <li><a href="faq.html">คำถามที่พบบ่อย</a></li>
                <li><a href="about.html">เกี่ยวกับเรา</a></li>
              </ul>
            </nav>
            <div>
              <h2>ติดต่อเรา</h2>
              <ul>
                <li><a href="tel:${C.phoneIntl}">${ICON.phone} ${esc(C.phone)}</a></li>
                <li><a href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} LINE ${esc(C.line)}</a></li>
                <li><a href="${C.instagramUrl}" target="_blank" rel="noopener">${ICON.ig} IG ${esc(C.instagram)}</a></li>
                <li><a href="mailto:${C.email}">${ICON.mail} ${esc(C.email)}</a></li>
              </ul>
            </div>
          </div>
          <div class="foot-bottom">
            <span>© 2569 ${esc(C.legalName)} สงวนลิขสิทธิ์</span>
            <span>เว็บไซต์ตัวอย่างสำหรับพิจารณา ราคา รอบเดินทาง และเงื่อนไขเป็นข้อมูลตัวอย่าง</span>
          </div>
        </div>
      </footer>`;
  }

  // ---------- shared markup ----------
  function tourCard(t) {
    const promo = t.promo ? `<s>${baht(t.promo.was)}</s>` : '';
    return `
      <article class="tour-card">
        <div class="ph">
          <img src="${t.img}" alt="${esc(t.alt)}" loading="lazy" width="620" height="440">
          <span class="badge ${t.badge.tone}">${esc(t.badge.text)}</span>
        </div>
        <div class="body">
          <span class="country">${esc(t.countryName)} · ${esc(t.code)}</span>
          <h3><a href="tour.html#${t.id}">${esc(t.title)}</a></h3>
          <div class="meta"><span>${ICON.clock}${esc(t.duration)}</span><span>${ICON.plane}${esc(t.flight)}</span></div>
          <div class="meta"><span>${ICON.cal}${esc(t.period)}</span></div>
          <div class="price-row">
            <div class="price"><small>เริ่มต้น / ท่าน</small>${promo}<strong>${baht(t.price)}</strong></div>
            <a class="btn btn-primary" href="tour.html#${t.id}">ดูรายละเอียด</a>
          </div>
        </div>
      </article>`;
  }

  function destCard(d) {
    return `
      <a class="dest" href="tours.html#${d.key}">
        <img src="${d.img}" alt="${esc(d.alt)}" loading="lazy" width="480" height="640">
        <div class="cap">
          <div><strong>ทัวร์${esc(d.name)}</strong><span>${esc(d.cities)}</span></div>
          <span class="arrow">${ICON.arrow}</span>
        </div>
      </a>`;
  }

  // ---------- demo forms (no backend yet) ----------
  function wireDemoForms() {
    $$('form[data-demo-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const box = document.createElement('div');
        box.className = 'success';
        box.setAttribute('role', 'status');
        box.innerHTML = `<h3>${esc(form.dataset.successTitle || 'ส่งข้อมูลแล้ว')}</h3><p>${esc(form.dataset.successText || 'ทีมงานจะติดต่อกลับโดยเร็ว')}</p>`;
        form.replaceWith(box);
      });
    });
  }

  // ---------- pages ----------
  function initHome() {
    const dest = $('#dest-grid');
    if (dest) dest.innerHTML = T.destinations.slice(0, 4).map(destCard).join('');
    const feat = $('#featured-tours');
    if (feat) feat.innerHTML = T.tours.filter((t) => t.featured).map(tourCard).join('');
    const form = $('#search-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      store.set('tako.search', { q: $('#q').value.trim(), month: $('#month').value });
      location.href = 'tours.html#search';
    });
  }

  const FILTERS = [
    { key: 'all', label: 'ทั้งหมด', test: () => true },
    { key: 'international', label: 'ต่างประเทศ', test: (t) => t.region === 'international' },
    { key: 'domestic', label: 'ในประเทศ', test: (t) => t.region === 'domestic' },
    { key: 'japan', label: 'ญี่ปุ่น', test: (t) => t.country === 'japan' },
    { key: 'france', label: 'ฝรั่งเศส', test: (t) => t.country === 'france' },
    { key: 'italy', label: 'อิตาลี', test: (t) => t.country === 'italy' },
    { key: 'bali', label: 'บาหลี', test: (t) => t.country === 'bali' },
    { key: 'thailand', label: 'ไทย', test: (t) => t.country === 'thailand' }
  ];
  const TITLES = {
    all: ['ทัวร์ทั้งหมด', 'แพ็กเกจทัวร์ในประเทศและต่างประเทศจาก Tako Tour'],
    international: ['ทัวร์ต่างประเทศ', 'ญี่ปุ่น ยุโรป บาหลี บินตรง พร้อมหัวหน้าทัวร์ดูแลตลอดทริป'],
    domestic: ['ทัวร์ในประเทศ', 'ทะเลใต้ ภูเขาเหนือ ทริปสั้นวันหยุด รวมตั๋วเครื่องบิน'],
    search: ['ผลการค้นหา', 'ทัวร์ที่ตรงกับสิ่งที่คุณค้นหา']
  };

  function matchMonth(t, month) {
    if (!month) return true;
    const [abbr, year] = month.split(' ');
    return t.rounds.some((r) => r.date.includes(abbr) && r.date.includes(year));
  }

  function initTours() {
    const chips = $('#chips');
    const list = $('#tour-list');
    const q = $('#tour-q');
    const month = $('#tour-month');
    const sort = $('#tour-sort');
    const count = $('#tour-count');

    chips.innerHTML = FILTERS.map((f) => `<a class="chip" href="#${f.key}" data-key="${f.key}">${f.label}</a>`).join('');

    function current() {
      const h = hashToken();
      return FILTERS.some((f) => f.key === h) ? h : 'all';
    }

    function render() {
      const key = current();
      const filter = FILTERS.find((f) => f.key === key);
      const words = q.value.trim().toLowerCase();
      let tours = T.tours.filter(filter.test).filter((t) => matchMonth(t, month.value));
      if (words) {
        tours = tours.filter((t) => [t.title, t.countryName, t.code, t.highlights.join(' ')].join(' ').toLowerCase().includes(words));
      }
      if (sort.value === 'price-asc') tours.sort((a, b) => a.price - b.price);
      if (sort.value === 'price-desc') tours.sort((a, b) => b.price - a.price);

      $$('.chip', chips).forEach((c) => c.setAttribute('aria-current', String(c.dataset.key === key)));
      const titleKey = hashToken() === 'search' ? 'search' : (TITLES[key] ? key : null);
      const dest = T.destinations.find((d) => d.key === key);
      const [title, sub] = titleKey ? TITLES[titleKey] : ['ทัวร์' + dest.name, dest.cities];
      $('#tours-title').textContent = title;
      $('#tours-sub').textContent = sub;
      document.title = title + ' | Tako Tour';
      const heroImg = $('#tours-hero-img');
      const hero = dest
        ? [dest.img, dest.alt]
        : key === 'domestic'
          ? ['assets/img/thailand-phiphi.jpg', 'วิวเกาะพีพีจากจุดชมวิว']
          : ['assets/img/italy-dolomites.jpg', 'ทะเลสาบในเทือกเขาโดโลมิติ'];
      heroImg.src = hero[0];
      heroImg.alt = hero[1];

      count.textContent = `พบ ${tours.length} ทัวร์`;
      list.innerHTML = tours.length
        ? tours.map(tourCard).join('')
        : `<div class="empty" style="grid-column: 1 / -1;"><strong>ไม่พบทัวร์ที่ตรงกับการค้นหา</strong><span>ลองเปลี่ยนคำค้นหรือเดือนเดินทาง หรือให้ทีมงานจัดทริปให้</span><a class="btn btn-primary" href="private-group.html">ให้ทีมงานจัดทริปให้</a></div>`;
      markActiveNav();
    }

    if (hashToken() === 'search') {
      const s = store.get('tako.search');
      if (s) { q.value = s.q || ''; month.value = s.month || ''; }
    }
    [q, month, sort].forEach((el) => el.addEventListener('input', render));
    window.addEventListener('hashchange', () => { render(); window.scrollTo({ top: 0 }); });
    render();
  }

  function initTour() {
    const root = $('#tour-root');
    const t = findTour(hashToken());
    if (!t) {
      root.innerHTML = `<div class="empty"><strong>ไม่พบทัวร์นี้</strong><span>ทัวร์อาจปิดการขายแล้ว ลองดูทัวร์อื่นที่เปิดจองอยู่</span><a class="btn btn-primary" href="tours.html">ดูทัวร์ทั้งหมด</a></div>`;
      return;
    }
    document.title = t.title + ' ' + t.duration + ' | Tako Tour';
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', `${t.title} ${t.duration} ${t.flight} ราคาเริ่มต้น ${baht(t.price)} จองกับ Tako Tour โทร ${C.phone}`);

    const saved = store.get('tako.booking');
    const state = saved && saved.id === t.id ? saved : { id: t.id, round: 0, adults: 2, children: 0 };
    const regionLabel = t.region === 'international' ? 'ทัวร์ต่างประเทศ' : 'ทัวร์ในประเทศ';
    const deposit = t.region === 'international' ? 10000 : 3000;

    root.innerHTML = `
      <nav aria-label="เส้นทาง"><ol class="crumbs">
        <li><a href="index.html">หน้าแรก</a></li><li aria-hidden="true">/</li>
        <li><a href="tours.html#${t.region}">${regionLabel}</a></li><li aria-hidden="true">/</li>
        <li><a href="tours.html#${t.country}">${esc(t.countryName)}</a></li><li aria-hidden="true">/</li>
        <li aria-current="page" style="color: var(--ink);">${esc(t.code)}</li>
      </ol></nav>
      <div class="detail-hero"><img src="${t.img}" alt="${esc(t.alt)}" width="1200" height="800"></div>
      <div class="detail-layout">
        <article class="detail-main">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;"><span class="badge ${t.badge.tone}">${esc(t.badge.text)}</span><span class="badge neutral">รหัสทัวร์ ${esc(t.code)}</span></div>
            <h1 style="font-size: clamp(26px, 3.4vw, 36px);">${esc(t.title)} ${esc(t.duration)}</h1>
            <div class="meta"><span>${ICON.clock}${esc(t.duration)}</span><span>${ICON.plane}${esc(t.flight)}</span><span>${esc(t.hotel)}</span><span>${esc(t.group)}</span></div>
          </div>
          <section class="panel" style="display: flex; flex-direction: column; gap: 16px;">
            <h2 style="font-size: 22px;">ไฮไลต์ของทริป</h2>
            <ul class="hl-list">${t.highlights.map((h) => `<li>${ICON.check}<span>${esc(h)}</span></li>`).join('')}</ul>
          </section>
          <section class="panel" style="display: flex; flex-direction: column; gap: 18px;">
            <h2 style="font-size: 22px;">โปรแกรมการเดินทาง</h2>
            <ol class="timeline">${t.days.map((d, i) => `
              <li><div class="rail"><span class="dot">${i + 1}</span><span class="line" aria-hidden="true"></span></div>
              <div class="txt"><h3>วันที่ ${i + 1} · ${esc(d[0])}</h3><p>${esc(d[1])}</p></div></li>`).join('')}
            </ol>
          </section>
          <div class="grid grid-3">
            <section class="panel"><h2 style="font-size: 18px; margin-bottom: 10px;">ราคานี้รวม</h2><ul class="bullets">${t.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
            <section class="panel"><h2 style="font-size: 18px; margin-bottom: 10px;">ไม่รวม</h2><ul class="bullets">${t.excludes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
          </div>
        </article>
        <aside class="book" aria-label="จองทัวร์">
          <div><small style="color: var(--muted);">ราคาเริ่มต้น / ท่าน</small><div class="price">${t.promo ? `<s>${baht(t.promo.was)}</s>` : ''}<strong style="font-size: 32px;">${baht(t.price)}</strong></div>${t.promo ? `<span class="badge hot" style="margin-top: 6px;">${esc(t.promo.note)}</span>` : ''}</div>
          <fieldset style="border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px;">
            <legend style="font-weight: 600; margin-bottom: 10px; font-size: 15px;">เลือกรอบเดินทาง</legend>
            ${t.rounds.map((r, i) => `
              <button type="button" class="round" data-round="${i}" aria-pressed="${i === state.round}">
                <span class="d"><strong>${esc(r.date)}</strong><span class="s ${r.seats <= 5 ? 'seat-low' : 'seat-ok'}">${r.seats <= 5 ? 'เหลือ ' + r.seats + ' ที่นั่ง' : 'ว่าง'}</span></span>
                <strong>${baht(r.adult)}</strong>
              </button>`).join('')}
          </fieldset>
          <div class="stepper"><div><strong id="adult-label">ผู้ใหญ่</strong><br><small style="color: var(--muted);">อายุ 12 ปีขึ้นไป</small></div>
            <div class="ctrl" role="group" aria-labelledby="adult-label"><button type="button" data-step="adults:-1" aria-label="ลดจำนวนผู้ใหญ่">−</button><output id="adults" aria-live="polite"></output><button type="button" data-step="adults:1" aria-label="เพิ่มจำนวนผู้ใหญ่">+</button></div></div>
          <div class="stepper"><div><strong id="child-label">เด็ก</strong><br><small style="color: var(--muted);">อายุ 2–11 ปี</small></div>
            <div class="ctrl" role="group" aria-labelledby="child-label"><button type="button" data-step="children:-1" aria-label="ลดจำนวนเด็ก">−</button><output id="children" aria-live="polite"></output><button type="button" data-step="children:1" aria-label="เพิ่มจำนวนเด็ก">+</button></div></div>
          <div class="total"><span>ราคารวม</span><strong id="total" aria-live="polite"></strong></div>
          <a class="btn btn-primary btn-lg btn-block" id="book-now" href="booking.html#${t.id}">จองเลย</a>
          <a class="btn btn-ghost btn-block" href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} สอบถามผ่าน LINE ${esc(C.line)}</a>
          <p class="form-note">มัดจำ ${baht(deposit)} / ท่าน ชำระส่วนที่เหลือตามเงื่อนไขใน <a href="how-to-book.html">วิธีการจองและชำระเงิน</a> · โทร ${esc(C.phone)}</p>
        </aside>
      </div>`;

    function update() {
      const r = t.rounds[state.round];
      $('#adults').textContent = state.adults;
      $('#children').textContent = state.children;
      $('#total').textContent = baht(r.adult * state.adults + r.child * state.children);
      $$('.round', root).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.round) === state.round)));
      store.set('tako.booking', state);
    }
    $$('.round', root).forEach((b) => b.addEventListener('click', () => { state.round = Number(b.dataset.round); update(); }));
    $$('[data-step]', root).forEach((b) => b.addEventListener('click', () => {
      const [field, delta] = b.dataset.step.split(':');
      const min = field === 'adults' ? 1 : 0;
      state[field] = Math.max(min, Math.min(9, state[field] + Number(delta)));
      update();
    }));
    update();
  }

  function initBooking() {
    const root = $('#booking-root');
    const t = findTour(hashToken()) || T.tours[0];
    const saved = store.get('tako.booking');
    const state = saved && saved.id === t.id ? saved : { id: t.id, round: 0, adults: 2, children: 0 };

    $('#bk-tour').innerHTML = `<a href="tour.html#${t.id}">${esc(t.title)}</a> · ${esc(t.duration)}`;
    $('#bk-img').src = t.img;
    $('#bk-img').alt = t.alt;
    const roundSel = $('#bk-round');
    roundSel.innerHTML = t.rounds.map((r, i) => `<option value="${i}">${esc(r.date)} · ${baht(r.adult)}</option>`).join('');
    roundSel.value = String(state.round);
    $('#bk-adults').value = state.adults;
    $('#bk-children').value = state.children;

    function total() {
      const r = t.rounds[Number(roundSel.value)];
      const a = Math.max(1, Number($('#bk-adults').value) || 1);
      const c = Math.max(0, Number($('#bk-children').value) || 0);
      $('#bk-total').textContent = baht(r.adult * a + r.child * c);
      store.set('tako.booking', { id: t.id, round: Number(roundSel.value), adults: a, children: c });
      return { r, a, c };
    }
    ['#bk-round', '#bk-adults', '#bk-children'].forEach((s) => $(s).addEventListener('input', total));
    total();

    $('#booking-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!form.reportValidity()) return;
      const { r, a, c } = total();
      const ref = 'TK' + Date.now().toString(36).toUpperCase().slice(-6);
      root.innerHTML = `
        <div class="success" role="status">
          <span class="eyebrow" style="color: var(--lagoon);">รับคำขอจองแล้ว</span>
          <h2 style="font-size: 28px;">หมายเลขคำขอ ${ref}</h2>
          <p>${esc(t.title)} · รอบ ${esc(r.date)} · ผู้ใหญ่ ${a} ท่าน${c ? ' เด็ก ' + c + ' ท่าน' : ''}</p>
          <p>ทีมงานจะติดต่อกลับทางโทรศัพท์หรือ LINE ภายใน 24 ชั่วโมง เพื่อยืนยันที่นั่งและแจ้งช่องทางชำระมัดจำ</p>
          <p class="form-note">เว็บไซต์ตัวอย่าง: คำขอนี้ยังไม่ถูกส่งถึงทีมงานจริง</p>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;"><a class="btn btn-primary" href="tours.html">ดูทัวร์อื่น</a><a class="btn btn-ghost" href="how-to-book.html">ขั้นตอนการชำระเงิน</a></div>
        </div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initPromotions() {
    $('#promo-list').innerHTML = T.tours.filter((t) => t.promo).map(tourCard).join('');
  }

  function initFaq() {
    const plus = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
    $('#faq-list').innerHTML = T.faqs.map((f) => `<details><summary>${esc(f[0])}${plus}</summary><p>${esc(f[1])}</p></details>`).join('');
  }

  function initContact() {
    const list = $('#contact-list');
    if (!list) return;
    const item = (href, icon, label, value, ext) => `
      <${href ? 'a' : 'div'} class="contact-item"${href ? ` href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}` : ''}>
        <span class="ic">${icon}</span><span><small>${label}</small><strong>${esc(value)}</strong></span>
      </${href ? 'a' : 'div'}>`;
    list.innerHTML = [
      item('tel:' + C.phoneIntl, ICON.phone, 'โทรศัพท์', C.phone),
      item(C.lineUrl, ICON.line, 'LINE Official', C.line, true),
      item(C.instagramUrl, ICON.ig, 'Instagram', C.instagram, true),
      item('mailto:' + C.email, ICON.mail, 'อีเมล', C.email),
      item(C.mapUrl, ICON.pin, 'ที่อยู่ (เปิดใน Google Maps)', C.address, true)
    ].join('');
  }

  // ---------- boot ----------
  renderHeader();
  renderFooter();
  wireDemoForms();
  const page = document.body.dataset.page;
  const inits = { home: initHome, tours: initTours, tour: initTour, booking: initBooking, promotions: initPromotions, faq: initFaq };
  if (inits[page]) inits[page]();
  initContact();
})();
