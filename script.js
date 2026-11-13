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

document.querySelectorAll('[role="tab"]').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[role="tab"]').forEach((button) => button.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');
    showToast(`${tab.textContent} selected. Verified product data will populate this collection.`);
  });
});

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
