'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const waBase = 'https://wa.me/5575982349050';
const waMessage = 'Olá! Visitei o site da Sorrir Mais Odonto e gostaria de agendar uma consulta.';
$$('.whatsapp').forEach(a => a.href = `${waBase}?text=${encodeURIComponent(waMessage)}`);

const treatments = [
  ['Ortodontia', 'Aparelhos fixos, estéticos, autoligáveis e alinhadores para cuidar do alinhamento do sorriso.', 'tooth'],
  ['Estética dental', 'Tratamentos restauradores com porcelanas e resinas, respeitando as necessidades de cada sorriso.', 'spark'],
  ['Implantodontia', 'Tratamento para repor dentes perdidos, com planejamento individualizado.', 'tooth'],
  ['Prótese', 'Alternativas para reposição de um ou mais dentes e recuperação da função mastigatória.', 'tooth'],
  ['Endodontia', 'Tratamento de canal: cuidado especializado com a parte interna do dente.', 'plus'],
  ['Periodontia', 'Cuidado com a saúde das gengivas e tratamento de doenças periodontais.', 'heart'],
  ['Cirurgia', 'Avaliação e acompanhamento de dentes com indicação de extração, incluindo sisos.', 'plus'],
  ['Odontopediatria', 'Atenção à saúde bucal das crianças, com acolhimento em cada consulta.', 'heart'],
  ['Exames radiográficos', 'Exames que auxiliam na avaliação e no planejamento do seu cuidado odontológico.', 'spark']
];
const grid = $('#treatment-grid');
treatments.forEach(([name, description, icon], index) => {
  const card = document.createElement('article'); card.className = 'treatment-card reveal';
  card.innerHTML = `<svg class="treatment-icon" aria-hidden="true"><use href="#${icon}"/></svg><h3>${name}</h3><p>${description}</p><a class="treatment-link" target="_blank" rel="noopener noreferrer" href="${waBase}?text=${encodeURIComponent(`Olá! Visitei o site da Sorrir Mais Odonto e gostaria de saber mais sobre ${name.toLowerCase()}.`)}" aria-label="Agendar consulta para ${name}">Agendar consulta <svg aria-hidden="true"><use href="#arrow-up"/></svg></a>`;
  const number = document.createElement('span'); number.className = 'treatment-number'; number.setAttribute('aria-hidden', 'true'); number.textContent = String(index + 1).padStart(2, '0'); card.prepend(number);
  grid.append(card);
});

const menu = $('.menu-toggle'), nav = $('#navigation');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
$$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', e => { if (!e.target.closest('.nav-shell')) closeMenu(); });

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); } }), { threshold: .08 });
  $$('.reveal').forEach(el => reveals.observe(el));
  const orbit = $('.orbit-one'); let queued = false;
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { orbit.style.transform = `translate3d(${-Math.min(scrollY / 18, 230)}px, ${Math.min(scrollY / 15, 300)}px, 0)`; queued = false; }); } }, { passive: true });
}
const heroVideo = $('#hero-video'), heroPause = $('#hero-pause'), heroMedia = $('.hero-media');
let manuallyPaused = reduceMotion.matches, heroInView = false, pendingFrame = null;
function updateHeroControl() {
  const playing = !heroVideo.paused && !heroVideo.error;
  heroPause.textContent = playing ? 'Ⅱ' : '▷';
  heroPause.setAttribute('aria-label', playing ? 'Pausar prévia com áudio' : 'Reproduzir prévia com áudio');
}
function showHeroPoster() {
  heroMedia.classList.remove('video-ready');
  if (pendingFrame !== null && heroVideo.cancelVideoFrameCallback) heroVideo.cancelVideoFrameCallback(pendingFrame);
  pendingFrame = null;
  updateHeroControl();
}
function revealHeroFrame() {
  if (!heroVideo.paused && !heroVideo.error && heroVideo.readyState >= 2 && heroInView && !document.hidden) heroMedia.classList.add('video-ready');
  pendingFrame = null;
  updateHeroControl();
}
function onHeroPlaying() {
  if (pendingFrame !== null && heroVideo.cancelVideoFrameCallback) heroVideo.cancelVideoFrameCallback(pendingFrame);
  if (heroVideo.requestVideoFrameCallback) pendingFrame = heroVideo.requestVideoFrameCallback(revealHeroFrame);
  else revealHeroFrame();
}
function playHero() {
  heroVideo.muted = false;
  heroVideo.defaultMuted = false;
  heroVideo.volume = 1;
  if (heroVideo.error) heroVideo.load();
  heroVideo.play().catch(showHeroPoster);
}
function syncHeroVisibility() {
  if (!heroInView || document.hidden || manuallyPaused) { heroVideo.pause(); showHeroPoster(); }
  else playHero();
}
heroPause.addEventListener('click', () => {
  manuallyPaused = !heroVideo.paused;
  if (manuallyPaused) heroVideo.pause(); else playHero();
});
heroVideo.addEventListener('playing', onHeroPlaying);
['pause', 'error', 'emptied', 'waiting'].forEach(event => heroVideo.addEventListener(event, showHeroPoster));
heroVideo.addEventListener('loadeddata', () => { if (!heroVideo.paused) onHeroPlaying(); });
if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
  heroInView = entries[0].isIntersecting;
  syncHeroVisibility();
}, {threshold:.1}).observe(heroMedia);
else { heroInView = true; syncHeroVisibility(); }
document.addEventListener('visibilitychange', syncHeroVisibility);
addEventListener('pageshow', syncHeroVisibility);
reduceMotion.addEventListener('change', () => { manuallyPaused = reduceMotion.matches; syncHeroVisibility(); });

