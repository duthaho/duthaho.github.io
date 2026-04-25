/**
 * DUTHAHO — An Architect's Monograph
 * Loads CV data from data.json and renders it to the page
 */

(function () {
    'use strict';

    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to load CV data:', error);
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = `
                    <div class="loading__error">
                        <p>The plate failed to load.</p>
                        <button onclick="location.reload()">Reset</button>
                    </div>
                `;
            }
            throw error;
        }
    }

    // ------------------------------------------------------------
    // Overture (Hero)
    // ------------------------------------------------------------

    function renderOverture(data) {
        const { personal } = data;

        document.title = `${personal.nickname} — ${personal.title} / A Monograph`;

        // Plate footer location
        const plateFootLoc = document.getElementById('plate-foot-loc');
        if (plateFootLoc) plateFootLoc.textContent = personal.location.split(',')[0];
    }

    function renderPlate(data) {
        const { coreSkills, techStack } = data;
        const { principles } = data.personal.about;

        document.getElementById('plate-skills').innerHTML = coreSkills
            .map(s => `<li data-type="${s.type}">${s.name}</li>`)
            .join('');

        document.getElementById('plate-principles').innerHTML = principles
            .map(p => `<li><span>${p}</span></li>`)
            .join('');

        document.getElementById('plate-stack').innerHTML = techStack
            .map(t => `<li>${t}</li>`)
            .join('');
    }

    // ------------------------------------------------------------
    // About — essay with drop cap
    // ------------------------------------------------------------

    function renderAbout(data) {
        const { about } = data.personal;

        // First letter governs the lead-in: narrow letters (I, l, 1) get a first-word
        // lede; everything else gets a classic drop cap.
        const NARROW_INITIAL = /^['"]?[Il1]/;

        const decorateFirst = (html) => {
            const stripped = html.replace(/^<[^>]+>/, '');
            if (NARROW_INITIAL.test(stripped)) {
                const m = html.match(/^(<[^>]+>)?(\S+)(\s+)([\s\S]*)$/);
                if (m) {
                    const lead = m[1] || '';
                    return `<p class="essay__has-lede">${lead}<span class="essay__lede">${m[2]}</span>${m[3]}${m[4]}</p>`;
                }
            }
            return `<p class="essay__has-dropcap">${html}</p>`;
        };

        document.getElementById('about-body').innerHTML = about.paragraphs
            .map((p, i) => (i === 0 ? decorateFirst(p) : `<p>${p}</p>`))
            .join('');
    }

    // ------------------------------------------------------------
    // Practice — ledger of experience
    // ------------------------------------------------------------

    function renderPractice(data) {
        const { experience } = data;

        document.getElementById('practice-ledger').innerHTML = experience.map(job => {
            const status = job.status === 'current'
                ? '<span class="ledger__date-status">Current</span>'
                : '';
            const badge = job.badge
                ? `<span class="ledger__date-status ledger__date-status--badge">${job.badge}</span>`
                : '';
            const period = job.period
                .replace(/Present/i, 'Present')
                .replace(/-/g, '—');

            return `
                <li class="ledger__item">
                    <div class="ledger__date">
                        <span class="ledger__date-period">${period}</span>
                        ${status}${badge}
                    </div>
                    <div class="ledger__body">
                        <h3 class="ledger__role">${job.title}</h3>
                        <a href="${job.url}" class="ledger__company" target="_blank" rel="noopener">${job.company}</a>
                        <p class="ledger__summary">${job.summary}</p>
                        <div class="ledger__row">
                            <span class="ledger__row-label">Notes</span>
                            <ol class="ledger__achievements">
                                ${job.achievements.map(a => `<li><span>${a}</span></li>`).join('')}
                            </ol>
                        </div>
                        <div class="ledger__row">
                            <span class="ledger__row-label">Stack</span>
                            <ul class="ledger__stack">
                                ${job.stack.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
    }

    // ------------------------------------------------------------
    // Artifacts (Projects)
    // ------------------------------------------------------------

    function renderArtifacts(data) {
        const { projects } = data;

        document.getElementById('artifacts-grid').innerHTML = projects.map((project, i) => {
            const featured = project.featured;
            const stats = [];
            if (project.stars) {
                stats.push(`<span><svg class="artifact__stat-icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-star"/></svg>${project.stars}</span>`);
            }
            if (project.forks) {
                stats.push(`<span><svg class="artifact__stat-icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-fork"/></svg>${project.forks}</span>`);
            }

            const id = `A·${String(i + 1).padStart(2, '0')}`;
            const label = featured
                ? '<span class="artifact__label">Featured</span>'
                : '';

            return `
                <article class="artifact ${featured ? 'artifact--featured' : ''}">
                    <header class="artifact__head">
                        <span class="artifact__id">PLATE ${id}</span>
                        ${label}
                    </header>
                    <h3 class="artifact__title">${project.name}</h3>
                    <p class="artifact__desc">${project.description}</p>
                    <footer class="artifact__foot">
                        <div class="artifact__stats">${stats.join('') || '<span>—</span>'}</div>
                        <a href="${project.url}" class="artifact__link" target="_blank" rel="noopener">
                            <span>View</span>
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12L12 4M12 4H6M12 4V10"/></svg>
                        </a>
                    </footer>
                </article>
            `;
        }).join('');
    }

    // ------------------------------------------------------------
    // Essays (Writing)
    // ------------------------------------------------------------

    function renderEssays(data) {
        const { articles } = data;

        document.getElementById('essays-list').innerHTML = articles.map((article, i) => `
            <li class="essays__item">
                <a href="${article.url}" target="_blank" rel="noopener" style="display:contents;">
                    <span class="essays__index">№ ${String(i + 1).padStart(2, '0')}</span>
                    <div class="essays__content">
                        <h3 class="essays__title">${article.title}</h3>
                        <p class="essays__excerpt">${article.excerpt}</p>
                    </div>
                    <span class="essays__arrow">→</span>
                </a>
            </li>
        `).join('');
    }

    // ------------------------------------------------------------
    // Correspondence (Connect)
    // ------------------------------------------------------------

    function renderCorrespondence(data) {
        const { social } = data;

        document.getElementById('correspondence-handles').innerHTML = social.map(link => `
            <li>
                <a href="${link.url}" class="handle" target="_blank" rel="noopener">
                    <svg class="handle__icon" viewBox="0 0 24 24"><use href="#icon-${link.icon}"></use></svg>
                    <span class="handle__name">${link.name}</span>
                </a>
            </li>
        `).join('');
    }

    // ------------------------------------------------------------
    // Colophon (Footer)
    // ------------------------------------------------------------

    function renderColophon(data) {
        const { footer, personal } = data;
        document.getElementById('colophon-loc').textContent = personal.location;
        document.getElementById('colophon-badge').textContent = footer.badge;
        document.getElementById('colophon-copy').textContent = `© ${footer.copyright} · ${footer.year}`;
    }

    // ------------------------------------------------------------
    // Animations & interactions
    // ------------------------------------------------------------

    function initAnimations() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll(
            '.chapter__head, .ledger__item, .artifact, .essays__item'
        ).forEach(el => observer.observe(el));
    }

    // ------------------------------------------------------------
    // Init
    // ------------------------------------------------------------

    async function init() {
        try {
            const data = await loadData();

            renderOverture(data);
            renderPlate(data);
            renderAbout(data);
            renderPractice(data);
            renderArtifacts(data);
            renderEssays(data);
            renderCorrespondence(data);
            renderColophon(data);

            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('loading--hidden');
                setTimeout(() => loading.remove(), 700);
            }

            initAnimations();
        } catch (error) {
            console.error('Failed to initialize:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
