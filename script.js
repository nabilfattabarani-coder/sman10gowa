// Popup welcome
const popup = document.getElementById('welcome-popup');
const popupClose = document.getElementById('popup-close');
const popupDismiss = document.getElementById('popup-dismiss');

function hidePopup() {
  if (popup) popup.classList.remove('show');
}

if (popup) {
  setTimeout(() => popup.classList.add('show'), 600);
  popupClose?.addEventListener('click', hidePopup);
  popupDismiss?.addEventListener('click', hidePopup);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) hidePopup();
  });
}

// Animasi muncul saat elemen kelihatan pas di-scroll
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => observer.observe(el));

// Muat dan tampilkan berita dari news.json
fetch('news.json')
  .then((res) => res.json())
  .then((items) => {
    const container = document.getElementById('berita-list');
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<p class="berita-loading">Belum ada berita.</p>';
      return;
    }
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    container.innerHTML = items.map((item) => `
      <article class="berita-card">
        <img src="${item.image}" alt="${item.title}" class="berita-img" loading="lazy">
        <div class="berita-body">
          <p class="berita-date">${formatter.format(new Date(item.date))}</p>
          <h3 class="berita-title">${item.title}</h3>
          <p class="berita-excerpt">${item.excerpt}</p>
        </div>
      </article>
    `).join('');
  })
  .catch(() => {
    const container = document.getElementById('berita-list');
    if (container) container.innerHTML = '<p class="berita-loading">Berita belum bisa dimuat.</p>';
  });
