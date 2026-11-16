const triggers = [...document.querySelectorAll('.nav-trigger')];
const panels = [...document.querySelectorAll('.mega-menu')];

function closeMenus() {
  triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
  panels.forEach((panel) => { panel.hidden = true; });
}

triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const panel = document.querySelector(`[data-panel="${trigger.dataset.menu}"]`);
    const opening = trigger.getAttribute('aria-expanded') !== 'true';
    closeMenus();
    if (opening) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenus();
    document.getElementById('mobileNav').hidden = true;
    document.getElementById('menuButton').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
});

const mobileNav = document.getElementById('mobileNav');
const menuButton = document.getElementById('menuButton');
const mobileClose = document.getElementById('mobileClose');

function setMobile(open) {
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (open) mobileClose.focus(); else menuButton.focus();
}

menuButton.addEventListener('click', () => setMobile(true));
mobileClose.addEventListener('click', () => setMobile(false));
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMobile(false)));

const searchDialog = document.getElementById('searchDialog');
document.getElementById('searchButton').addEventListener('click', () => searchDialog.showModal());

const utilityDialog = document.getElementById('utilityDialog');
const utilityTitle = document.getElementById('utilityTitle');
const utilityBody = document.getElementById('utilityBody');
document.querySelectorAll('.utility-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    utilityTitle.textContent = trigger.dataset.title;
    utilityBody.textContent = trigger.dataset.body;
    utilityDialog.showModal();
  });
});

document.querySelectorAll('.detail-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.detail-item').forEach((button) => button.classList.remove('active'));
    item.classList.add('active');
    const image = document.getElementById('detailImage');
    image.style.opacity = '0';
    window.setTimeout(() => {
      image.src = item.dataset.image;
      image.style.opacity = '1';
    }, 170);
  });
});

const collectionData = {
  all: {
    hero: { src: 'assets/kitchen-concept.png', alt: 'Built-in Qreanova ovens in a premium kitchen', focus: '74% 55%' },
    items: ['chimneys', 'hobs', 'ovens']
  },
  chimneys: {
    hero: { src: 'assets/offer-kitchen.png', alt: 'Black glass Qreanova chimney above a gas hob', focus: '83% 45%' },
    items: [
      { src: 'assets/chimney-1.png', alt: 'Black glass angled chimney', name: 'Angled glass chimney', type: 'Chimneys' },
      { src: 'assets/chimney-2.png', alt: 'Stainless steel T-shape chimney', name: 'T-shape chimney', type: 'Chimneys' },
      { src: 'assets/chimney-3.png', alt: 'Curved glass chimney', name: 'Curved glass chimney', type: 'Chimneys' },
      { src: 'assets/chimney-4.png', alt: 'Ceiling-integrated chimney', name: 'Built-in chimney', type: 'Chimneys' }
    ]
  },
  hobs: {
    hero: { src: 'assets/offer-built-in.png', alt: 'Glass hob set into a stone countertop', focus: '18% 70%' },
    items: [
      { src: 'assets/product-hob.png', alt: 'Black glass gas hob', name: 'Glass gas hob', type: 'Hobs' },
      { src: 'assets/product-cooktop.png', alt: 'Stainless steel cooktop', name: 'Stainless cooktop', type: 'Cooktops' },
      { src: 'assets/product-induction.png', alt: 'Infrared induction cooktop', name: 'Infrared induction', type: 'Hobs' }
    ]
  },
  ovens: {
    hero: { src: 'assets/oven-concept.png', alt: 'Built-in oven in a warm stone kitchen', focus: '68% 45%' },
    items: [
      { src: 'assets/product-oven.png', alt: 'Built-in oven', name: 'Built-in oven', type: 'Ovens' },
      { src: 'assets/product-microwave.png', alt: 'Built-in microwave', name: 'Built-in microwave', type: 'Microwaves' }
    ]
  }
};
collectionData.all.items = collectionData.all.items.flatMap((key) => collectionData[key].items);

