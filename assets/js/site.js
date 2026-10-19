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

  const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  function parts(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return { d, m: TH_MONTHS[m - 1], y: y + 543 };
  }
  function fmtRange(start, end) {
    const a = parts(start);
    const b = parts(end);
    if (a.y !== b.y) return `${a.d} ${a.m} ${a.y} – ${b.d} ${b.m} ${b.y}`;
    if (a.m !== b.m) return `${a.d} ${a.m} – ${b.d} ${b.m} ${b.y}`;
    return `${a.d} – ${b.d} ${b.m} ${b.y}`;
  }

  const store = {
    get(key) {
      try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked: page still works with defaults */ }
    }
  };

  const svg = (w, body, sw) => `<svg aria-hidden="true" width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const ICON = {
    clock: svg(16, '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    plane: svg(16, '<path d="M2 16l20-6-20-6 4 6z"/><path d="M6 10h8"/>'),
    cal: svg(16, '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    flag: svg(16, '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>'),
    ship: svg(16, '<path d="M3 17l2 4h14l2-4z"/><path d="M5 17V9h14v8"/><path d="M12 9V3"/><path d="M9 5h6"/>'),
    arrow: svg(18, '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'),
    chev: svg(16, '<path d="M6 9l6 6 6-6"/>'),
    check: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    pinS: svg(18, '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    phone: svg(18, '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    line: svg(18, '<path d="M21 11c0-4.4-4-8-9-8s-9 3.6-9 8c0 4 3.2 7.2 7.5 7.9L11 21l2.5-2.2C17.8 18 21 14.8 21 11z"/>'),
    fb: svg(18, '<path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H15l.5-3.5h-4V7.5a1 1 0 0 1 1-1H15z"/>'),
    ig: svg(18, '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
    mail: svg(18, '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    pin: svg(18, '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    menu: svg(22, '<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: svg(22, '<path d="M6 6l12 12M18 6L6 18"/>')
  };

  // ---------- header / footer ----------
  const NAV = [
    { label: 'ทัวร์', key: 'tours', children: [
      { href: 'tours.html#international', label: 'ทัวร์ต่างประเทศ', key: 'international' },
      { href: 'tours.html#domestic', label: 'ทัวร์ในประเทศ', key: 'domestic' },
      { href: 'golf.html#international', label: 'ทัวร์ตีกอล์ฟ ต่างประเทศ', key: 'golf-international' },
      { href: 'golf.html#domestic', label: 'ทัวร์ตีกอล์ฟ ในประเทศ', key: 'golf-domestic' },
      { href: 'cruise.html', label: 'เรือสำราญ', key: 'cruise' },
      { href: 'private-group.html', label: 'กรุ๊ปส่วนตัว', key: 'private-group' }
    ] },
    { href: 'destinations.html', label: 'สถานที่ท่องเที่ยว', key: 'destinations' },
    { href: 'visa.html', label: 'วีซ่า', key: 'visa' },
    { href: 'promotions.html', label: 'โปรโมชัน', key: 'promotions' },
    { href: 'about.html', label: 'เกี่ยวกับเรา', key: 'about' },
    { href: 'contact.html', label: 'ติดต่อเรา', key: 'contact' }
  ];

  function activeKey() {
    const page = document.body.dataset.page;
    const h = hashToken();
    if (page === 'destination') return 'destinations';
    if (page === 'golf') return h === 'domestic' ? 'golf-domestic' : 'golf-international';
    if (page !== 'tours') return page;
    if (h === 'international') return 'international';
    if (h === 'domestic' || h === 'thailand') return 'domestic';
    return 'tours-all';
  }

  function renderHeader() {
    const host = $('#site-header');
    if (!host) return;
    const overlay = document.body.dataset.page === 'home';
    const items = NAV.map((n) => {
      if (!n.children) return `<a class="lnk" href="${n.href}" data-key="${n.key}">${n.label}</a>`;
      return `
        <div class="nav-group" data-group="${n.key}">
          <button type="button" class="nav-drop" aria-expanded="false" aria-controls="sub-${n.key}">${n.label}${ICON.chev}</button>
          <div class="nav-sub" id="sub-${n.key}">
            ${n.children.map((c) => `<a href="${c.href}" data-key="${c.key}">${c.label}</a>`).join('')}
          </div>
        </div>`;
    }).join('');
    host.outerHTML = `
      <header class="site-header${overlay ? ' is-overlay' : ''}">
        <div class="wrap nav-bar">
          <a class="brand" href="index.html" aria-label="Tako Tour หน้าแรก">
            <img src="assets/img/logo.svg" alt="" width="46" height="46">
            <span>TAKO TOUR</span>
          </a>
          <nav aria-label="เมนูหลัก" class="nav-links" id="nav-links">
            ${items}
            <a class="btn btn-accent mobile-only" href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} แอด LINE ${esc(C.line)}</a>
          </nav>
          <div class="nav-cta">
            <a class="icon-btn" href="${C.facebookUrl}" target="_blank" rel="noopener" aria-label="Facebook Tako Tour">${ICON.fb}</a>
            <a class="btn btn-ghost" href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} แอด LINE</a>
            <button type="button" class="menu-btn" aria-expanded="false" aria-controls="nav-links" aria-label="เปิดเมนู">${ICON.menu}</button>
          </div>
        </div>
      </header>`;
    markActiveNav();
    wireNav();
  }

  function wireNav() {
    const btn = $('.menu-btn');
    const links = $('#nav-links');
    const closeMenu = () => {
      links.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'เปิดเมนู');
      btn.innerHTML = ICON.menu;
    };
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
      btn.innerHTML = open ? ICON.close : ICON.menu;
    });
    $$('a', links).forEach((a) => a.addEventListener('click', closeMenu));

    $$('.nav-group').forEach((g) => {
      const drop = $('.nav-drop', g);
      const setOpen = (open) => { g.classList.toggle('is-open', open); drop.setAttribute('aria-expanded', String(open)); };
      drop.addEventListener('click', () => setOpen(!g.classList.contains('is-open')));
      g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); drop.focus(); } });
      document.addEventListener('click', (e) => { if (!g.contains(e.target)) setOpen(false); });
    });
  }

  function markActiveNav() {
    const key = activeKey();
    $$('#nav-links a[data-key]').forEach((a) => {
      if (a.dataset.key === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $$('.nav-group').forEach((g) => g.classList.toggle('is-active', !!$('a[aria-current="page"]', g)));
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
                <li><a href="golf.html">ทัวร์ตีกอล์ฟ</a></li>
                <li><a href="cruise.html">เรือสำราญ</a></li>
                <li><a href="private-group.html">กรุ๊ปส่วนตัว</a></li>
                <li><a href="promotions.html">โปรโมชัน</a></li>
              </ul>
            </nav>
            <nav aria-label="ข้อมูลและช่วยเหลือ">
              <h2>ข้อมูลและช่วยเหลือ</h2>
              <ul>
                <li><a href="destinations.html">สถานที่ท่องเที่ยว</a></li>
                <li><a href="visa.html">บริการวีซ่า</a></li>
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
                <li><a href="${C.facebookUrl}" target="_blank" rel="noopener">${ICON.fb} Facebook ${esc(C.facebook)}</a></li>
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
  const sortedRounds = (t) => t.rounds.slice().sort((a, b) => a.start.localeCompare(b.start));
  const priceLabel = (t) => ({ golf: 'ผู้ตีกอล์ฟ เริ่มต้น / ท่าน', cruise: 'ห้องด้านใน เริ่มต้น / ท่าน' }[t.type] || 'เริ่มต้น / ท่าน');
  const detailHref = (t) => `tour.html#${t.id}`;

  function typeMeta(t) {
    if (t.type === 'golf') return `<span>${ICON.flag}ตีกอล์ฟ ${t.golfRounds} รอบ</span>`;
    if (t.type === 'cruise') return `<span>${ICON.ship}แวะ ${t.route.length - 2} เมืองท่า</span>`;
    return '';
  }

  function tourCard(t) {
    const promo = t.promo ? `<s>${baht(t.promo.was)}</s>` : '';
    const rounds = sortedRounds(t);
    const more = rounds.length > 1 ? ` · อีก ${rounds.length - 1} รอบ` : '';
    const travel = t.airline ? `${ICON.plane}${esc(t.airline)}` : `${ICON.plane}${esc(t.flight)}`;
    return `
      <article class="tour-card">
        <div class="ph">
          <img src="${t.img}" alt="${esc(t.alt)}" loading="lazy" width="620" height="440">
          <span class="badge ${t.badge.tone}">${esc(t.badge.text)}</span>
        </div>
        <div class="body">
          <span class="country">${esc(t.countryName)} · ${esc(t.code)}</span>
          <h3><a href="${detailHref(t)}">${esc(t.title)}</a></h3>
          <div class="meta"><span>${ICON.clock}${esc(t.duration)}</span><span>${travel}</span>${typeMeta(t)}</div>
          <div class="meta"><span>${ICON.cal}รอบถัดไป ${fmtRange(rounds[0].start, rounds[0].end)}${more}</span></div>
          <div class="price-row">
            <div class="price"><small>${priceLabel(t)}</small>${promo}<strong>${baht(t.price)}</strong></div>
            <a class="btn btn-primary" href="${detailHref(t)}">ดูรายละเอียด</a>
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

  function guideCard(g) {
    return `
      <a class="guide-card" href="destination.html#${g.key}">
        <div class="ph"><img src="${g.img}" alt="${esc(g.alt)}" loading="lazy" width="600" height="400"></div>
        <div class="body">
          <span class="country">${esc(g.en)}</span>
          <h3>${esc(g.name)}</h3>
          <p>${esc(g.tagline)}</p>
          <span class="text-link">อ่านคู่มือเที่ยว${ICON.arrow}</span>
        </div>
      </a>`;
  }

  const emptyState = (title, text) => `<div class="empty" style="grid-column: 1 / -1;"><strong>${title}</strong><span>${text}</span><a class="btn btn-primary" href="private-group.html">ให้ทีมงานจัดทริปให้</a></div>`;

  // ---------- search ----------
  function matchQuery(t, words) {
    if (!words) return true;
    const hay = [t.title, t.code, t.countryName, t.highlights.join(' '), (t.courses || []).map((c) => c.name).join(' '), (t.route || []).join(' '), t.cruiseLine || '']
      .join(' ').toLowerCase();
    return words.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }
  const matchDates = (t, from, to) => !from && !to ? true : t.rounds.some((r) => (!from || r.start >= from) && (!to || r.start <= to));
  const matchAirline = (t, airline) => !airline || t.airline === airline;

  function fillAirlines(select) {
    select.insertAdjacentHTML('beforeend', T.airlines.map((a) => `<option value="${esc(a)}">${esc(a)}</option>`).join(''));
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
    if (feat) feat.innerHTML = T.tours.filter((t) => t.featured && t.type === 'tour').slice(0, 3).map(tourCard).join('');
    const form = $('#search-form');
    if (!form) return;
    fillAirlines($('#airline'));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      store.set('tako.search', { q: $('#q').value.trim(), from: $('#from').value, to: $('#to').value, airline: $('#airline').value });
      location.href = 'tours.html#search';
    });
  }

  const byCountry = (key) => (t) => t.country === key;
  const FILTERS = [
    { key: 'all', label: 'ทั้งหมด', test: () => true },
    { key: 'international', label: 'ต่างประเทศ', test: (t) => t.type === 'tour' && t.region === 'international' },
    { key: 'domestic', label: 'ในประเทศ', test: (t) => t.type === 'tour' && t.region === 'domestic' },
    { key: 'golf', label: 'ตีกอล์ฟ', test: (t) => t.type === 'golf' },
    { key: 'cruise', label: 'เรือสำราญ', test: (t) => t.type === 'cruise' }
  ].concat(T.destinations.map((d) => ({ key: d.key, label: d.name, test: byCountry(d.key) })));
  const TITLES = {
    all: ['ทัวร์ทั้งหมด', 'ทัวร์ ทัวร์ตีกอล์ฟ และเรือสำราญจาก Tako Tour'],
    international: ['ทัวร์ต่างประเทศ', 'ญี่ปุ่น เกาหลี เวียดนาม ยุโรป บาหลี พร้อมหัวหน้าทัวร์ดูแลตลอดทริป'],
    domestic: ['ทัวร์ในประเทศ', 'ทะเลใต้ ภูเขาเหนือ ทริปสั้นวันหยุด รวมตั๋วเครื่องบิน'],
    golf: ['ทัวร์ตีกอล์ฟ', 'ออกรอบสนามดังทั้งในและต่างประเทศ'],
    cruise: ['เรือสำราญ', 'พักผ่อนบนเรือ แวะเที่ยวหลายเมืองท่าในทริปเดียว'],
    search: ['ผลการค้นหา', 'ค้นหาจากชื่อหรือรหัสโปรแกรม ช่วงวันเดินทาง และสายการบิน']
  };
  const HERO = { domestic: ['assets/img/thailand-phiphi.jpg', 'วิวเกาะพีพีจากจุดชมวิว'], golf: ['assets/img/golf-swing.jpg', 'นักกอล์ฟกำลังสวิง'], cruise: ['assets/img/cruise-island.jpg', 'เรือสำราญจอดริมเกาะ'] };

  function initTours() {
    const chips = $('#chips');
    const list = $('#tour-list');
    const q = $('#tour-q');
    const from = $('#tour-from');
    const to = $('#tour-to');
    const airline = $('#tour-airline');
    const sort = $('#tour-sort');
    const count = $('#tour-count');
    fillAirlines(airline);

    chips.innerHTML = FILTERS.map((f) => `<a class="chip" href="#${f.key}" data-key="${f.key}">${f.label}</a>`).join('');
    const current = () => (FILTERS.some((f) => f.key === hashToken()) ? hashToken() : 'all');

    function render() {
      const key = current();
      const filter = FILTERS.find((f) => f.key === key);
      if (to.value && from.value && to.value < from.value) to.value = from.value;
      let tours = T.tours.filter(filter.test)
        .filter((t) => matchQuery(t, q.value.trim()))
        .filter((t) => matchDates(t, from.value, to.value))
        .filter((t) => matchAirline(t, airline.value));
      if (sort.value === 'price-asc') tours.sort((a, b) => a.price - b.price);
      if (sort.value === 'price-desc') tours.sort((a, b) => b.price - a.price);
      if (sort.value === 'date') tours.sort((a, b) => sortedRounds(a)[0].start.localeCompare(sortedRounds(b)[0].start));

      $$('.chip', chips).forEach((c) => c.setAttribute('aria-current', String(c.dataset.key === key)));
      const dest = T.destinations.find((d) => d.key === key);
      const titleKey = hashToken() === 'search' ? 'search' : key;
      const [title, sub] = TITLES[titleKey] || ['ทัวร์' + dest.name, dest.cities];
      $('#tours-title').textContent = title;
      $('#tours-sub').textContent = sub;
      document.title = title + ' | Tako Tour';
      const hero = dest ? [dest.img, dest.alt] : HERO[key] || ['assets/img/italy-dolomites.jpg', 'ทะเลสาบในเทือกเขาโดโลมิติ'];
      $('#tours-hero-img').src = hero[0];
      $('#tours-hero-img').alt = hero[1];

      count.textContent = `พบ ${tours.length} โปรแกรม`;
      list.innerHTML = tours.length ? tours.map(tourCard).join('') : emptyState('ไม่พบโปรแกรมที่ตรงกับการค้นหา', 'ลองเปลี่ยนคำค้น ช่วงวันที่ หรือสายการบิน');
      markActiveNav();
    }

    if (hashToken() === 'search') {
      const s = store.get('tako.search');
      if (s) { q.value = s.q || ''; from.value = s.from || ''; to.value = s.to || ''; airline.value = s.airline || ''; }
    }
    [q, from, to, airline, sort].forEach((el) => el.addEventListener('input', render));
    $('#tour-reset').addEventListener('click', () => { q.value = ''; from.value = ''; to.value = ''; airline.value = ''; sort.value = ''; render(); });
    window.addEventListener('hashchange', () => { render(); window.scrollTo({ top: 0 }); });
    render();
  }

  function initGolf() {
    const chips = $('#golf-chips');
    const list = $('#golf-list');
    const opts = [['all', 'ทั้งหมด'], ['international', 'ต่างประเทศ'], ['domestic', 'ในประเทศ']];
    chips.innerHTML = opts.map(([k, l]) => `<a class="chip" href="#${k}" data-key="${k}">${l}</a>`).join('');
    function render() {
      const key = opts.some(([k]) => k === hashToken()) ? hashToken() : 'all';
      const tours = T.tours.filter((t) => t.type === 'golf' && (key === 'all' || t.region === key));
      $$('.chip', chips).forEach((c) => c.setAttribute('aria-current', String(c.dataset.key === key)));
      list.innerHTML = tours.length ? tours.map(tourCard).join('') : emptyState('ยังไม่มีโปรแกรมในหมวดนี้', 'สอบถามทีมงานเพื่อจัดทริปกอล์ฟส่วนตัว');
      markActiveNav();
    }
    window.addEventListener('hashchange', render);
    render();
  }

  function initCruise() {
    $('#cruise-list').innerHTML = T.tours.filter((t) => t.type === 'cruise').map(tourCard).join('');
  }

  function initPromotions() {
    $('#promo-list').innerHTML = T.tours.filter((t) => t.promo).map(tourCard).join('');
  }

  // Pricing works the same for every type: tour = adult/child, golf = golfer/non-golfer, cruise = cabin price per person.
  function paxLabels(t) {
    if (t.type === 'golf') return [['ผู้ตีกอล์ฟ', 'ราคาผู้ตี'], ['ผู้ติดตาม', 'ไม่ตีกอล์ฟ']];
    if (t.type === 'cruise') return [['ผู้ใหญ่', 'ราคาต่อท่าน พักห้องละ 2 ท่าน'], ['เด็ก', 'ราคาเดียวกับผู้ใหญ่']];
    return [['ผู้ใหญ่', 'อายุ 12 ปีขึ้นไป'], ['เด็ก', 'อายุ 2–11 ปี']];
  }
  function priceFor(t, s) {
    const r = t.rounds[s.round] || t.rounds[0];
    if (t.type === 'cruise') {
      const cabin = t.cabins[s.cabin] || t.cabins[0];
      return cabin.price * (s.adults + s.children);
    }
    return r.adult * s.adults + r.child * s.children;
  }
  const defaultState = (t) => ({ id: t.id, round: 0, cabin: 0, adults: 2, children: 0 });
  function loadState(t) {
    const saved = store.get('tako.booking');
    return saved && saved.id === t.id ? Object.assign(defaultState(t), saved) : defaultState(t);
  }

  function typeSections(t) {
    if (t.type === 'golf') {
      return `
        <section class="panel" style="display: flex; flex-direction: column; gap: 16px;">
          <h2 style="font-size: 22px;">สนามกอล์ฟในโปรแกรม (${t.golfRounds} รอบ)</h2>
          <ul class="course-list">${t.courses.map((c) => `<li>${ICON.flag}<div><strong>${esc(c.name)}</strong><span>${esc(c.note)}</span></div></li>`).join('')}</ul>
        </section>`;
    }
    if (t.type === 'cruise') {
      return `
        <section class="panel" style="display: flex; flex-direction: column; gap: 16px;">
          <h2 style="font-size: 22px;">เส้นทางล่องเรือ</h2>
          <ol class="route">${t.route.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
          <dl class="facts">
            <div><dt>สายเรือ</dt><dd>${esc(t.cruiseLine)}</dd></div>
            <div><dt>ชื่อเรือ</dt><dd>${esc(t.ship)}</dd></div>
            <div><dt>ท่าเรือ</dt><dd>${esc(t.port)}</dd></div>
          </dl>
          <div class="table-wrap"><table><thead><tr><th scope="col">ประเภทห้อง</th><th scope="col">ราคาต่อท่าน (พักห้องละ 2 ท่าน)</th></tr></thead>
            <tbody>${t.cabins.map((c) => `<tr><td>${esc(c.name)}</td><td>${baht(c.price)}</td></tr>`).join('')}</tbody></table></div>
        </section>`;
    }
    return '';
  }

  function crumbsFor(t) {
    if (t.type === 'golf') return `<li><a href="golf.html#${t.region}">ทัวร์ตีกอล์ฟ${t.region === 'domestic' ? ' ในประเทศ' : ' ต่างประเทศ'}</a></li>`;
    if (t.type === 'cruise') return '<li><a href="cruise.html">เรือสำราญ</a></li>';
    return `<li><a href="tours.html#${t.region}">${t.region === 'international' ? 'ทัวร์ต่างประเทศ' : 'ทัวร์ในประเทศ'}</a></li><li aria-hidden="true">/</li><li><a href="tours.html#${t.country}">${esc(t.countryName)}</a></li>`;
  }

  function initTour() {
    const root = $('#tour-root');
    const t = findTour(hashToken());
    if (!t) {
      root.innerHTML = `<div class="empty"><strong>ไม่พบโปรแกรมนี้</strong><span>โปรแกรมอาจปิดการขายแล้ว ลองดูโปรแกรมอื่นที่เปิดจองอยู่</span><a class="btn btn-primary" href="tours.html">ดูทัวร์ทั้งหมด</a></div>`;
      return;
    }
    document.title = `${t.title} ${t.duration} | Tako Tour`;
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', `${t.title} ${t.duration} ${t.airline || t.flight} ราคาเริ่มต้น ${baht(t.price)} จองกับ Tako Tour โทร ${C.phone}`);

    const state = loadState(t);
    const deposit = t.region === 'international' ? 10000 : 3000;
    const [l1, l2] = paxLabels(t);
    const travel = t.airline ? `${t.airline} · ${t.flight}` : t.flight;

    root.innerHTML = `
      <nav aria-label="เส้นทาง"><ol class="crumbs">
        <li><a href="index.html">หน้าแรก</a></li><li aria-hidden="true">/</li>
        ${crumbsFor(t)}<li aria-hidden="true">/</li>
        <li aria-current="page" style="color: var(--ink);">${esc(t.code)}</li>
      </ol></nav>
      <div class="detail-hero"><img src="${t.img}" alt="${esc(t.alt)}" width="1200" height="800"></div>
      <div class="detail-layout">
        <article class="detail-main">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;"><span class="badge ${t.badge.tone}">${esc(t.badge.text)}</span><span class="badge neutral">รหัสโปรแกรม ${esc(t.code)}</span></div>
            <h1 style="font-size: clamp(26px, 3.4vw, 36px);">${esc(t.title)} ${esc(t.duration)}</h1>
            <div class="meta"><span>${ICON.clock}${esc(t.duration)}</span><span>${ICON.plane}${esc(travel)}</span><span>${esc(t.hotel)}</span><span>${esc(t.group)}</span></div>
          </div>
          <section class="panel" style="display: flex; flex-direction: column; gap: 16px;">
            <h2 style="font-size: 22px;">ไฮไลต์ของทริป</h2>
            <ul class="hl-list">${t.highlights.map((h) => `<li>${ICON.check}<span>${esc(h)}</span></li>`).join('')}</ul>
          </section>
          ${typeSections(t)}
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
        <aside class="book" aria-label="จองโปรแกรม">
          <div><small style="color: var(--muted);">${priceLabel(t)}</small><div class="price">${t.promo ? `<s>${baht(t.promo.was)}</s>` : ''}<strong style="font-size: 32px;">${baht(t.price)}</strong></div>${t.promo ? `<span class="badge hot" style="margin-top: 6px;">${esc(t.promo.note)}</span>` : ''}</div>
          <fieldset class="pick">
            <legend>เลือกรอบเดินทาง</legend>
            ${t.rounds.map((r, i) => `
              <button type="button" class="round" data-round="${i}" aria-pressed="${i === state.round}">
                <span class="d"><strong>${fmtRange(r.start, r.end)}</strong><span class="s ${r.seats <= 5 ? 'seat-low' : 'seat-ok'}">${r.seats <= 5 ? 'เหลือ ' + r.seats + ' ที่นั่ง' : 'ว่าง'}</span></span>
                ${t.type === 'cruise' ? '' : `<strong>${baht(r.adult)}</strong>`}
              </button>`).join('')}
          </fieldset>
          ${t.type === 'cruise' ? `
          <fieldset class="pick">
            <legend>ประเภทห้องพัก</legend>
            ${t.cabins.map((c, i) => `<button type="button" class="round" data-cabin="${i}" aria-pressed="${i === state.cabin}"><span class="d"><strong>${esc(c.name)}</strong></span><strong>${baht(c.price)}</strong></button>`).join('')}
          </fieldset>` : ''}
          <div class="stepper"><div><strong id="adult-label">${l1[0]}</strong><br><small style="color: var(--muted);">${l1[1]}</small></div>
            <div class="ctrl" role="group" aria-labelledby="adult-label"><button type="button" data-step="adults:-1" aria-label="ลดจำนวน${l1[0]}">−</button><output id="adults" aria-live="polite"></output><button type="button" data-step="adults:1" aria-label="เพิ่มจำนวน${l1[0]}">+</button></div></div>
          <div class="stepper"><div><strong id="child-label">${l2[0]}</strong><br><small style="color: var(--muted);">${l2[1]}</small></div>
            <div class="ctrl" role="group" aria-labelledby="child-label"><button type="button" data-step="children:-1" aria-label="ลดจำนวน${l2[0]}">−</button><output id="children" aria-live="polite"></output><button type="button" data-step="children:1" aria-label="เพิ่มจำนวน${l2[0]}">+</button></div></div>
          <div class="total"><span>ราคารวม</span><strong id="total" aria-live="polite"></strong></div>
          <a class="btn btn-primary btn-lg btn-block" href="booking.html#${t.id}">จองเลย</a>
          <a class="btn btn-ghost btn-block" href="${C.lineUrl}" target="_blank" rel="noopener">${ICON.line} สอบถามผ่าน LINE ${esc(C.line)}</a>
          <p class="form-note">มัดจำ ${baht(deposit)} / ท่าน ชำระส่วนที่เหลือตามเงื่อนไขใน <a href="how-to-book.html">วิธีการจองและชำระเงิน</a> · โทร ${esc(C.phone)}</p>
        </aside>
      </div>`;

    function update() {
      $('#adults').textContent = state.adults;
      $('#children').textContent = state.children;
      $('#total').textContent = baht(priceFor(t, state));
      $$('[data-round]', root).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.round) === state.round)));
      $$('[data-cabin]', root).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.cabin) === state.cabin)));
      store.set('tako.booking', state);
    }
    $$('[data-round]', root).forEach((b) => b.addEventListener('click', () => { state.round = Number(b.dataset.round); update(); }));
    $$('[data-cabin]', root).forEach((b) => b.addEventListener('click', () => { state.cabin = Number(b.dataset.cabin); update(); }));
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
    const state = loadState(t);
    const [l1, l2] = paxLabels(t);

    $('#bk-tour').innerHTML = `<a href="tour.html#${t.id}">${esc(t.title)}</a> · ${esc(t.duration)}`;
    $('#bk-img').src = t.img;
    $('#bk-img').alt = t.alt;
    $('label[for="bk-adults"]').textContent = l1[0];
    $('label[for="bk-children"]').textContent = l2[0];
    const roundSel = $('#bk-round');
    roundSel.innerHTML = t.rounds.map((r, i) => `<option value="${i}">${fmtRange(r.start, r.end)}${t.type === 'cruise' ? '' : ' · ' + baht(r.adult)}</option>`).join('');
    roundSel.value = String(state.round);
    const cabinField = $('#bk-cabin-field');
    const cabinSel = $('#bk-cabin');
    if (t.type === 'cruise') {
      cabinField.hidden = false;
      cabinSel.innerHTML = t.cabins.map((c, i) => `<option value="${i}">${esc(c.name)} · ${baht(c.price)}</option>`).join('');
      cabinSel.value = String(state.cabin);
    }
    $('#bk-adults').value = state.adults;
    $('#bk-children').value = state.children;

    function read() {
      const s = {
        id: t.id,
        round: Number(roundSel.value),
        cabin: Number(cabinSel.value) || 0,
        adults: Math.max(1, Number($('#bk-adults').value) || 1),
        children: Math.max(0, Number($('#bk-children').value) || 0)
      };
      $('#bk-total').textContent = baht(priceFor(t, s));
      store.set('tako.booking', s);
      return s;
    }
    ['#bk-round', '#bk-cabin', '#bk-adults', '#bk-children'].forEach((sel) => $(sel).addEventListener('input', read));
    read();

    $('#booking-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!e.currentTarget.reportValidity()) return;
      const s = read();
      const r = t.rounds[s.round];
      const ref = 'TK' + Date.now().toString(36).toUpperCase().slice(-6);
      const cabin = t.type === 'cruise' ? ` · ${esc(t.cabins[s.cabin].name)}` : '';
      root.innerHTML = `
        <div class="success" role="status">
          <span class="eyebrow" style="color: var(--lagoon);">รับคำขอจองแล้ว</span>
          <h2 style="font-size: 28px;">หมายเลขคำขอ ${ref}</h2>
          <p>${esc(t.title)} · รอบ ${fmtRange(r.start, r.end)}${cabin} · ${l1[0]} ${s.adults} ท่าน${s.children ? ` ${l2[0]} ${s.children} ท่าน` : ''}</p>
          <p>ทีมงานจะติดต่อกลับทางโทรศัพท์หรือ LINE ภายใน 24 ชั่วโมง เพื่อยืนยันที่นั่งและแจ้งช่องทางชำระมัดจำ</p>
          <p class="form-note">เว็บไซต์ตัวอย่าง: คำขอนี้ยังไม่ถูกส่งถึงทีมงานจริง</p>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;"><a class="btn btn-primary" href="tours.html">ดูโปรแกรมอื่น</a><a class="btn btn-ghost" href="how-to-book.html">ขั้นตอนการชำระเงิน</a></div>
        </div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initDestinations() {
    $('#guides-asia').innerHTML = T.guides.filter((g) => g.region === 'asia').map(guideCard).join('');
    $('#guides-europe').innerHTML = T.guides.filter((g) => g.region === 'europe').map(guideCard).join('');
  }

  function initDestination() {
    const root = $('#guide-root');
    const g = T.guides.find((x) => x.key === hashToken());
    if (!g) {
      root.innerHTML = `<div class="wrap" style="padding-top: 48px;"><div class="empty"><strong>ไม่พบบทความนี้</strong><a class="btn btn-primary" href="destinations.html">ดูสถานที่ท่องเที่ยวทั้งหมด</a></div></div>`;
      return;
    }
    document.title = `เที่ยว${g.name} ${g.tagline} | Tako Tour`;
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', `คู่มือเที่ยว${g.name}: ${g.places.map((p) => p[0]).join(' ')} ช่วงเวลาที่ควรไป และข้อมูลวีซ่าสำหรับคนไทย`);

    const visa = T.visas.find((v) => v.key === g.visaKey);
    const tours = g.tourKey ? T.tours.filter((t) => t.country === g.tourKey) : [];
    const idx = T.guides.indexOf(g);
    const prev = T.guides[(idx - 1 + T.guides.length) % T.guides.length];
    const next = T.guides[(idx + 1) % T.guides.length];
    const F = g.facts;

    root.innerHTML = `
      <section class="page-hero">
        <img src="${g.img}" alt="${esc(g.alt)}" width="1600" height="900">
        <div class="wrap"><span class="eyebrow" style="color: #FFD5C8;">${g.region === 'asia' ? 'เอเชีย' : 'ยุโรป'} · ${esc(g.en)}</span><h1>เที่ยว${esc(g.name)}</h1><p>${esc(g.tagline)}</p></div>
      </section>
      <div class="wrap" style="padding-top: 24px;">
        <nav aria-label="เส้นทาง"><ol class="crumbs"><li><a href="index.html">หน้าแรก</a></li><li aria-hidden="true">/</li><li><a href="destinations.html">สถานที่ท่องเที่ยว</a></li><li aria-hidden="true">/</li><li aria-current="page" style="color: var(--ink);">${esc(g.name)}</li></ol></nav>
      </div>
      <section class="wrap section" style="padding-top: 32px;">
        <div class="two-col">
          <div class="prose">${g.intro.map((p) => `<p style="font-size: 17px;">${esc(p)}</p>`).join('')}</div>
          <dl class="facts panel">
            <div><dt>ช่วงที่ควรไป</dt><dd>${esc(F.best)}</dd></div>
            <div><dt>เวลาบินจากกรุงเทพฯ</dt><dd>${esc(F.flight)}</dd></div>
            <div><dt>สกุลเงิน</dt><dd>${esc(F.currency)}</dd></div>
            <div><dt>เวลา</dt><dd>${esc(F.time)}</dd></div>
            ${visa ? `<div><dt>วีซ่าสำหรับคนไทย</dt><dd><a href="visa.html#${visa.key}">${esc(visa.label)} · ${esc(visa.stay)}</a></dd></div>` : ''}
          </dl>
        </div>
      </section>
      <section class="wrap section">
        <div class="section-head"><div><span class="eyebrow">ห้ามพลาด</span><h2 class="h2">สถานที่แนะนำใน${esc(g.name)}</h2></div></div>
        <div class="grid place-grid">${g.places.map((p) => `<div class="place">${ICON.pinS}<div><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></div></div>`).join('')}</div>
      </section>
      ${g.img2 ? `<section class="wrap section"><figure class="wide-photo"><img src="${g.img2}" alt="${esc(g.alt2)}" loading="lazy" width="1400" height="800"><figcaption>${esc(g.alt2)}</figcaption></figure></section>` : ''}
      <section class="wrap section">
        <div class="panel tips"><h2 style="font-size: 22px;">เคล็ดลับก่อนเดินทาง</h2><ul class="hl-list">${g.tips.map((x) => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join('')}</ul></div>
      </section>
      <section class="wrap section">
        <div class="section-head"><div><span class="eyebrow">ไปกับ Tako Tour</span><h2 class="h2">${tours.length ? 'โปรแกรมเที่ยว' + esc(g.name) : 'อยากเที่ยว' + esc(g.name) + 'กับเรา'}</h2></div>${tours.length ? `<a class="text-link" href="tours.html#${g.tourKey}">ดูทั้งหมด${ICON.arrow}</a>` : ''}</div>
        ${tours.length ? `<div class="grid grid-tours">${tours.map(tourCard).join('')}</div>` : `<div class="empty"><strong>ยังไม่มีทัวร์กรุ๊ปไป${esc(g.name)}ในช่วงนี้</strong><span>ทีมงานจัดทริปส่วนตัวและทำวีซ่าให้ได้</span><a class="btn btn-primary" href="private-group.html">ขอใบเสนอราคา</a></div>`}
      </section>
      <nav class="wrap section pager" aria-label="บทความอื่น">
        <a class="text-link" href="destination.html#${prev.key}">← เที่ยว${esc(prev.name)}</a>
        <a class="text-link" href="destination.html#${next.key}">เที่ยว${esc(next.name)} →</a>
      </nav>`;
  }

  function initVisa() {
    const STATUS = { free: 'good', eta: 'info', evisa: 'info', visa: 'warn' };
    $('#visa-updated').textContent = T.visaUpdated;
    $('#visa-table').innerHTML = T.visas.map((v) => `
      <tr><th scope="row"><a href="#${v.key}">${esc(v.country)}</a></th><td><span class="badge ${STATUS[v.status]}">${esc(v.label)}</span></td><td>${esc(v.stay)}</td></tr>`).join('');
    const row = (label, value) => (value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : '');
    $('#visa-list').innerHTML = T.visas.map((v) => `
      <section class="panel visa-card" id="${v.key}">
        <div class="visa-head"><h2>${esc(v.country)}</h2><span class="badge ${STATUS[v.status]}">${esc(v.label)}</span></div>
        <dl class="facts">
          ${row('ระยะเวลาพำนัก', v.stay)}
          ${row('ประเภทวีซ่า', v.type)}
          ${row('ค่าธรรมเนียมรัฐบาล', v.fee)}
          ${row('ค่าใช้จ่ายอื่น', v.service)}
          ${row('ระยะเวลาพิจารณา', v.time)}
          ${row('ยื่นที่', v.where)}
          ${row('ก่อนเดินทาง', v.pre)}
        </dl>
        <div><h3 style="font-size: 16px; margin-bottom: 6px;">เอกสารที่ใช้</h3><ul class="bullets">${v.docs.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
        ${v.note ? `<p class="visa-note">${esc(v.note)}</p>` : ''}
      </section>`).join('');
    const target = hashToken() && document.getElementById(hashToken());
    if (target) target.scrollIntoView();
  }

  function initFaq() {
    const plus = svg(20, '<path d="M12 5v14M5 12h14"/>');
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
      item(C.facebookUrl, ICON.fb, 'Facebook', C.facebook, true),
      item(C.instagramUrl, ICON.ig, 'Instagram', C.instagram, true),
      item('mailto:' + C.email, ICON.mail, 'อีเมล', C.email),
      item(C.mapUrl, ICON.pin, 'ที่อยู่ (เปิดใน Google Maps)', C.address, true)
    ].join('');
  }

  // ---------- boot ----------
  renderHeader();
  renderFooter();
  wireDemoForms();
  const inits = {
    home: initHome, tours: initTours, tour: initTour, booking: initBooking, promotions: initPromotions, faq: initFaq,
    golf: initGolf, cruise: initCruise, destinations: initDestinations, destination: initDestination, visa: initVisa
  };
  const page = document.body.dataset.page;
  if (inits[page]) inits[page]();
  if (page === 'destination') window.addEventListener('hashchange', () => { initDestination(); window.scrollTo({ top: 0 }); });
  if (page === 'tour') window.addEventListener('hashchange', () => { initTour(); window.scrollTo({ top: 0 }); });
  initContact();
})();
