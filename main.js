document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section-card, .hero-section');
  const contentArea = document.getElementById('scroll-container');
  const sidebarLabel = document.querySelector('.sidebar-label');

  let sectionOffsets = [];

  function updateOffsets() {
    sections.forEach(sec => sec.style.position = 'static');
    sectionOffsets = Array.from(sections).map(section => ({
      id: section.getAttribute('id'),
      top: section.offsetTop
    }));
    sections.forEach(sec => sec.style.position = '');
  }

  updateOffsets();
  window.addEventListener('resize', updateOffsets);

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href').substring(1);
      const targetSection = sectionOffsets.find(sec => sec.id === targetId);

      if (targetSection) {
        contentArea.scrollTo({
          top: targetSection.top - 20,
          behavior: 'smooth'
        });
      }
    });
  });

  contentArea.addEventListener('scroll', () => {
    let scrollPosition = contentArea.scrollTop + 120;
    let currentSectionId = sectionOffsets[0].id;

    sectionOffsets.forEach(section => {
      if (scrollPosition >= section.top) {
        currentSectionId = section.id;
      }
    });

    navItems.forEach(nav => {
      nav.classList.remove('active');
      if (nav.getAttribute('href') === `#${currentSectionId}`) {
        nav.classList.add('active');
        const numText = nav.querySelector('.nav-num').innerText;
        if (sidebarLabel) {
          if (numText === "00") {
             sidebarLabel.innerText = "BIENVENIDO";
          } else {
             sidebarLabel.innerText = `SELECCIÓN ${numText} / 06`;
          }
        }
      }
    });
  });

  // Ventana Superpuesta de Perfil
  const btnInfo = document.querySelector('.btn-info');
  const btnHeroPerfil = document.getElementById('btn-hero-perfil');
  const btnVolver = document.getElementById('btn-volver-perfil');
  const perfilOverlay = document.getElementById('perfil-overlay');

  if(perfilOverlay && btnVolver) {
    if(btnInfo) btnInfo.addEventListener('click', () => perfilOverlay.classList.remove('hidden'));
    if(btnHeroPerfil) btnHeroPerfil.addEventListener('click', () => perfilOverlay.classList.remove('hidden'));
    btnVolver.addEventListener('click', () => perfilOverlay.classList.add('hidden'));
  }

  // EFECTO LÍQUIDO ORGÁNICO
  const canvases = document.querySelectorAll('.fluid-canvas');     
  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let width, height;
    let time = 0;
    
    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    
    function animateFluid() {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;
      
      ctx.fillStyle = 'rgba(255, 90, 54, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i <= width; i += 20) {
        let y = Math.sin(i * 0.003 + time) * 60 + Math.cos(i * 0.002 + time) * 40 + height * 0.6;
        ctx.lineTo(i, y);
      }
      ctx.lineTo(width, height);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(37, 65, 178, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i <= width; i += 20) {
        let y = Math.sin(i * 0.004 - time) * 50 + Math.cos(i * 0.001 + time) * 50 + height * 0.7;
        ctx.lineTo(i, y);
      }
      ctx.lineTo(width, height);
      ctx.fill();
      
      requestAnimationFrame(animateFluid);
    }
    animateFluid();
  });

  // RESTAURACIÓN DEL DRAG-TO-SCROLL
  const dragCarousels = document.querySelectorAll('.carousel-container:not(.center-single)');
  dragCarousels.forEach(carousel => {
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.style.cursor = '';
    });
    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.style.cursor = '';
    });
    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });
  });

  // CARRUSEL HOVER REDISEÑADO
  class HoverCarousel {
    constructor(elm) {
      this.DOM = { scope: elm, wrap: elm.querySelector('ul').parentNode };
      this.currentScroll = 0;
      this.targetScroll = 0;
      this.isHovering = false;
      this.init();
    }

    init() {
      this.DOM.scope.addEventListener('mouseenter', e => {
        this.isHovering = true;
        this.onMouseEnter(e);
        this.loop();
      });
      this.DOM.scope.addEventListener('mouseleave', () => { this.isHovering = false; });
      this.DOM.scope.addEventListener('mousemove', e => { this.onMouseMove(e); });
    }

    loop() {
      if (!this.isHovering && Math.abs(this.targetScroll - this.currentScroll) < 0.5) return;
      
      this.currentScroll += (this.targetScroll - this.currentScroll) * 0.001;
      
      this.DOM.wrap.scrollLeft = this.currentScroll;
      if (this.scrollWidth > 0) {
         this.DOM.scope.style.setProperty('--scrollLleft', (this.currentScroll / this.scrollWidth) * 100 + '%');
      }
      requestAnimationFrame(() => this.loop());
    }

    onMouseEnter(e) {
      this.containerWidth = this.DOM.wrap.clientWidth;
      this.scrollWidth = this.DOM.wrap.scrollWidth;
      
      if (this.scrollWidth <= this.containerWidth) {
         this.DOM.scope.style.setProperty('--scrollWidth', '0%');
         this.DOM.scope.setAttribute('data-at', '');
         return;
      }
      
      this.padding = 0.15 * this.containerWidth; 
      this.posFromLeft = this.DOM.wrap.getBoundingClientRect().left;
      this.DOM.scope.style.setProperty('--scrollWidth', (this.containerWidth / this.scrollWidth) * 100 + '%');
    }

    onMouseMove(e) {
      if (this.scrollWidth <= this.containerWidth) return;
      
      let stripePos = e.pageX - this.padding - this.posFromLeft;
      if (stripePos < 0) stripePos = 0;
      let pos = stripePos / (this.containerWidth - this.padding * 2);
      if (pos > 1) pos = 1;

      this.targetScroll = (this.scrollWidth - this.containerWidth) * pos;
      this.prevMore = this.DOM.wrap.scrollLeft > 0;
      this.nextMore = this.scrollWidth - this.containerWidth - this.DOM.wrap.scrollLeft > 5;
      this.DOM.scope.setAttribute('data-at', (this.prevMore ? 'left ' : ' ') + (this.nextMore ? 'right' : ''));
    }
  }

  const carouselElms = document.querySelectorAll('.carousel');
  carouselElms.forEach(elm => new HoverCarousel(elm));

  // REPRODUCCIÓN, AUDIO Y REINICIO DE VIDEO
  const videoCards = document.querySelectorAll('.editorial-card');
  videoCards.forEach(card => {
    const video = card.querySelector('video');
    if (!video || !video.getAttribute('src')) return;

    video.muted = true;

    card.addEventListener('mouseenter', () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log("Prevención de Autoplay activa.", error));
      }
      card.classList.add('is-playing');
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0; // REINICIA EL VIDEO AL INICIO
      video.muted = true; 
      card.classList.remove('is-playing');
      card.classList.remove('audio-active'); 
    });

    card.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false; 
        video.play();
        card.classList.add('audio-active'); 
      } else {
        video.muted = true; 
        card.classList.remove('audio-active');
      }
    });
  });

  // VISOR DE PDF INTEGRADO
  const pdfModal = document.getElementById('pdf-modal');
  const pdfFrame = document.getElementById('pdf-frame');
  const closePdfBtn = document.getElementById('close-pdf');
  const pdfTitleEl = document.getElementById('modal-pdf-title');
  const openPdfBtns = document.querySelectorAll('.open-pdf');

  if (pdfModal && pdfFrame && closePdfBtn) {
    openPdfBtns.forEach(card => {
      card.addEventListener('click', () => {
        const pdfUrl = card.getAttribute('data-pdf');
        const pdfTitle = card.getAttribute('data-title');
        if (pdfTitleEl) pdfTitleEl.innerText = pdfTitle || 'Documento PDF';
        // Agregamos view=FitH para forzar el ajuste al ancho en todas las pantallas
        pdfFrame.src = pdfUrl + '#toolbar=0&navpanes=0&view=FitH'; 
        pdfModal.classList.remove('hidden');
      });
    });

    closePdfBtn.addEventListener('click', () => {
      pdfModal.classList.add('hidden');
      setTimeout(() => { pdfFrame.src = ''; }, 400);
    });
  }
});