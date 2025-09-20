// site.js — shared across pages

// 1) Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 2) Header shrink on scroll
(function(){
  const hdr = document.querySelector('.site-header');
  if(!hdr) return;
  addEventListener('scroll', () => hdr.classList.toggle('is-scrolled', scrollY > 4), {passive:true});
})();

// 3) Mouse / touch orb → updates CSS vars --orb-x / --orb-y
(function () {
  const root = document.documentElement;
  // pretty defaults before first move
  root.style.setProperty('--orb-x', '72%');
  root.style.setProperty('--orb-y', '68%');

  let raf = 0;
  function onPoint(e){
    const t = e.touches ? e.touches[0] : e;
    const x = (t.clientX / innerWidth)  * 100;
    const y = (t.clientY / innerHeight) * 100;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      root.style.setProperty('--orb-x', x.toFixed(2) + '%');
      root.style.setProperty('--orb-y', y.toFixed(2) + '%');
    });
  }
  addEventListener('pointermove', onPoint, {passive:true});
  addEventListener('touchmove',   onPoint, {passive:true});
})();

// 4) Iridescent wave: boost on move + slow hue orbit
(function(){
  const wave = document.querySelector('.iridescent-wave');
  if(!wave) return;
  let boostTimer = 0, rot = 0;
  function boost(){
    wave.classList.add('boost');
    clearTimeout(boostTimer);
    boostTimer = setTimeout(()=> wave.classList.remove('boost'), 900);
  }
  function tick(){
    rot = (rot + 0.35) % 360; // slow continuous hue orbit
    document.documentElement.style.setProperty('--wave-rot', rot + 'deg');
    requestAnimationFrame(tick);
  }
  addEventListener('pointermove', boost, {passive:true});
  addEventListener('touchmove',   boost, {passive:true});
  tick();
})();

// 5) Full-view lens (no clipping) → updates --lx / --ly (in px)
(function(){
  const root = document.documentElement;
  // Base radius (smaller on phones)
  const mobile = matchMedia('(max-width: 640px)').matches;
  root.style.setProperty('--lr', (mobile ? 110 : 140) + 'px');

  function moveLens(e){
    const t = e.touches ? e.touches[0] : e;
    root.style.setProperty('--lx', t.clientX.toFixed(1) + 'px');
    root.style.setProperty('--ly', t.clientY.toFixed(1) + 'px');
  }
  addEventListener('pointermove', moveLens, {passive:true});
  addEventListener('touchmove',   moveLens, {passive:true});

  // init somewhere pleasant
  root.style.setProperty('--lx', (innerWidth*0.72).toFixed(1) + 'px');
  root.style.setProperty('--ly', (innerHeight*0.68).toFixed(1) + 'px');
})();

// 6) Sprinkle plusses (only if .plus-field exists)
document.addEventListener('DOMContentLoaded', () => {
  const field = document.querySelector('.plus-field');
  if (!field) return;

  const phone = matchMedia('(max-width: 640px)').matches;
  const COUNT = phone ? 12 : 24;
  const rand = (a,b)=>Math.random()*(b-a)+a;
  const bias = p => Math.pow(Math.random(), p);
  for (let i=0; i<COUNT; i++){
    const el = document.createElement('span');
    el.className = 'plus';
    el.textContent = '+';
    const rx = bias(1.6), ry = bias(1.6);
    el.style.right  = (rx * 60).toFixed(2) + 'vw';
    el.style.bottom = (ry * 60).toFixed(2) + 'vh';
    el.style.setProperty('--alpha', rand(0.35, 0.6).toFixed(2));
    el.style.setProperty('--rot',   rand(-6, 6).toFixed(1) + 'deg');
    el.style.fontSize = Math.round(rand(18, 46)) + 'px';
    el.style.setProperty('--driftDur',   rand(10, 16).toFixed(2) + 's');
    el.style.setProperty('--shineDur',   rand(3.0, 4.8).toFixed(2) + 's');
    field.appendChild(el);
  }
});

// 7) ✨ Global reveal-on-load/scroll (hero, cards, footer… anything with [data-animate])
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = Array.from(document.querySelectorAll('[data-animate]'));
  if (!nodes.length) return;

  // Auto-stagger in DOM order unless element sets its own --stagger inline
  let auto = 0;
  const STEP = 70; // ms
  nodes.forEach(el => {
    if (!el.style.getPropertyValue('--stagger')){
      el.style.setProperty('--stagger', `${auto}ms`);
      auto += STEP;
    }
  });

  const reveal = el => el.classList.add('is-in');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    nodes.forEach(reveal);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.22 });

  nodes.forEach(el => io.observe(el));

  // Nudge above-the-fold on load (feels instant on fast pages)
  addEventListener('load', () => {
    requestAnimationFrame(() => {
      nodes.slice(0, 6).forEach(reveal);
    });
  });
})();

