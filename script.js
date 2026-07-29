document.addEventListener('DOMContentLoaded', () => {
  initPopup();
  initReveal();
  initTheme();
  initBackToTop();
  initTicker();
  initKalender();
  initBerita();
});

/* ================= Popup selamat datang ================= */
function initPopup(){
  const popup = document.getElementById('welcome-popup');
  if(!popup) return;
  const closeBtn = document.getElementById('popup-close');
  const dismissBtn = document.getElementById('popup-dismiss');
  const KEY = 'sman10gowa_popup_dismissed';

  if(!sessionStorage.getItem(KEY)){
    setTimeout(() => popup.classList.add('show'), 400);
  }
  function hide(){
    popup.classList.remove('show');
    sessionStorage.setItem(KEY, '1');
  }
  closeBtn && closeBtn.addEventListener('click', hide);
  dismissBtn && dismissBtn.addEventListener('click', hide);
  popup.addEventListener('click', (e) => { if(e.target === popup) hide(); });
}

/* ================= Animasi muncul saat scroll ================= */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;

  if(!('IntersectionObserver' in window)){
    items.forEach(item => item.classList.add('active'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => obs.observe(item));
}

/* ================= Dark mode ================= */
function initTheme(){
  const toggle = document.getElementById('theme-toggle');
  const KEY = 'sman10gowa_theme';
  if(!toggle) return;

  updateIcon();

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(KEY, isDark ? 'dark' : 'light');
    updateIcon();
  });

  function updateIcon(){
    const isDark = document.documentElement.classList.contains('dark');
    toggle.textContent = isDark ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
  }
}

/* ================= Back to top ================= */
function initBackToTop(){
  const btn = document.getElementById('back-to-top');
  if(!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 420);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ================= Pengumuman berjalan ================= */
function initTicker(){
  const wrap = document.getElementById('ticker-wrap');
  const track = document.getElementById('ticker-track');
  if(!track || !wrap) return;

  fetch('pengumuman.json')
    .then(res => {
      if(!res.ok) throw new Error('gagal memuat');
      return res.json();
    })
    .then(items => {
      if(!Array.isArray(items) || !items.length){
        wrap.style.display = 'none';
        return;
      }
      const html = items.map(item => `<span class="ticker-item">📢 ${escapeHtml(item.text)}</span>`).join('');
      // Digandakan supaya animasi looping mulus tanpa jeda
      track.innerHTML = html + html;
    })
    .catch(() => {
      wrap.style.display = 'none';
    });
}

/* ================= Kalender akademik ================= */
function initKalender(){
  const list = document.getElementById('kalender-list');
  if(!list) return;

  fetch('kalender.json')
    .then(res => {
      if(!res.ok) throw new Error('gagal memuat');
      return res.json();
    })
    .then(data => {
      if(!Array.isArray(data) || !data.length){
        list.innerHTML = '<p class="kalender-loading">Belum ada data kalender akademik.</p>';
        return;
      }
      const groups = [];
      const groupIndex = {};
      data.forEach(item => {
        const key = item.semester || 'Agenda';
        if(!(key in groupIndex)){
          groupIndex[key] = groups.length;
          groups.push({ title: key, items: [] });
        }
        groups[groupIndex[key]].items.push(item);
      });

      let html = '';
      groups.forEach(group => {
        html += `<p class="kalender-group-title">${escapeHtml(group.title)}</p>`;
        group.items.forEach(item => {
          html += `<div class="kalender-item"><span class="kalender-date">${escapeHtml(item.date)}</span><span class="kalender-label">${escapeHtml(item.label)}</span></div>`;
        });
      });
      list.innerHTML = html;
    })
    .catch(() => {
      list.innerHTML = '<p class="kalender-loading">Gagal memuat kalender akademik.</p>';
    });
}

/* ================= Berita + pencarian ================= */
let allNews = [];

function initBerita(){
  const listEl = document.getElementById('berita-list');
  const searchEl = document.getElementById('berita-search');
  if(!listEl) return;

  fetch('news.json')
    .then(res => {
      if(!res.ok) throw new Error('gagal memuat');
      return res.json();
    })
    .then(data => {
      allNews = (Array.isArray(data) ? data : []).slice().sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      renderBerita(allNews);
    })
    .catch(() => {
      listEl.innerHTML = '<p class="berita-loading">Gagal memuat berita.</p>';
    });

  if(searchEl){
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.trim().toLowerCase();
      if(!q){
        renderBerita(allNews);
        return;
      }
      const filtered = allNews.filter(item =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.excerpt || '').toLowerCase().includes(q)
      );
      renderBerita(filtered, q);
    });
  }
}

function renderBerita(items, query){
  const listEl = document.getElementById('berita-list');
  if(!listEl) return;

  if(!items.length){
    listEl.innerHTML = query
      ? `<p class="berita-empty">Tidak ada berita yang cocok dengan pencarian "${escapeHtml(query)}".</p>`
      : '<p class="berita-loading">Belum ada berita.</p>';
    return;
  }

  listEl.innerHTML = items.map(item => `
    <div class="berita-card">
      <img src="${item.image}" alt="${escapeHtml(item.title)}" class="berita-img" loading="lazy">
      <div class="berita-body">
        <p class="berita-date">${formatTanggal(item.date)}</p>
        <h3 class="berita-title">${escapeHtml(item.title)}</h3>
        <p class="berita-excerpt">${escapeHtml(item.excerpt)}</p>
      </div>
    </div>
  `).join('');
}

/* ================= Util ================= */
function formatTanggal(dateStr){
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date(dateStr);
  if(isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
