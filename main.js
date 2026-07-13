// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  // Scroll progress bar — the site's "gauge level" indicator
  const progress = document.createElement('div');
  progress.id = 'scroll-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = max > 0 ? `${(scrolled / max) * 100}%` : '0%';
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Header gains weight once scrolled
  const header = document.querySelector('.site-header');
  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  };
  document.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Cursor spotlight on instrument-panel sections
  document.querySelectorAll('.hero, .cta-banner, .page-hero, .confluence').forEach((section) => {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      section.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // Count-up animation for confluence stats
  const statEls = document.querySelectorAll('.confluence-num');
  if ('IntersectionObserver' in window && statEls.length) {
    const animateStat = (el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/[\d.]+/);
      if (!match) return;
      const target = parseFloat(match[0]);
      const prefix = raw.slice(0, match.index);
      const suffix = raw.slice(match.index + match[0].length);
      const isDecimal = match[0].includes('.');
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach((el) => statIO.observe(el));
  }

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Journals filter pills (journals.html only)
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('[data-category]');
  if (pills.length && cards.length) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.filter;
        cards.forEach(card => {
          const show = cat === 'all' || card.dataset.category === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Submission form (submissions.html) — posts to Formspree, no page reload
  const submitForm = document.getElementById('stream-submit-form');
  if (submitForm) {
    const btn = document.getElementById('submit-btn');
    const status = document.getElementById('form-status');
    const btnDefaultHTML = btn.innerHTML;

    submitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = 'Sending…';
      status.textContent = '';
      status.className = 'form-status';

      const data = new FormData(submitForm);

      fetch(submitForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then((response) => {
          if (response.ok) {
            submitForm.reset();
            status.textContent = "Received — you'll get a confirmation email shortly.";
            status.classList.add('success');
          } else {
            return response.json().then((body) => {
              const msg = (body.errors || []).map((err) => err.message).join(', ');
              throw new Error(msg || 'Something went wrong.');
            });
          }
        })
        .catch((err) => {
          status.textContent = `Could not send (${err.message}). Please email editors@stream.com instead.`;
          status.classList.add('error');
        })
        .finally(() => {
          btn.disabled = false;
          btn.innerHTML = btnDefaultHTML;
        });
    });
  }
});