// 8) Feature-card tilt + iridescent sheen
(function(){
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach(card => {
    let raf = 0;
    function onMove(ev){
      if (!fine || prefersReduced) return;
      const r = card.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width;
      const y = (ev.clientY - r.top)  / r.height;

      const ry = (x - 0.5) * 12; // rotateY
      const rx = (0.5 - y) * 8;  // rotateX

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--mx', (x*100).toFixed(2) + '%');
        card.style.setProperty('--my', (y*100).toFixed(2) + '%');
      });
    }
    function onEnter(){ if (!prefersReduced) card.classList.add('is-hot'); }
    function onLeave(){
      card.classList.remove('is-hot');
      card.style.setProperty('--ry','0deg');
      card.style.setProperty('--rx','0deg');
    }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
  });
})();


// 9) favi scroll
(function () {
  const gap = "   "; // spacing between loops
  const msg = "chrrybmb — who looks inside awakes ⋆˙⟡";
  const scrollText = (msg + gap);
  let i = 0;

  function tick(){
    // rotate the string
    document.title = scrollText.slice(i) + scrollText.slice(0, i);
    i = (i + 1) % scrollText.length;
  }

  let timer = setInterval(tick, 200); // speed: smaller = faster (e.g., 120)

  // respect reduced motion
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  function setMotion(e){
    if (e.matches) { clearInterval(timer); document.title = msg; }
    else { clearInterval(timer); timer = setInterval(tick, 200); }
  }
  setMotion(m);
  m.addEventListener("change", setMotion);

  // optional: pause when user is on the tab to reduce distraction
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { setMotion({matches:false}); }
    else { setMotion(m); }
  });
})();

// 10) ux checklist accordion
(function(){
  const acc = document.querySelector('.ux-acc');
  if(!acc) return;

  acc.addEventListener('click', (e)=>{
    const btn = e.target.closest('.ux-acc__btn');
    if(!btn) return;
    const pane = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    pane.hidden = open;
  });

  // keyboard help (Enter/Space already click buttons, but this helps arrowing)
  const buttons = acc.querySelectorAll('.ux-acc__btn');
  acc.addEventListener('keydown', (e)=>{
    const idx = Array.prototype.indexOf.call(buttons, document.activeElement);
    if(idx < 0) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); buttons[(idx+1)%buttons.length].focus(); }
    if(e.key === 'ArrowUp'){ e.preventDefault(); buttons[(idx-1+buttons.length)%buttons.length].focus(); }
    if(e.key === 'Home'){ e.preventDefault(); buttons[0].focus(); }
    if(e.key === 'End'){ e.preventDefault(); buttons[buttons.length-1].focus(); }
  });

  // optional: open first by default
  // const firstBtn = buttons[0]; const firstPane = document.getElementById(firstBtn.getAttribute('aria-controls'));
  // firstBtn.setAttribute('aria-expanded','true'); firstPane.hidden = false;
})();
// site.js — search overlay (mini, robust, page-safe)
(function initSearch() {
  const dlg   = document.getElementById('search');
  const openBtn = document.getElementById('openSearch');
  const input = document.getElementById('searchInput');
  const list  = document.getElementById('searchResults');

  // if this page doesn’t have the search markup, bail gracefully
  if (!dlg || !openBtn || !input || !list) return;

  // tiny index — adjust to your routes
  const INDEX = [
    { title: 'home',            url: '/index.html',           path: 'chrrybmb' },
    { title: 'about',           url: '/about.html',           path: 'about' },
    { title: 'contact',         url: '/contact.html',         path: 'contact' },
    { title: 'web ux',          url: '/web-ux.html',          path: 'ux' },
    { title: 'brand systems',   url: '/brand-systems.html',   path: 'brand' },
    { title: 'work — ux',       url: '/work.html#ux',         path: 'work' },
    { title: '404',             url: '/404.html',             path: 'system' }
  ];

  const render = (items, selectFirst = true) => {
    list.innerHTML = items.length
      ? items.map((it,i)=>`
        <li role="option" ${selectFirst && i===0 ? 'aria-selected="true"' : ''} data-i="${i}">
          <a href="${it.url}">${it.title}</a>
          <span class="path">${it.path}</span>
        </li>`).join('')
      : `<li aria-disabled="true"><span class="path">no results</span></li>`;
  };

  const filter = q => {
    q = q.trim().toLowerCase();
    if (!q) return INDEX;
    return INDEX.filter(it =>
      it.title.toLowerCase().includes(q) ||
      it.path.toLowerCase().includes(q) ||
      it.url.toLowerCase().includes(q)
    );
  };

  const select = delta => {
    const items = [...list.querySelectorAll('li[role="option"]')];
    if (!items.length) return;
    const cur = items.findIndex(li => li.getAttribute('aria-selected') === 'true');
    const next = Math.max(0, Math.min(items.length - 1, (cur === -1 ? 0 : cur + delta)));
    items.forEach((li,i)=> li.setAttribute('aria-selected', i===next ? 'true' : 'false'));
    items[next]?.scrollIntoView({ block:'nearest' });
  };

  const open = () => {
    dlg.hidden = false;
    render(INDEX);
    input.value = '';
    requestAnimationFrame(() => input.focus());
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    dlg.hidden = true;
    document.body.style.overflow = '';
    openBtn?.focus();
  };

  // events
  openBtn.addEventListener('click', open);
  dlg.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) close(); });
  input.addEventListener('input', e => render(filter(e.target.value)));

  // keyboard inside the dialog
  dlg.addEventListener('keydown', e => {
    if (e.key === 'Escape')       { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown'){ e.preventDefault(); select(1); }
    else if (e.key === 'ArrowUp')  { e.preventDefault(); select(-1); }
    else if (e.key === 'Enter') {
      const sel = list.querySelector('li[aria-selected="true"] a');
      if (sel) window.location.href = sel.getAttribute('href');
    }
  });

  // global shortcut ⌘K / Ctrl+K
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') {
      e.preventDefault();
      dlg.hidden ? open() : close();
    }
  });
})();

