/* Lightweight page script for about.html */
document.addEventListener('DOMContentLoaded', () => {
    // Update footer year dynamically (if footer exists)
    const footerP = document.querySelector('footer p');
    if (footerP) {
        const year = new Date().getFullYear();
        footerP.innerHTML = footerP.innerHTML.replace(/\b20\d{2}\b/, year);
    }

    // Highlight active nav link
    const navLinks = document.querySelectorAll('nav a[href]');
    const currentPage = location.pathname.split('/').pop() || 'about.html';
    navLinks.forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage || (href === '' && currentPage === 'about.html')) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });

    // Smooth-scroll for same-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', `#${id}`);
            }
        });
    });

    // Make logo clickable (go home)
    const logo = document.getElementById('logo');
    if (logo) logo.addEventListener('click', () => { location.href = 'main.html'; });

    // Simple FAQ / collapsible support for elements with data-toggle-target
    document.querySelectorAll('[data-toggle-target]').forEach(btn => {
        const target = document.querySelector(btn.dataset.toggleTarget);
        if (!target) return;
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            target.hidden = expanded;
        });
    });

    // Log pageview (console-only)
    console.info('Best Of All - NETWORK — about pageview:', location.pathname + location.search + location.hash);
});