const collectionShowcase = document.getElementById('collectionShowcase');
if (collectionShowcase) {
  const hero = document.getElementById('collectionHero');
  const slider = document.getElementById('collectionSlider');
  const tabs = [...document.querySelectorAll('.collection-tabs [role="tab"]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GAP = 14;
  const INTERVAL = 3200;
  const FADE = 550;
  let track = document.getElementById('collectionTrack');
  let count = 0;
  let start = 0;
  let index = 0;
  let step = 0;
  let offset = 0;
  let cardWidth = 0;
  let timer;
  let paused = false;
  let switching = false;

  const cardHTML = (item) => `<article class="collection-card"><img src="${item.src}" alt="${item.alt}" loading="lazy"><h3>${item.name}</h3></article>`;

  function measure() {
    const overlay = getComputedStyle(hero).position === 'absolute';
    const width = slider.clientWidth;
    offset = overlay ? hero.offsetWidth + GAP : 0;
    const visible = width - offset;
    const perView = overlay ? (visible > 520 ? 2.2 : 1.2) : 1;
    const gaps = Number.isInteger(perView) ? perView - 1 : Math.floor(perView);
    cardWidth = overlay ? (visible - GAP * gaps) / perView : width * 0.72;
    step = cardWidth + GAP;
  }

  function position(el, animate) {
    el.style.transition = animate ? 'transform .7s cubic-bezier(.65,0,.35,1), opacity .55s ease' : 'opacity .55s ease';
    el.style.transform = `translate3d(${offset - index * step}px,0,0)`;
  }

  function onTrackEnd(event) {
    if (event.propertyName !== 'transform' || event.currentTarget !== track) return;
    if (index >= start + count || index <= start - count) {
      index = start + (((index - start) % count) + count) % count;
      position(track, false);
    }
  }

  function fill(el, key) {
    const items = collectionData[key].items;
    count = items.length;
    const copies = Math.max(5, Math.ceil(16 / count));
    el.innerHTML = Array.from({ length: copies }, () => items.map(cardHTML).join('')).join('');
    start = count * Math.floor(copies / 2);
    index = start;
    el.querySelectorAll('.collection-card').forEach((card) => { card.style.width = `${cardWidth}px`; });
    position(el, false);
  }

  function layout() {
    measure();
    track.querySelectorAll('.collection-card').forEach((card) => { card.style.width = `${cardWidth}px`; });
    position(track, false);
  }

  function move(direction) {
    if (switching) return;
    index += direction;
    position(track, true);
  }

  function play() {
    window.clearInterval(timer);
    if (reduceMotion) return;
    timer = window.setInterval(() => { if (!paused && !document.hidden) move(1); }, INTERVAL);
  }

  function setHero(h, animate) {
    const current = hero.querySelector('img');
    hero.style.setProperty('--focus', h.focus);
    if (!animate) { current.src = h.src; current.alt = h.alt; return; }
    const next = new Image();
    next.src = h.src;
    next.alt = h.alt;
    next.className = 'is-entering';
    const reveal = () => {
      hero.appendChild(next);
      requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('is-entering')));
      window.setTimeout(() => current.remove(), FADE + 50);
    };
    if (next.complete) reveal(); else next.addEventListener('load', reveal, { once: true });
  }

  // Crossfade: the new card set fades in over the old one, no blank frame
  function show(key) {
    switching = true;
    window.clearInterval(timer);
    setHero(collectionData[key].hero, true);
    const oldTrack = track;
    const next = document.createElement('div');
    next.className = 'collection-track is-entering';
    next.addEventListener('transitionend', onTrackEnd);
    measure();
    fill(next, key);
    slider.appendChild(next);
    track = next;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      next.classList.remove('is-entering');
      oldTrack.classList.add('is-leaving');
    }));
    window.setTimeout(() => { oldTrack.remove(); switching = false; play(); }, FADE + 50);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.getAttribute('aria-selected') === 'true') return;
      tabs.forEach((button) => button.setAttribute('aria-selected', String(button === tab)));
      show(tab.dataset.category);
    });
  });

  document.querySelector('.collection-prev')?.addEventListener('click', () => { move(-1); play(); });
  document.querySelector('.collection-next')?.addEventListener('click', () => { move(1); play(); });
  collectionShowcase.addEventListener('mouseenter', () => { paused = true; });
  collectionShowcase.addEventListener('mouseleave', () => { paused = false; });
  collectionShowcase.addEventListener('focusin', () => { paused = true; });
  collectionShowcase.addEventListener('focusout', () => { paused = false; });
  window.addEventListener('resize', layout);

  track.addEventListener('transitionend', onTrackEnd);
  setHero(collectionData.all.hero, false);
  measure();
  fill(track, 'all');
  play();
}

