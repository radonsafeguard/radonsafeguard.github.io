document.addEventListener('DOMContentLoaded', () => {
  // If user is logged in, send them to the private customers page (the logged-in starting page)
  // (this ensures original public nav only shows when not logged in)
  if (localStorage.getItem('radonLoggedIn') === 'true' && 
      !window.location.pathname.includes('customers.html') && 
      !window.location.pathname.includes('estimates.html') &&
      !window.location.pathname.includes('invoices.html') &&
      !window.location.pathname.includes('reports.html')) {
    window.location.href = 'customers.html';
    return;
  }
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMobile = document.querySelector('.nav-mobile');
  const contactForm = document.getElementById('contact-form');
  const quoteForm = document.getElementById('quote-form');
  const formSuccess = document.querySelector('.form-success');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', () => {
      navMobile.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        menuToggle.classList.remove('active');
      });
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

  const handleFormSubmit = (form) => {
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Early detection: FormSubmit does not work when browsing HTML files directly
      if (window.location.protocol === 'file:') {
        const successEl = form.querySelector('.form-success') || document.querySelector('.form-success');
        if (successEl) {
          successEl.textContent = "Unable to submit form. Please open this site through a web server (or use the live GitHub Pages version).";
          successEl.classList.add('show');
          setTimeout(() => successEl.classList.remove('show'), 8000);
        } else {
          alert("Unable to submit form. Make sure you open this page through a web server. FormSubmit will not work in pages browsed as HTML files.");
        }
        return;
      }

      const successEl = form.querySelector('.form-success') || document.querySelector('.form-success');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Disable button during submission
      if (submitBtn) submitBtn.disabled = true;

      const actionUrl = form.getAttribute('action') || 'https://formsubmit.co/radonsafeguard@gmail.com';
      console.log('[Form Debug] Submitting form to:', actionUrl);

      try {
        const formData = new FormData(form);

        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log('[Form Debug] Response status:', response.status);

        let resultText = '';
        // Always read as text first to avoid "body stream already read" errors
        let responseText = '';
        try {
          responseText = await response.text();
          console.log('[Form Debug] Response text:', responseText);
          resultText = responseText;
          // Try to parse as JSON for better message if possible
          try {
            const parsed = JSON.parse(responseText);
            if (parsed && parsed.message) resultText = parsed.message;
            console.log('[Form Debug] Parsed JSON:', parsed);
          } catch (parseErr) {
            // not JSON, that's fine, use the raw text
          }
        } catch (readErr) {
          resultText = 'Could not read response body';
          console.error('[Form Debug] Failed to read response body:', readErr);
        }

        if (response.ok) {
          if (successEl) {
            successEl.textContent = "Thank you! Your request has been received.";
            successEl.classList.add('show');
            form.reset();
            setTimeout(() => {
              successEl.classList.remove('show');
              successEl.textContent = "Thank you! Your request has been received.";
            }, 6000);
          }
        } else {
          const msg = resultText || 'Submission failed with status ' + response.status;
          throw new Error(msg);
        }
      } catch (err) {
        console.error('[Form Debug] Form submission error:', err);

        let userMessage = err.message || 'Unknown error';

        // Clean up FormSubmit's specific file: protocol error
        if (userMessage.includes('web server') || userMessage.includes('HTML files')) {
          userMessage = "Please open this page through a web server (FormSubmit does not work with direct file:// links).";
        }

        // Show error to user
        if (successEl) {
          successEl.textContent = `Sorry, there was a problem sending your message. ${userMessage} Please try again or call (780) 555-1234.`;
          successEl.classList.add('show');
          setTimeout(() => {
            successEl.classList.remove('show');
            successEl.textContent = "Thank you! Your request has been received.";
          }, 5000);
        } else {
          alert(`Sorry, there was a problem sending your message. ${userMessage} Please call (780) 555-1234.`);
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
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

  // Login modal functionality (demo only) - only relevant on public pages
  const loginBtns = document.querySelectorAll('.login-btn');
  const loginModal = document.getElementById('login-modal');

  if (loginBtns.length && loginModal) {
    loginBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
        // close mobile nav if open
        if (navMobile) navMobile.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('active');
      });
    });

    // Close modal
    const closeBtn = loginModal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
      });
    }

    // Close when clicking outside the modal content
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.style.display = 'none';
      }
    });

    // Fake login form
    const loginForm = document.getElementById('login-form');
    const loginSuccess = loginModal.querySelector('.login-success');

    if (loginForm && loginSuccess) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        loginSuccess.style.display = 'block';

        // Mark as logged in and send to the private customers page (the logged-in starting page)
        localStorage.setItem('radonLoggedIn', 'true');

        setTimeout(() => {
          window.location.href = 'customers.html';
        }, 800);
      });
    }
  }
});