// close on ESC from anywhere while dialog is open
document.addEventListener('keydown', (e)=>{
  if (!dlg.hidden && e.key === 'Escape') {
    e.preventDefault();
    close();
  }
});

// also catch ESC specifically on the search input (Safari clears instead)
input.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  }
});


// open/close helpers defined earlier...
// const open = () => { ... }
// const close = () => { ... }

// 1) Delegated close for backdrop *and* the pill
dlg.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) {
    e.preventDefault();
    close();
  }
});

// 2) Close on Escape from anywhere while dialog is open
document.addEventListener('keydown', (e) => {
  if (!dlg.hidden && e.key === 'Escape') {
    e.preventDefault();
    close();
  }
});

// Seamless marquee: build ONE exact cycle wide enough for the viewport,
// then render it TWICE and animate exactly one cycle width.
(function initMarquees(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.marquee[data-allow-motion]').forEach(host => {
    const track = host.querySelector('.marquee__track');
    if (!track) return;

    // template: original content nodes
    const template = [...track.children].map(n => n.cloneNode(true));

    function build(){
      // 1) Start clean, build ONE cycle that is at least as wide as the container
      track.replaceChildren();                       // empty
      const containerW = host.getBoundingClientRect().width || host.clientWidth;

      // keep repeating original phrase until we cover container width
      do { template.forEach(n => track.appendChild(n.cloneNode(true))); }
      while (track.scrollWidth < containerW);

      // Measure this ONE cycle width
      const oneCycleW = track.scrollWidth;

      // 2) Duplicate that exact cycle once more (now we have exactly TWO cycles)
      const oneCycleNodes = [...track.children].map(n => n.cloneNode(true));
      oneCycleNodes.forEach(n => track.appendChild(n)); // total width = 2 * oneCycleW

      // 3) Animate by exactly ONE cycle width for a perfect wrap
      track.style.setProperty('--loop-distance', oneCycleW + 'px');

      // 4) Duration from pixels-per-second (consistent speed everywhere)
      const pps = parseFloat(getComputedStyle(host).getPropertyValue('--pps')) || 80;
      track.style.setProperty('--dur', (oneCycleW / pps) + 's');
    }

    build();

    // Rebuild on resize / orientation change
    let raf = 0;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(build); };
    addEventListener('resize', onResize, { passive:true });
  });
})();

// Restart marquee animations (fix occasional iOS stall after navigation/back)
(() => {
  const lanes = document.querySelectorAll('.xm-marquee .xm-lane');
  lanes.forEach(l => {
    l.style.animation = 'none';
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    l.offsetHeight;
    l.style.animation = '';
  });
})();