/* Compare: tray (bottom-left) + panel that slides down from the top */
const compareTray = document.getElementById('compareTray');
const comparePanel = document.getElementById('comparePanel');
if (compareTray && comparePanel) {
  const MAX_COMPARE = 4;
  const checks = [...document.querySelectorAll('.compare-check')];
  const slots = document.getElementById('compareSlots');
  const specs = document.getElementById('compareSpecs');
  const title = document.getElementById('compareTitle');
  const count = document.getElementById('compareCount');
  const highlight = document.getElementById('compareHighlight');
  const specsToggle = document.getElementById('compareSpecsToggle');
  const PENDING = 'Awaiting verified data';
  const SPEC_ROWS = [
    ['Category', (c) => c.dataset.category],
    ['Style', (c) => c.dataset.style],
    ['Finish', (c) => c.dataset.finish],
    ['SKU', (c) => c.dataset.sku],
    ['Price', (c) => c.dataset.price],
    ['MRP', (c) => c.dataset.mrp],
    ['Suction / capacity', () => PENDING],
    ['Warranty', () => PENDING]
  ];
  let lastFocus;

  const selected = () => checks.filter((check) => check.checked).map((check) => check.closest('.shop-card'));

  function renderTray() {
    const n = selected().length;
    count.textContent = n;
    compareTray.hidden = n === 0;
    if (n === 0 && comparePanel.classList.contains('open')) closePanel();
  }

  function renderPanel() {
    const cards = selected();
    title.textContent = `Compare ${cards.length} Product${cards.length === 1 ? '' : 's'}`;
    slots.innerHTML = Array.from({ length: MAX_COMPARE }, (_, i) => {
      const card = cards[i];
      if (!card) return `<div class="compare-slot"><div class="compare-empty"><span>${i + 1}</span></div></div>`;
      const img = card.querySelector('.shop-media img');
      return `<div class="compare-slot"><div class="compare-slot-media"><img src="${img.getAttribute('src')}" alt="${img.alt}"><button class="compare-remove" type="button" data-index="${checks.indexOf(card.querySelector('.compare-check'))}" aria-label="Remove ${card.dataset.name}">×</button></div><small>${card.dataset.sku}</small><h3>${card.dataset.name}</h3><p class="compare-style">${card.dataset.style}</p><p class="compare-price"><b>${card.dataset.price}</b><s>${card.dataset.mrp}</s></p><button class="button planned-link" type="button" data-message="Add to cart will connect to a verified Shopify variant.">Add to Cart</button></div>`;
    }).join('');
    specs.innerHTML = SPEC_ROWS.map(([label, get]) => {
      const values = cards.map(get);
      const different = cards.length > 1 && new Set(values).size > 1;
      const cells = Array.from({ length: MAX_COMPARE }, (_, i) => `<span>${values[i] ?? ''}</span>`).join('');
      return `<div class="compare-row" data-different="${different}"><span>${label}</span>${cells}</div>`;
    }).join('');
    applyHighlight();
    slots.querySelectorAll('.planned-link').forEach((control) => control.addEventListener('click', () => showToast(control.dataset.message)));
  }

  function openPanel() {
    renderPanel();
    lastFocus = document.activeElement;
    comparePanel.classList.add('open');
    comparePanel.setAttribute('aria-hidden', 'false');
    compareTray.setAttribute('aria-expanded', 'true');
    document.body.classList.add('compare-open');
    comparePanel.scrollTop = 0;
    window.setTimeout(() => document.getElementById('compareClose').focus(), 300);
  }

  function closePanel() {
    comparePanel.classList.remove('open');
    comparePanel.setAttribute('aria-hidden', 'true');
    compareTray.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('compare-open');
    lastFocus?.focus?.();
  }

  checks.forEach((check) => {
    check.addEventListener('change', () => {
      if (check.checked && selected().length > MAX_COMPARE) {
        check.checked = false;
        showToast(`You can compare up to ${MAX_COMPARE} products.`);
      }
      renderTray();
      if (comparePanel.classList.contains('open')) renderPanel();
    });
  });

  slots.addEventListener('click', (event) => {
    const remove = event.target.closest('.compare-remove');
    if (!remove) return;
    checks[Number(remove.dataset.index)].checked = false;
    renderTray();
    if (selected().length) renderPanel();
  });

  compareTray.addEventListener('click', openPanel);
  document.getElementById('compareClose').addEventListener('click', closePanel);
  document.getElementById('compareContinue').addEventListener('click', closePanel);
  comparePanel.addEventListener('click', (event) => { if (event.target === comparePanel) closePanel(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && comparePanel.classList.contains('open')) closePanel(); });
  function applyHighlight() {
    const on = highlight.checked;
    const enough = selected().length > 1;
    specs.classList.toggle('is-highlighting', on && enough);
    specs.querySelectorAll('.compare-row').forEach((row) => row.classList.toggle('is-different', on && enough && row.dataset.different === 'true'));
    document.getElementById('compareHint').hidden = !(on && !enough);
  }
  highlight.addEventListener('change', applyHighlight);
  specsToggle.addEventListener('click', () => {
    const open = specsToggle.getAttribute('aria-expanded') !== 'true';
    specsToggle.setAttribute('aria-expanded', String(open));
    specs.hidden = !open;
  });

  renderTray();
}

