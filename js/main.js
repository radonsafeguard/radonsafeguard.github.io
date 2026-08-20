document.addEventListener('DOMContentLoaded', () => {
  // Public marketing site only — staff portal lives in _portal/ (not linked or published).
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMobile = document.querySelector('.nav-mobile');
  const contactForm = document.getElementById('contact-form');
  const quoteForm = document.getElementById('quote-form');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (menuToggle && navMobile) {
    const setMenuOpen = (open) => {
      navMobile.classList.toggle('open', open);
      menuToggle.classList.toggle('active', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        const firstLink = navMobile.querySelector('a');
        firstLink?.focus();
      }
    };

    menuToggle.addEventListener('click', () => {
      setMenuOpen(!navMobile.classList.contains('open'));
    });

    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMobile.classList.contains('open')) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    fadeElements.forEach(el => {
      observer.observe(el);
      // Make elements already in view (e.g. above the fold) visible immediately on load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }

  const showFormStatus = (el, message, isError) => {
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    el.classList.toggle('is-error', Boolean(isError));
    el.classList.toggle('is-success', !isError);
  };

  const clearFormStatus = (el) => {
    if (!el) return;
    el.classList.remove('show', 'is-error', 'is-success');
    el.textContent = '';
  };

  const friendlyFormError = (raw) => {
    const msg = (raw || '').toString();
    const lower = msg.toLowerCase();
    if (
      lower.includes('activate') ||
      lower.includes('confirm your email') ||
      lower.includes('confirmation') ||
      lower.includes('not confirmed')
    ) {
      return 'Please check info@radonsafeguard.com for a FormSubmit activation email and confirm the form once. Then try again, or call (780) 851-5661.';
    }
    if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network')) {
      return 'Network problem while sending. Check your connection and try again, or call (780) 851-5661.';
    }
    return `Sorry, there was a problem sending your message. ${msg || 'Please try again.'} You can also call (780) 851-5661.`;
  };

  const handleFormSubmit = (form) => {
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const statusEl = form.querySelector('.form-success');
      const submitBtn = form.querySelector('button[type="submit"]');
      const action = form.getAttribute('action') || '';
      const defaultLabel = submitBtn?.dataset.defaultLabel || submitBtn?.textContent || 'Submit';
      const isQuote = form.id === 'quote-form';
      const successMessage = isQuote
        ? 'Thank you! Your quote request has been received.'
        : 'Thank you! Your message has been sent.';

      clearFormStatus(statusEl);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      const formData = new FormData(form);

      try {
        if (action.includes('formsubmit.co')) {
          const formObj = {};
          for (const [key, value] of formData.entries()) {
            if (key === '_honey' || key === '_next') continue;
            formObj[key] = value;
          }

          const ajaxUrl = action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

          const response = await fetch(ajaxUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(formObj)
          });

          let payload = null;
          try {
            payload = await response.json();
          } catch (e) {
            payload = null;
          }

          if (response.ok && (!payload || payload.success !== false)) {
            form.reset();
            if (isQuote) {
              const onlineRadio = form.querySelector('input[name="quote-type"][value="online"]');
              if (onlineRadio) {
                onlineRadio.checked = true;
                onlineRadio.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            showFormStatus(statusEl, successMessage, false);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = defaultLabel;
            }
            statusEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
          }

          const errText =
            (payload && (payload.message || payload.error)) ||
            `Email service returned status ${response.status}`;
          throw new Error(errText);
        }

        throw new Error('Form is not configured for submission on this site.');
      } catch (err) {
        console.error('[Form] Submission error:', err);
        showFormStatus(statusEl, friendlyFormError(err.message), true);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultLabel;
        }
      }
    });
  };

  handleFormSubmit(contactForm);
  handleFormSubmit(quoteForm);

  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.querySelectorAll('.faq-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      document.querySelectorAll('.faq-category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.faq-group').forEach(group => {
        group.style.display = category === 'all' || group.dataset.category === category ? '' : 'none';
      });
    });
  });

  const lightbox = document.getElementById('work-lightbox');
  if (lightbox) {
    const lightboxImage = document.getElementById('work-lightbox-image');
    const lightboxCaption = document.getElementById('work-lightbox-caption');
    const prevBtn = lightbox.querySelector('.work-lightbox-prev');
    const nextBtn = lightbox.querySelector('.work-lightbox-next');
    let workSources = [];
    let workIndex = 0;
    let lastFocus = null;

    const visibleSources = () => Array.from(document.querySelectorAll('.work-card'));

    const showWork = (index) => {
      workSources = visibleSources();
      if (!workSources.length) return;
      workIndex = (index + workSources.length) % workSources.length;
      const el = workSources[workIndex];
      lightboxImage.src = el.dataset.workSrc;
      lightboxImage.alt = el.dataset.workAlt || '';
      lightboxCaption.textContent = el.dataset.workCaption || '';
    };

    const openLightbox = (el) => {
      workSources = visibleSources();
      workIndex = Math.max(0, workSources.indexOf(el));
      lastFocus = document.activeElement;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      showWork(workIndex);
      lightbox.querySelector('.work-lightbox-close')?.focus();
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      lightboxImage.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    document.querySelectorAll('.work-card').forEach(el => {
      el.addEventListener('click', () => openLightbox(el));
    });

    lightbox.querySelectorAll('[data-work-close]').forEach(el => {
      el.addEventListener('click', closeLightbox);
    });
    prevBtn?.addEventListener('click', () => showWork(workIndex - 1));
    nextBtn?.addEventListener('click', () => showWork(workIndex + 1));

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showWork(workIndex - 1);
      if (e.key === 'ArrowRight') showWork(workIndex + 1);
    });
  }
});
