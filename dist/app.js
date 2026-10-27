(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('#header');
  const menuButton = $('.menu-toggle');
  const reservation = $('#reservation-dialog');
  const reservationForm = $('#reservation-form');
  const quickForm = $('#quick-booking');
  const lightbox = $('#lightbox');
  const credits = $('#credits-dialog');
  const phone = '5548999712106';
  const gallery = [
    {src:'casa-01.jpg', alt:'Casa com piscina e espaço gourmet ao anoitecer', category:'casa'},
    {src:'ap02-principal.jpg', alt:'Fachada dos apartamentos da Pousada do Dado', category:'apartamentos'},
    {src:'casa-04.jpg', alt:'Quarto da casa com piscina', category:'casa'},
    {src:'ap01-07.jpg', alt:'Quartos do apartamento 01', category:'apartamentos'},
    {src:'casa-06.jpg', alt:'Espaço gourmet da casa com piscina', category:'casa'},
    {src:'pinheira-aerea.webp', alt:'Vista aérea da Praia de Cima, na Pinheira', category:'regiao'},
    {src:'casa-02.jpg', alt:'Piscina e espreguiçadeiras da casa', category:'casa'},
    {src:'ap03-02.jpg', alt:'Cozinha e interior do apartamento 03', category:'apartamentos'},
    {src:'coastal-guarda.webp', alt:'Costão e mar na Guarda do Embaú', category:'regiao'}
  ];
  let filtered = [...gallery];
  let activePhoto = 0;
  let opener = null;
  let ticking = false;
  const parallax = $$('[data-parallax]');

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.08, rootMargin:'0px 0px -25px 0px'}) : null;
  if (revealObserver) {
    document.body.classList.add('motion-ready');
    $$('.reveal, .image-reveal').forEach(el => revealObserver.observe(el));
  }

  function updateScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 90);
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    $('.reading-progress').style.transform = `scaleX(${distance > 0 ? y / distance : 0})`;
    if (!reducedMotion.matches) {
      parallax.forEach(el => {
        const area = el.parentElement.getBoundingClientRect();
        if (area.bottom > -100 && area.top < window.innerHeight + 100) {
          const speed = Number(el.dataset.parallax);
          const delta = Math.min(window.innerHeight, Math.max(-area.height, -area.top)) * speed;
          el.style.transform = `translate3d(0,${delta.toFixed(1)}px,0)`;
        }
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) {ticking = true; requestAnimationFrame(updateScroll);} }, {passive:true});
  window.addEventListener('resize', updateScroll, {passive:true});
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) parallax.forEach(el => el.style.transform = '');
    updateScroll();
  });
  updateScroll();

  function closeMenu() {
    header.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('modal-open');
  }
  menuButton.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('modal-open', open);
  });
  $$('.nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && header.classList.contains('menu-open')) {closeMenu();menuButton.focus();}});

  function showDialog(dialog, source) {
    closeMenu();
    opener = source || document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function closeDialog(dialog) {dialog.close();}
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (opener && opener.isConnected) opener.focus({preventScroll:true});
    });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) closeDialog(dialog);
      }
    });
    $$('[data-close]', dialog).forEach(btn => btn.addEventListener('click', () => closeDialog(dialog)));
  });
  $$('[data-reserve]').forEach(button => button.addEventListener('click', () => {$('#form-error').textContent = '';showDialog(reservation, button);}));

  function localDateISO(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit',timeZone:'America/Sao_Paulo'}).format(date);
  }
  function nextDay(value) {
    const [y,m,d] = value.split('-').map(Number);
    const date = new Date(y,m-1,d+1,12);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  const today = localDateISO();
  $$('form').forEach(form => {
    const arrival = $('[name="checkin"]', form);
    const departure = $('[name="checkout"]', form);
    if (!arrival || !departure) return;
    arrival.min = today;
    departure.min = nextDay(today);
    arrival.addEventListener('change', () => {
      arrival.setCustomValidity('');
      departure.min = arrival.value ? nextDay(arrival.value) : nextDay(today);
      if (departure.value && departure.value <= arrival.value) departure.value = '';
    });
    departure.addEventListener('change', () => departure.setCustomValidity(''));
  });
  function displayDate(value) { const [y,m,d] = value.split('-');return `${d}/${m}/${y}`; }
  function consult(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const checkin = data.get('checkin');
    const checkout = data.get('checkout');
    const guests = Number(data.get('guests'));
    const accommodation = data.get('accommodation') || 'Ainda não escolhi';
    const arrival = $('[name="checkin"]', form);
    const departure = $('[name="checkout"]', form);
    if (!checkin || checkin < today) {arrival.setCustomValidity('Escolha uma data de chegada a partir de hoje.');arrival.reportValidity();return;}
    if (!checkout || checkout <= checkin) {departure.setCustomValidity('A saída precisa ser depois da chegada.');departure.reportValidity();return;}
    if (guests > 4 && /^Apartamento/.test(accommodation)) {
      $('#form-error').textContent = 'Os apartamentos acomodam até 4 pessoas. Para seu grupo, escolha a casa com piscina ou consulte mais de uma unidade.';
      return;
    }
    $('#form-error').textContent = '';
    const message = `Olá! Conheci a Pousada do Dado pelo site e gostaria de consultar valores e disponibilidade.\n\nChegada: ${displayDate(checkin)}\nSaída: ${displayDate(checkout)}\nHóspedes: ${guests}\nAcomodação: ${accommodation}\n\nPodem me passar as opções e condições?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.assign(url);
  }
  quickForm.addEventListener('submit', consult);
  reservationForm.addEventListener('submit', consult);
  $('[name="accommodation"]', reservationForm).addEventListener('change', () => $('#form-error').textContent = '');
  $('[name="guests"]', reservationForm).addEventListener('change', () => $('#form-error').textContent = '');

  function updateLightbox() {
    const photo = filtered[activePhoto];
    $('#lightbox-image').src = '/assets/' + photo.src;
    $('#lightbox-image').alt = photo.alt;
    $('#lightbox-caption').textContent = photo.alt;
    $('#lightbox-count').textContent = `${String(activePhoto+1).padStart(2,'0')} / ${String(filtered.length).padStart(2,'0')}`;
  }
  function movePhoto(step) {activePhoto = (activePhoto + step + filtered.length) % filtered.length;updateLightbox();}
  function renderGallery(filter) {
    filtered = filter === 'all' ? [...gallery] : gallery.filter(photo => photo.category === filter);
    const grid = $('#gallery-grid');
    grid.replaceChildren();
    filtered.forEach((photo,index) => {
      const button = document.createElement('button');
      button.className = 'gallery-item';
      button.setAttribute('aria-label', 'Ampliar: ' + photo.alt);
      button.style.animationDelay = `${Math.min(index,5)*45}ms`;
      const img = document.createElement('img');
      img.src = '/assets/' + photo.src;img.alt = photo.alt;img.loading = 'lazy';img.width = 1000;img.height = 1000;
      button.append(img);
      button.addEventListener('click', () => {activePhoto = index;updateLightbox();showDialog(lightbox,button);});
      grid.append(button);
    });
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(btn => {btn.classList.toggle('active',btn === button);btn.setAttribute('aria-pressed',String(btn === button));});
    renderGallery(button.dataset.filter);
  }));
  renderGallery('all');
  $('.lightbox-close').addEventListener('click', () => closeDialog(lightbox));
  $('.lightbox-prev').addEventListener('click', () => movePhoto(-1));
  $('.lightbox-next').addEventListener('click', () => movePhoto(1));
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {e.preventDefault();movePhoto(1);}
    if (e.key === 'ArrowLeft') {e.preventDefault();movePhoto(-1);}
  });
  let swipeStart = null;
  lightbox.addEventListener('touchstart', e => {swipeStart = e.changedTouches[0].clientX;}, {passive:true});
  lightbox.addEventListener('touchend', e => {
    if (swipeStart !== null) {const delta = e.changedTouches[0].clientX - swipeStart;if(Math.abs(delta) > 55) movePhoto(delta < 0 ? 1 : -1);}
    swipeStart = null;
  }, {passive:true});

  $('#credits-button').addEventListener('click', e => showDialog(credits,e.currentTarget));
  $('#year').textContent = new Intl.DateTimeFormat('pt-BR', {year:'numeric',timeZone:'America/Sao_Paulo'}).format(new Date());
})();