// Shared infinite slider: rotates the real elements (no clones), so checkboxes and listeners keep working
function createLoopSlider({ viewport, track, perView, interval = 3200, gap = 14, prev, next }) {
  if (!viewport || !track) return null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = 0;
  let visible = 1;
  let busy = false;
  let paused = false;
  let timer;
  const EASE = 'transform .7s cubic-bezier(.65,0,.35,1)';

  function layout() {
    const width = viewport.clientWidth;
    visible = perView(width);
    const gaps = Number.isInteger(visible) ? visible - 1 : Math.floor(visible);
    const itemWidth = (width - gap * gaps) / visible;
    step = itemWidth + gap;
    [...track.children].forEach((item) => { item.style.width = `${itemWidth}px`; });
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
  }

  const canLoop = () => track.children.length > Math.ceil(visible);

  function slide(direction) {
    if (busy || !canLoop()) return;
    busy = true;
    if (direction > 0) {
      track.style.transition = EASE;
      track.style.transform = `translate3d(${-step}px,0,0)`;
      track.addEventListener('transitionend', () => {
        track.style.transition = 'none';
        track.appendChild(track.firstElementChild);
        track.style.transform = 'translate3d(0,0,0)';
        busy = false;
      }, { once: true });
    } else {
      track.style.transition = 'none';
      track.prepend(track.lastElementChild);
      track.style.transform = `translate3d(${-step}px,0,0)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        track.style.transition = EASE;
        track.style.transform = 'translate3d(0,0,0)';
      }));
      track.addEventListener('transitionend', () => { busy = false; }, { once: true });
    }
  }

  function play() {
    window.clearInterval(timer);
    if (reduceMotion) return;
    timer = window.setInterval(() => { if (!paused && !document.hidden) slide(1); }, interval);
  }

  prev?.addEventListener('click', () => { slide(-1); play(); });
  next?.addEventListener('click', () => { slide(1); play(); });
  const area = viewport.parentElement;
  area.addEventListener('mouseenter', () => { paused = true; });
  area.addEventListener('mouseleave', () => { paused = false; });
  area.addEventListener('focusin', () => { paused = true; });
  area.addEventListener('focusout', () => { paused = false; });
  window.addEventListener('resize', layout);
  layout();
  play();
  return { refresh() { busy = false; layout(); play(); } };
}

createLoopSlider({
  viewport: document.getElementById('launchViewport'),
  track: document.getElementById('launchRail'),
  perView: (w) => (w > 1120 ? 4.5 : w > 760 ? 3.2 : w > 520 ? 2.2 : 1.15),
  interval: 3600,
  prev: document.querySelector('.rail-prev'),
  next: document.querySelector('.rail-next')
});

// Kitchen Knowledge: 3.2 cards visible, infinite autoplay every 3.2s, filter tabs rebuild the set
const blogRail = document.getElementById('blogRail');
const blogCards = blogRail ? [...blogRail.children] : [];
const blogSlider = createLoopSlider({
  viewport: document.getElementById('blogViewport'),
  track: blogRail,
  perView: (w) => (w > 1120 ? 3.2 : w > 760 ? 2.2 : 1.15),
  interval: 3200,
  prev: document.querySelector('.blog-prev'),
  next: document.querySelector('.blog-next')
});
document.querySelectorAll('[data-blog-filter]').forEach((filter) => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('[data-blog-filter]').forEach((button) => button.setAttribute('aria-selected', String(button === filter)));
    const category = filter.dataset.blogFilter;
    const matching = blogCards.filter((card) => category === 'all' || card.dataset.blogCategory === category);
    blogRail.style.opacity = '0';
    window.setTimeout(() => {
      blogRail.replaceChildren(...matching);
      matching.forEach((card) => { card.hidden = false; });
      blogSlider?.refresh();
      blogRail.style.opacity = '1';
    }, 220);
  });
});

// The Thinking Behind Qreanova: 3.5 cards visible, infinite autoplay
createLoopSlider({
  viewport: document.getElementById('inspireViewport'),
  track: document.getElementById('inspireTrack'),
  perView: (w) => (w > 1120 ? 3.5 : w > 760 ? 2.5 : 1.2),
  gap: 20,
  interval: 3400,
  prev: document.querySelector('.inspire-prev'),
  next: document.querySelector('.inspire-next')
});

// Designed Around the Details: small image slideshow with pause/play
const featureThumb = document.getElementById('featureThumb');
if (featureThumb) {
  const slides = [...featureThumb.querySelectorAll('img')];
  const pause = document.getElementById('featurePause');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let running = !reduceMotion;
  let timer;
  const advance = () => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  };
  const sync = () => {
    window.clearInterval(timer);
    if (running) timer = window.setInterval(() => { if (!document.hidden) advance(); }, 4000);
    pause.setAttribute('aria-pressed', String(!running));
    pause.setAttribute('aria-label', running ? 'Pause slideshow' : 'Play slideshow');
    pause.innerHTML = `<i class="fa-solid ${running ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>`;
  };
  pause.addEventListener('click', () => { running = !running; sync(); });
  sync();
}

searchDialog.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.getElementById('siteSearch').value.trim();
  if (!query) {
    showToast('Enter a category, model name or model code.');
    return;
  }
  searchDialog.close();
  showToast(`Search is ready for Shopify data: “${query}”`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.addEventListener('visibilitychange', () => {
  document.querySelectorAll('video').forEach((video) => {
    if (document.hidden) video.pause();
    else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {});
  });
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video').forEach((video) => video.pause());
}
