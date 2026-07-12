const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
});
document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  items.forEach(item => observer.observe(item));
} else items.forEach(item => item.classList.add('visible'));
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', e => {
  e.preventDefault();
  status.textContent = 'Die Demo-Anfrage wurde erfasst. Für den echten Versand fehlt noch die Empfangs-E-Mail.';
  status.classList.add('success');
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(()=>{});
