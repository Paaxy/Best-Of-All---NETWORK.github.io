document.addEventListener('DOMContentLoaded', () => {
    // Update footer year dynamically
    const footerP = document.querySelector('footer p');
    if (footerP) {
        const year = new Date().getFullYear();
        footerP.innerHTML = footerP.innerHTML.replace(/\b20\d{2}\b/, year);
    }

    // Highlight active nav link
    const navLinks = document.querySelectorAll('nav a[href]');
    const currentPage = location.pathname.split('/').pop() || 'main.html';
    navLinks.forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage || (href === '' && currentPage === 'main.html')) {
            a.classList.add('active');
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

    // Lightweight pageview log
    console.info('Best Of All - NETWORK — pageview:', location.pathname + location.search + location.hash);
});