const galleryItems = $$('.gallery-photo'), galleryDialog = $('#gallery-dialog'); let photoIndex = 0;
function showPhoto(index) { photoIndex = (index + galleryItems.length) % galleryItems.length; const item = galleryItems[photoIndex]; $('#lightbox-image').src = item.dataset.image; $('#lightbox-image').alt = $('img', item).alt; $('#lightbox-caption').textContent = item.dataset.caption; }
galleryItems.forEach((item, i) => item.addEventListener('click', () => { showPhoto(i); galleryDialog.showModal(); document.body.classList.add('modal-open'); }));
$('.gallery-prev').addEventListener('click', () => showPhoto(photoIndex - 1)); $('.gallery-next').addEventListener('click', () => showPhoto(photoIndex + 1));
galleryDialog.addEventListener('keydown', e => { if (e.key === 'ArrowRight') showPhoto(photoIndex + 1); if (e.key === 'ArrowLeft') showPhoto(photoIndex - 1); });
$$('dialog').forEach(dialog => { $('.dialog-close', dialog).addEventListener('click', () => dialog.close()); dialog.addEventListener('close', () => document.body.classList.remove('modal-open')); dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); }); });
$('#open-privacy').addEventListener('click', () => { $('#privacy-dialog').showModal(); document.body.classList.add('modal-open'); });

const videoFrame = $('#video-frame');
function localPlayer() { videoFrame.innerHTML = '<video id="clinic-video" controls playsinline preload="metadata" poster="assets/reel-poster.webp"><source src="assets/clinica-reel.mp4" type="video/mp4"></video>'; }
$$('.video-choice').forEach(choice => choice.addEventListener('click', () => {
  if (choice.classList.contains('active')) return;
  const oldVideo = $('video', videoFrame); if (oldVideo) oldVideo.pause();
  $$('.video-choice').forEach(el => { const selected = el === choice; el.classList.toggle('active', selected); el.setAttribute('aria-pressed', String(selected)); });
  const id = choice.dataset.video;
  $('#video-source').href = `https://www.instagram.com/sorrir.maisodonto/reel/${id === 'local' ? 'DeNXNDHo08W' : id}/`;
  if (id === 'local') { localPlayer(); return; }
  videoFrame.innerHTML = `<div class="external-video"><svg aria-hidden="true"><use href="#instagram"/></svg><h3>${$('strong', choice).textContent}</h3><p>Veja este vídeo publicado no Instagram oficial da clínica.</p><button class="button button-white" id="load-reel">Assistir aqui <svg aria-hidden="true"><use href="#play"/></svg></button><small>O player será carregado pelo Instagram e poderá solicitar login.</small><a href="https://www.instagram.com/sorrir.maisodonto/reel/${id}/" target="_blank" rel="noopener noreferrer">Abrir no Instagram ↗</a></div>`;
  $('#load-reel').addEventListener('click', () => { const iframe = document.createElement('iframe'); iframe.title = `Vídeo oficial: ${$('strong', choice).textContent}`; iframe.src = `https://www.instagram.com/p/${id}/embed/`; iframe.allow = 'autoplay; encrypted-media; fullscreen'; iframe.referrerPolicy = 'strict-origin-when-cross-origin'; videoFrame.replaceChildren(iframe); });
}));
$('#load-map').addEventListener('click', () => { const iframe = document.createElement('iframe'); iframe.title = 'Localização da Sorrir Mais Odonto em Santanópolis, Bahia'; iframe.src = 'https://maps.google.com/maps?q=Sorrir%20Mais%20Odonto%20Santanopolis%20BA&t=&z=16&ie=UTF8&iwloc=&output=embed'; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer-when-downgrade'; iframe.allowFullscreen = true; $('.map-placeholder').replaceWith(iframe); });
