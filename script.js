const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });

  document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.1 });
  items.forEach((item) => observer.observe(item));
} else {
  items.forEach((item) => item.classList.add('visible'));
}

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form && status) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Anfrage wird gesendet …';
    status.classList.remove('success', 'error');
    status.textContent = 'Deine Anfrage wird gerade sicher übermittelt.';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Formular konnte nicht gesendet werden.');
      }

      form.reset();
      status.classList.add('success');
      status.textContent = 'Vielen Dank! Deine Anfrage wurde erfolgreich an KYRENZA gesendet.';
    } catch (error) {
      status.classList.add('error');
      status.textContent = 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es später erneut.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}


// Geräteerkennung und App-Installation
const userAgent = navigator.userAgent || '';
const isAndroid = /Android/i.test(userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isWindows = /Windows/i.test(userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const currentPlatform = isAndroid ? 'android' : isIOS ? 'ios' : isWindows ? 'windows' : null;
if (currentPlatform) {
  document.querySelector(`[data-platform="${currentPlatform}"]`)?.classList.add('recommended');
}

const modal = document.getElementById('installModal');
const modalBadge = document.getElementById('installModalBadge');
const modalTitle = document.getElementById('installModalTitle');
const modalContent = document.getElementById('installModalContent');
let lastFocusedElement = null;

function openInstallModal(type) {
  if (!modal || !modalContent || !modalTitle || !modalBadge) return;
  lastFocusedElement = document.activeElement;

  if (type === 'ios') {
    modalBadge.textContent = 'IPHONE';
    modalTitle.textContent = 'KYRENZA auf dem iPhone installieren';
    modalContent.innerHTML = `
      <p>Öffne diese Seite in <strong>Safari</strong> und führe diese Schritte aus:</p>
      <ol class="install-steps">
        <li>Tippe unten in Safari auf das Teilen-Symbol <span class="install-share-icon">↑</span>.</li>
        <li>Scrolle nach unten und wähle <strong>„Zum Home-Bildschirm“</strong>.</li>
        <li>Tippe oben rechts auf <strong>„Hinzufügen“</strong>.</li>
      </ol>`;
  } else {
    modalBadge.textContent = 'ANDROID';
    modalTitle.textContent = 'KYRENZA auf Android installieren';
    modalContent.innerHTML = `
      <p>Öffne diese Seite am besten in <strong>Google Chrome</strong> und führe diese Schritte aus:</p>
      <ol class="install-steps">
        <li>Tippe oben rechts auf das Menü mit den drei Punkten.</li>
        <li>Wähle <strong>„App installieren“</strong> oder <strong>„Zum Startbildschirm hinzufügen“</strong>.</li>
        <li>Bestätige die Installation.</li>
      </ol>`;
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.install-close')?.focus();
}

function closeInstallModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  lastFocusedElement?.focus();
}

document.querySelectorAll('[data-close-install]').forEach((element) => {
  element.addEventListener('click', closeInstallModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && !modal.hidden) closeInstallModal();
});

let deferredInstallPrompt = null;
const androidButton = document.getElementById('androidInstallButton');
const androidNote = document.getElementById('androidInstallNote');

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (androidButton) androidButton.textContent = 'KYRENZA jetzt installieren';
  if (androidNote) androidNote.textContent = 'Die Installation ist auf diesem Gerät bereit.';
});

androidButton?.addEventListener('click', async () => {
  if (isStandalone) {
    if (androidNote) androidNote.textContent = 'KYRENZA ist auf diesem Gerät bereits installiert.';
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return;
  }

  openInstallModal('android');
});

document.getElementById('iosInstallButton')?.addEventListener('click', () => openInstallModal('ios'));

window.addEventListener('appinstalled', () => {
  if (androidButton) {
    androidButton.textContent = 'KYRENZA ist installiert';
    androidButton.disabled = true;
  }
  if (androidNote) androidNote.textContent = 'Die App wurde erfolgreich hinzugefügt.';
});
