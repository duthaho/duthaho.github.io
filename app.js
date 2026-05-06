/**
 * duthaho — about page
 * Renders data.json into a GitHub-profile-style layout (light, B/homage).
 */
(function () {
    'use strict';

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    const $ = (id) => document.getElementById(id);
    const slugify = (s) => String(s).toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');

    function relativeTime(iso) {
        if (!iso) return '';
        const then = new Date(iso);
        if (isNaN(then)) return '';
        const now = new Date();
        const diffMs = now - then;
        const sec = Math.round(diffMs / 1000);
        const min = Math.round(sec / 60);
        const hr  = Math.round(min / 60);
        const day = Math.round(hr / 24);
        const wk  = Math.round(day / 7);
        const mo  = Math.round(day / 30);
        const yr  = Math.round(day / 365);
        if (sec < 60)   return 'just now';
        if (min < 60)   return `${min} min ago`;
        if (hr  < 24)   return `${hr} hr${hr > 1 ? 's' : ''} ago`;
        if (day < 14)   return `${day} day${day > 1 ? 's' : ''} ago`;
        if (wk  < 5)    return `${wk} week${wk > 1 ? 's' : ''} ago`;
        if (mo  < 12)   return `${mo} month${mo > 1 ? 's' : ''} ago`;
        return `${yr} year${yr > 1 ? 's' : ''} ago`;
    }

    // Deterministic visual proportions for the language bar.
    // First item gets the highest weight; weights drop off geometrically.
    function languageWeights(stack) {
        const decay = 0.82;
        const weights = stack.map((_, i) => Math.pow(decay, i));
        const total = weights.reduce((s, w) => s + w, 0);
        return weights.map((w) => +(100 * w / total).toFixed(1));
    }

    function langColor(index) {
        return `var(--lang-${(index % 12) + 1})`;
    }

    // Map each company to a small mono-cased token (max 3 letters)
    function companyToken(name) {
        const cleaned = String(name).replace(/[^A-Za-z0-9 ]/g, '').trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
        return parts.slice(0, 3).map(p => p[0]).join('').toUpperCase();
    }

    function escapeHTML(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ----------------------------------------------------------------
    // Data load
    // ----------------------------------------------------------------

    async function loadData() {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    // ----------------------------------------------------------------
    // Sidebar
    // ----------------------------------------------------------------

    function renderIdentity(data) {
        const { personal } = data;
        $('identity-name').textContent   = personal.name;
        $('identity-handle').textContent = '@' + slugify(personal.nickname || 'duthaho');
        $('identity-title').textContent  = personal.title;
        $('identity-bio').textContent    = personal.description;
    }

    function renderContact(data) {
        const { personal, social } = data;
        const rows = [];
        rows.push(`
            <li class="contact__row">
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><use href="#icon-pin-loc"/></svg>
                <span>${escapeHTML(personal.location)}</span>
            </li>
        `);
        social.forEach(link => {
            rows.push(`
                <li class="contact__row">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><use href="#icon-${escapeHTML(link.icon)}"/></svg>
                    <a href="${escapeHTML(link.url)}" target="_blank" rel="noopener">${escapeHTML(link.name)}</a>
                </li>
            `);
        });
        $('sidebar-contact').innerHTML = rows.join('');
    }

    function renderHighlights(data) {
        $('sidebar-stats').innerHTML = data.stats.map(s => `
            <li class="highlight">
                <span class="highlight__value">${escapeHTML(s.value)}</span>
                <span class="highlight__label">${escapeHTML(s.label)}</span>
            </li>
        `).join('');
    }

    function renderAchievements(data) {
        const glyphMap = {
            arch: 'DS',
            sys:  'PA',
            full: 'FS',
            lead: 'EL'
        };
        $('sidebar-achievements').innerHTML = data.coreSkills.map(skill => `
            <li class="achievement">
                <span class="achievement__glyph">${escapeHTML(glyphMap[skill.type] || '★')}</span>
                <span class="achievement__name">${escapeHTML(skill.name)}</span>
            </li>
        `).join('');
    }

    function renderLanguages(data) {
        const stack = data.techStack;
        const weights = languageWeights(stack);

        const stripHTML = stack.map((_, i) =>
            `<span style="width:${weights[i]}%; background:${langColor(i)};"></span>`
        ).join('');

        // Show top 8 in legend (sidebar can't fit 12 cleanly)
        const top = stack.slice(0, 8);
        const legendHTML = top.map((name, i) => `
            <li>
                <span class="lang-bar__dot" style="background:${langColor(i)};"></span>
                <span>${escapeHTML(name)}</span>
                <span class="lang-bar__pct">${weights[i]}%</span>
            </li>
        `).join('');

        $('sidebar-languages').innerHTML = `
            <div class="lang-bar__strip">${stripHTML}</div>
            <ul class="lang-bar__legend">${legendHTML}</ul>
        `;
    }

    function renderOrgs(data) {
        $('sidebar-orgs').innerHTML = data.experience.map(job => {
            const token = companyToken(job.company);
            const tooltip = `${job.company} — ${job.period}`;
            return `<li><a class="org" href="${escapeHTML(job.url)}" target="_blank" rel="noopener" data-tooltip="${escapeHTML(tooltip)}">${escapeHTML(token)}</a></li>`;
        }).join('');
    }

    // ----------------------------------------------------------------
    // README card
    // ----------------------------------------------------------------

    function renderReadme(data) {
        const { about } = data.personal;
        const paragraphs = about.paragraphs.map(p => `<p>${p}</p>`).join('');
        const tasks = about.principles.map(p => `
            <li>
                <span class="task-list__check">
                    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><use href="#icon-check"/></svg>
                </span>
                <span>${escapeHTML(p)}</span>
            </li>
        `).join('');

        $('readme-body').innerHTML = `
            <h2>Hi, I'm Hop <span aria-hidden="true">👋</span></h2>
            <p class="readme-card__lede">${escapeHTML(about.intro)}</p>
            ${paragraphs}
            <h3>Principles I work by</h3>
            <ul class="task-list">${tasks}</ul>
        `;
    }

    // ----------------------------------------------------------------
    // Pinned grid
    // ----------------------------------------------------------------

    function renderPinned(data) {
        $('pinned-grid').innerHTML = data.projects.map(p => {
            const meta = [];
            if (p.stars) meta.push(`
                <span class="repo-card__meta-item">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-star"/></svg>
                    ${p.stars}
                </span>`);
            if (p.forks) meta.push(`
                <span class="repo-card__meta-item">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-fork"/></svg>
                    ${p.forks}
                </span>`);

            return `
                <article class="repo-card${p.featured ? ' repo-card--featured' : ''}">
                    <header class="repo-card__head">
                        <svg class="repo-card__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><use href="#icon-repo"/></svg>
                        <a class="repo-card__name" href="${escapeHTML(p.url)}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a>
                        <span class="repo-card__chip">Public</span>
                    </header>
                    <p class="repo-card__desc">${escapeHTML(p.description)}</p>
                    <footer class="repo-card__meta">${meta.join('')}</footer>
                </article>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // Experience feed
    // ----------------------------------------------------------------

    function renderExperience(data) {
        const exp = data.experience;
        $('experience-count').textContent = `${exp.length} positions`;

        $('experience-feed').innerHTML = exp.map(job => {
            const slug = `${slugify(job.company)}-${slugify(job.title)}`;
            const period = job.period.replace(/-/g, '–');

            const status = job.status === 'current'
                ? `<span class="feed__status">Current</span>`
                : '';
            const badge = job.badge
                ? `<span class="feed__badge">${escapeHTML(job.badge)}</span>`
                : '';

            const bullets = (job.achievements || []).map(a => `<li>${a}</li>`).join('');

            const stack = (job.stack || []).map((s, i) => `
                <li>
                    <span class="feed__lang-dot" style="background:${langColor(i)};"></span>
                    <span>${escapeHTML(s)}</span>
                </li>
            `).join('');

            return `
                <li class="feed__item">
                    <div class="feed__rail">
                        <span class="feed__dot" aria-hidden="true"></span>
                        <span class="feed__line" aria-hidden="true"></span>
                    </div>
                    <div class="feed__entry">
                        <div class="feed__head">
                            <span class="feed__path">duthaho / <strong>${escapeHTML(slug)}</strong></span>
                            ${badge}
                            <span class="feed__period">${escapeHTML(period)}</span>
                        </div>
                        <article class="feed__card">
                            <header class="feed__card-head">
                                <h3 class="feed__role">${escapeHTML(job.title)}</h3>
                                <span class="feed__sep">·</span>
                                <a class="feed__company" href="${escapeHTML(job.url)}" target="_blank" rel="noopener">${escapeHTML(job.company)}</a>
                                ${status}
                            </header>
                            <p class="feed__summary">${escapeHTML(job.summary)}</p>
                            <ul class="feed__bullets">${bullets}</ul>
                            <ul class="feed__stack">${stack}</ul>
                        </article>
                    </div>
                </li>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // Writing feed
    // ----------------------------------------------------------------

    function renderWriting(data) {
        $('writing-feed').innerHTML = data.articles.map(a => {
            const dateLabel = a.date ? relativeTime(a.date) : '';
            return `
                <li class="writing-feed__item">
                    <span class="writing-feed__icon" aria-hidden="true">
                        <svg viewBox="0 0 16 16" width="14" height="14"><use href="#icon-pencil"/></svg>
                    </span>
                    <div class="writing-feed__body">
                        <div class="writing-feed__meta">Published essay · duthaho.dev</div>
                        <h3 class="writing-feed__title">
                            <a href="${escapeHTML(a.url)}" target="_blank" rel="noopener">${escapeHTML(a.title)}</a>
                        </h3>
                        <p class="writing-feed__excerpt">${escapeHTML(a.excerpt)}</p>
                    </div>
                    ${dateLabel ? `<span class="writing-feed__date">${escapeHTML(dateLabel)}</span>` : ''}
                </li>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // Topics grid
    // ----------------------------------------------------------------

    function renderTopics(data) {
        const interests = data.interests || [];
        // Generate 2-letter token from name; future iteration can swap in real icons.
        const token = (name) => {
            const parts = String(name).split(/\s+/);
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return name.slice(0, 2).toUpperCase();
        };

        $('topics-grid').innerHTML = interests.map(i => `
            <article class="topic">
                <span class="topic__glyph" aria-hidden="true">${escapeHTML(token(i.name))}</span>
                <h3 class="topic__name">${escapeHTML(i.name)}</h3>
                ${i.summary ? `<p class="topic__summary">${escapeHTML(i.summary)}</p>` : ''}
            </article>
        `).join('');
    }

    // ----------------------------------------------------------------
    // Footer
    // ----------------------------------------------------------------

    function renderFooter(data) {
        const { footer, personal } = data;
        $('page-foot').innerHTML = `
            <span>© ${footer.year} ${escapeHTML(footer.copyright)}</span>
            <span>Set in Fraunces &amp; JetBrains Mono</span>
            <span>${escapeHTML(personal.location)}</span>
            <span>${escapeHTML(footer.badge)}</span>
        `;
    }

    // ----------------------------------------------------------------
    // Smooth-scroll for in-page anchors
    // ----------------------------------------------------------------

    function initAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // ----------------------------------------------------------------
    // Init
    // ----------------------------------------------------------------

    async function init() {
        try {
            const data = await loadData();
            document.title = `${data.personal.name} (@duthaho) · ${data.personal.title}`;

            renderIdentity(data);
            renderContact(data);
            renderHighlights(data);
            renderAchievements(data);
            renderLanguages(data);
            renderOrgs(data);

            renderReadme(data);
            renderPinned(data);
            renderExperience(data);
            renderWriting(data);
            renderTopics(data);
            renderFooter(data);

            const loading = $('loading');
            if (loading) {
                loading.classList.add('skeleton-loader--hidden');
                setTimeout(() => loading.remove(), 500);
            }

            initAnchors();
        } catch (err) {
            console.error('Failed to render about page:', err);
            const loading = $('loading');
            if (loading) {
                loading.innerHTML = `<div style="margin:auto; padding:24px; font-family:var(--font-mono); color:var(--text-muted);">
                    Could not load profile data. <a href="javascript:location.reload()">Try again</a>.
                </div>`;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
