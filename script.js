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
    hero: { src: 'assets/kitchen-concept.png', alt: 'Premium integrated kitchen with Qreanova appliances', kicker: 'Complete kitchen view', title: 'Appliances designed to belong together' },
    items: ['chimneys', 'hobs', 'ovens']
  },
  chimneys: {
    hero: { src: 'assets/offer-kitchen.png', alt: 'Black glass Qreanova chimney above a gas hob', kicker: 'Ventilation', title: 'Chimneys that keep the kitchen clear' },
    items: [
      { src: 'assets/chimney-1.png', alt: 'Black glass angled chimney', name: 'Angled glass chimney', type: 'Chimneys' },
      { src: 'assets/chimney-2.png', alt: 'Stainless steel T-shape chimney', name: 'T-shape chimney', type: 'Chimneys' },
      { src: 'assets/chimney-3.png', alt: 'Curved glass chimney', name: 'Curved glass chimney', type: 'Chimneys' },
      { src: 'assets/chimney-4.png', alt: 'Ceiling-integrated chimney', name: 'Built-in chimney', type: 'Chimneys' }
    ]
  },
  hobs: {
    hero: { src: 'assets/offer-built-in.png', alt: 'Glass hob set into a stone countertop', kicker: 'Cooking surfaces', title: 'Hobs and cooktops for everyday cooking' },
    items: [
      { src: 'assets/product-hob.png', alt: 'Black glass gas hob', name: 'Glass gas hob', type: 'Hobs' },
      { src: 'assets/product-cooktop.png', alt: 'Stainless steel cooktop', name: 'Stainless cooktop', type: 'Cooktops' },
      { src: 'assets/product-induction.png', alt: 'Infrared induction cooktop', name: 'Infrared induction', type: 'Hobs' }
    ]
  },
  ovens: {
    hero: { src: 'assets/oven-concept.png', alt: 'Built-in oven in a warm stone kitchen', kicker: 'Built-in cooking', title: 'Ovens and microwaves made to fit in' },
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
  const heroImg = hero.querySelector('img');
  const heroKicker = document.getElementById('collectionHeroKicker');
  const heroTitle = document.getElementById('collectionHeroTitle');
  const slider = document.getElementById('collectionSlider');
  const track = document.getElementById('collectionTrack');
  const tabs = [...document.querySelectorAll('.collection-tabs [role="tab"]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GAP = 14;
  const INTERVAL = 3200;
  let count = 0;
  let start = 0;
  let index = 0;
  let step = 0;
  let offset = 0;
  let timer;
  let paused = false;

  const cardHTML = (item) => `<article class="collection-card"><img src="${item.src}" alt="${item.alt}" loading="lazy"><div><strong>${item.name}</strong><span>${item.type}</span></div></article>`;

  function layout() {
    const overlay = getComputedStyle(hero).position === 'absolute';
    const width = slider.clientWidth;
    offset = overlay ? hero.offsetWidth + GAP : 0;
    const visible = width - offset;
    const perView = overlay ? (visible > 560 ? 2 : 1) : 1;
    const cardWidth = overlay ? (visible - GAP * (perView - 1)) / perView : width * 0.72;
    step = cardWidth + GAP;
    track.querySelectorAll('.collection-card').forEach((card) => { card.style.width = `${cardWidth}px`; });
    position(false);
  }

  function position(animate) {
    track.style.transition = animate ? 'transform .7s cubic-bezier(.65,0,.35,1), opacity .3s ease' : 'opacity .3s ease';
    track.style.transform = `translate3d(${offset - index * step}px,0,0)`;
  }

  function build(key) {
    const items = collectionData[key].items;
    count = items.length;
    const copies = Math.max(5, Math.ceil(16 / count));
    track.innerHTML = Array.from({ length: copies }, () => items.map(cardHTML).join('')).join('');
    start = count * Math.floor(copies / 2);
    index = start;
    layout();
  }

  function move(direction) {
    index += direction;
    position(true);
  }

  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform') return;
    if (index >= start + count || index < start - count + 1) {
      index = start + (((index - start) % count) + count) % count;
      position(false);
    }
  });

  function play() {
    window.clearInterval(timer);
    if (reduceMotion) return;
    timer = window.setInterval(() => { if (!paused && !document.hidden) move(1); }, INTERVAL);
  }

  function show(key) {
    const { hero: h } = collectionData[key];
    hero.classList.add('is-switching');
    track.classList.add('is-switching');
    window.setTimeout(() => {
      heroImg.src = h.src;
      heroImg.alt = h.alt;
      heroKicker.textContent = h.kicker;
      heroTitle.textContent = h.title;
      build(key);
      hero.classList.remove('is-switching');
      track.classList.remove('is-switching');
      play();
    }, 260);
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

  build('all');
  play();
}

const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
}

document.querySelectorAll('.planned-link').forEach((control) => {
  control.addEventListener('click', () => showToast(control.dataset.message));
});

const launchRail = document.getElementById('launchRail');
const moveLaunchRail = (direction) => launchRail.scrollBy({ left: direction * Math.max(320, launchRail.clientWidth * 0.78), behavior: 'smooth' });
document.querySelector('.rail-prev')?.addEventListener('click', () => moveLaunchRail(-1));
document.querySelector('.rail-next')?.addEventListener('click', () => moveLaunchRail(1));

const blogRail = document.getElementById('blogRail');
const moveBlogRail = (direction) => blogRail?.scrollBy({ left: direction * Math.max(300, blogRail.clientWidth * 0.7), behavior: 'smooth' });
document.querySelector('.blog-prev')?.addEventListener('click', () => moveBlogRail(-1));
document.querySelector('.blog-next')?.addEventListener('click', () => moveBlogRail(1));
document.querySelectorAll('[data-blog-filter]').forEach((filter) => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('[data-blog-filter]').forEach((button) => button.setAttribute('aria-selected', 'false'));
    filter.setAttribute('aria-selected', 'true');
    const category = filter.dataset.blogFilter;
    document.querySelectorAll('.blog-card').forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.blogCategory !== category;
    });
    blogRail?.scrollTo({ left: 0, behavior: 'smooth' });
  });
});

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
