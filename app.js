/**
 * duthaho — about page
 * Renders data.json into a modern-minimal / Cobalt layout: a Marquee hero with
 * a hand-built API-response profile card, an overview, a dark principles band,
 * an experience list, open-source cards, and field notes. Ships a working ⌘K
 * command palette and a single composed reveal. No framework.
 */
(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function escapeHTML(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    const dotDate = (iso) => String(iso || '').replace(/-/g, '.');
    const enDash = (s) => String(s).replace(/\s*-\s*/g, '–');

    async function loadData() {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    function iconSvg(id, cls) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}><use href="#icon-${id}"/></svg>`;
    }

    // ----------------------------------------------------------------
    // Hero
    // ----------------------------------------------------------------

    function firstYear(experience) {
        const years = experience
            .map((j) => (String(j.period).match(/\d{4}/) || [])[0])
            .filter(Boolean)
            .map(Number);
        return years.length ? Math.min(...years) : null;
    }

    function renderHero(data) {
        const { personal, stats, social } = data;

        $('hero-eyebrow').textContent = `${personal.title} — ${personal.location}`;
        $('hero-name').textContent = personal.name;
        $('hero-lede').innerHTML =
            'From AAA mobile titles to AI-powered recruitment — designing ' +
            '<b>systems that scale</b>, and the <b>teams that ship them</b>.';

        $('hero-stats').innerHTML = stats.map((s) => `
            <div class="hero__stat">
                <b>${escapeHTML(s.value)}</b>
                <span>${escapeHTML(s.label)}</span>
            </div>
        `).join('');

        const gh = social.find((s) => s.icon === 'github');
        $('hero-actions').innerHTML = `
            <a href="resume.html" class="btn btn--primary">Read the résumé ${iconSvg('arrow')}</a>
            ${gh ? `<a href="${escapeHTML(gh.url)}" target="_blank" rel="noopener" class="btn btn--ghost">${iconSvg('github')} GitHub</a>` : ''}
        `;

        renderHeroCard(data);
    }

    // Hand-built profile-as-API-response card — no fake window chrome (no dots).
    function renderHeroCard(data) {
        const { personal } = data;
        const since = firstYear(data.experience) || 2013;
        const handle = '@duthaho';

        const line = (k, v, comma) =>
            `  <span class="tok-punct">"</span><span class="tok-key">${escapeHTML(k)}</span><span class="tok-punct">": </span>${v}<span class="tok-punct">${comma ? ',' : ''}</span>`;
        const str = (v) => `<span class="tok-punct">"</span><span class="tok-str">${escapeHTML(v)}</span><span class="tok-punct">"</span>`;
        const num = (v) => `<span class="tok-num">${escapeHTML(String(v))}</span>`;

        const body =
            `<span class="req"><b>GET</b> /whoami</span>` +
            `<span class="tok-punct">{</span>\n` +
            line('name', str(personal.name), true) + '\n' +
            line('handle', str(handle), true) + '\n' +
            line('role', str(personal.title), true) + '\n' +
            line('based', str(personal.location), true) + '\n' +
            line('since', num(since), true) + '\n' +
            line('focus', `<span class="tok-punct">[</span>${str('systems')}<span class="tok-punct">, </span>${str('teams')}<span class="tok-punct">]</span>`, true) + '\n' +
            `  <span class="tok-punct">"</span><span class="tok-key">status</span><span class="tok-punct">": </span><span class="tok-punct">"</span><span class="tok-str" id="hero-status"></span><span class="caret" id="hero-caret" aria-hidden="true">.</span><span class="tok-punct" id="hero-status-close" hidden>"</span>\n` +
            `<span class="tok-punct">}</span>`;

        $('hero-card').innerHTML = `
            <figcaption class="card__bar">
                <span class="card__file">whoami.json</span>
                <span class="status">200 OK</span>
            </figcaption>
            <div class="card__body">${body}</div>
        `;

        typeStatus('building in the open');
    }

    function typeStatus(text) {
        const el = $('hero-status');
        const caret = $('hero-caret');
        const close = $('hero-status-close');
        if (!el) return;

        if (prefersReduced) {
            el.textContent = text;
            if (caret) caret.remove();
            if (close) close.hidden = false;
            return;
        }

        let i = 0;
        const tick = () => {
            el.textContent = text.slice(0, i);
            i += 1;
            if (i <= text.length) {
                setTimeout(tick, 45);
            } else if (close) {
                close.hidden = false;
                if (caret) setTimeout(() => caret.remove(), 900);
            }
        };
        setTimeout(tick, 650);
    }

    // ----------------------------------------------------------------
    // Overview
    // ----------------------------------------------------------------

    function renderOverview(data) {
        const { about } = data.personal;

        $('overview-meta').textContent = data.personal.location;
        $('overview-prose').innerHTML =
            `<p class="lede">${escapeHTML(about.intro)}</p>` +
            about.paragraphs.map((p) => `<p>${p}</p>`).join('');

        $('overview-skills').innerHTML = data.coreSkills
            .map((s) => `<li>${escapeHTML(s.name)}</li>`).join('');
        $('overview-stack').innerHTML = data.techStack
            .map((t) => `<li>${escapeHTML(t)}</li>`).join('');
    }

    // ----------------------------------------------------------------
    // Principles — dark band
    // ----------------------------------------------------------------

    function renderPrinciples(data) {
        const list = data.personal.about.principles;
        $('principles-list').innerHTML = list.map((p, i) => `
            <li class="principle">
                <span class="principle__no">${String(i + 1).padStart(2, '0')}</span>
                <span class="principle__text">${escapeHTML(p)}</span>
            </li>
        `).join('');
    }

    // ----------------------------------------------------------------
    // Experience
    // ----------------------------------------------------------------

    function renderExperience(data) {
        const exp = data.experience;
        const start = firstYear(exp);
        $('experience-meta').textContent =
            `${start ? start + ' – 2025 · ' : ''}${exp.length} roles`;

        $('experience-list').innerHTML = exp.map((job) => {
            const badge = job.badge
                ? `<span class="xp__badge">${escapeHTML(job.badge)}</span>` : '';
            const bullets = (job.achievements || []).map((a) => `<li>${a}</li>`).join('');
            const stack = (job.stack || []).map((s) => `<li>${escapeHTML(s)}</li>`).join('');
            return `
                <li class="xp__row">
                    <div class="xp__aside">
                        <span class="xp__period">${escapeHTML(enDash(job.period))}</span>
                        <a class="xp__co" href="${escapeHTML(job.url)}" target="_blank" rel="noopener">${escapeHTML(job.company)}</a>
                        ${badge}
                    </div>
                    <div class="xp__body">
                        <h3 class="xp__role">${escapeHTML(job.title)}</h3>
                        <p class="xp__summary">${escapeHTML(job.summary)}</p>
                        <ul class="xp__bullets">${bullets}</ul>
                        <ul class="xp__stack">${stack}</ul>
                    </div>
                </li>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // Open source
    // ----------------------------------------------------------------

    function renderRepos(data) {
        $('oss-meta').textContent = `${data.projects.length} repositories`;
        $('repos-grid').innerHTML = data.projects.map((p) => {
            const meta = [];
            if (p.stars) meta.push(`<span>${iconSvg('star')}${p.stars}</span>`);
            if (p.forks) meta.push(`<span>${iconSvg('fork')}${p.forks}</span>`);
            return `
                <article class="repo${p.featured ? ' repo--featured' : ''}">
                    <div class="repo__head">
                        <a class="repo__name" href="${escapeHTML(p.url)}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a>
                        ${p.featured ? '<span class="repo__tag">Featured</span>' : ''}
                    </div>
                    <p class="repo__desc">${escapeHTML(p.description)}</p>
                    <footer class="repo__meta">${meta.join('')}</footer>
                </article>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // Field notes
    // ----------------------------------------------------------------

    function renderWriting(data) {
        $('writing-meta').textContent = `${data.articles.length} recent`;
        $('writing-feed').innerHTML = data.articles.map((a) => `
            <li class="note">
                <span class="note__date">${escapeHTML(dotDate(a.date))}</span>
                <div class="note__body">
                    <h3 class="note__title">
                        <a href="${escapeHTML(a.url)}" target="_blank" rel="noopener">${escapeHTML(a.title)}</a>
                    </h3>
                    <p class="note__excerpt">${escapeHTML(a.excerpt)}</p>
                </div>
            </li>
        `).join('');
    }

    // ----------------------------------------------------------------
    // Footer
    // ----------------------------------------------------------------

    function renderFooter(data) {
        const { footer, personal, social } = data;
        const links = social.map((l) =>
            `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(l.name)}" title="${escapeHTML(l.name)}">${iconSvg(l.icon)}</a>`
        ).join('');
        $('page-foot').innerHTML = `
            <span class="foot__mark">duthaho<span class="dot">.</span></span>
            <span>© ${escapeHTML(String(footer.year))} · ${escapeHTML(personal.name)}</span>
            <span class="foot__social">${links}</span>
            <span class="foot__end">${escapeHTML(personal.location)} · Set in Space Grotesk &amp; Inter</span>
        `;
    }

    // ----------------------------------------------------------------
    // Reveal — one composed entrance per section, then static
    // ----------------------------------------------------------------

    function setupReveal() {
        const targets = ['hero-card', 'overview', 'principles', 'experience', 'oss', 'writing']
            .map($).filter(Boolean);

        if (prefersReduced || !('IntersectionObserver' in window)) {
            targets.forEach((t) => t.classList.add('is-in'));
            return;
        }

        targets.forEach((t) => t.classList.add('reveal'));
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    obs.unobserve(e.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        targets.forEach((t) => io.observe(t));
    }

    // ----------------------------------------------------------------
    // ⌘K command palette
    // ----------------------------------------------------------------

    function buildCommands(data) {
        const cmds = [
            { group: 'Sections', label: 'Overview', icon: 'hash', hint: '↵', scroll: 'overview' },
            { group: 'Sections', label: 'Experience', icon: 'hash', hint: '↵', scroll: 'experience' },
            { group: 'Sections', label: 'Open source', icon: 'hash', hint: '↵', scroll: 'oss' },
            { group: 'Sections', label: 'Field notes', icon: 'hash', hint: '↵', scroll: 'writing' },
            { group: 'Links', label: 'Résumé', icon: 'arrow', hint: 'open', href: 'resume.html' },
        ];
        data.social.forEach((s) => {
            cmds.push({ group: 'Links', label: s.name, icon: s.icon, hint: 'open ↗', href: s.url, external: true });
        });
        return cmds;
    }

    function setupPalette(data) {
        const overlay = $('palette');
        const opener = $('palette-open');
        const search = $('palette-search');
        const list = $('palette-list');
        if (!overlay || !opener || !search || !list) return;

        overlay.hidden = false; // JS present — CSS keeps it invisible until .is-open
        const commands = buildCommands(data);
        let filtered = commands.slice();
        let active = 0;
        let lastFocus = null;

        function render() {
            if (!filtered.length) {
                list.innerHTML = '<p class="palette__empty">No matches.</p>';
                return;
            }
            let html = '';
            let group = null;
            filtered.forEach((c, i) => {
                if (c.group !== group) {
                    group = c.group;
                    html += `<p class="palette__group">${escapeHTML(group)}</p>`;
                }
                html += `
                    <button class="pcmd${i === active ? ' is-active' : ''}" type="button" role="option"
                            aria-selected="${i === active}" data-i="${i}">
                        ${iconSvg(c.icon)}
                        <span>${escapeHTML(c.label)}</span>
                        <span class="pcmd__hint">${escapeHTML(c.hint)}</span>
                    </button>`;
            });
            list.innerHTML = html;
        }

        function filter() {
            const q = search.value.trim().toLowerCase();
            filtered = q
                ? commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
                : commands.slice();
            active = 0;
            render();
        }

        function open() {
            lastFocus = document.activeElement;
            overlay.classList.add('is-open');
            search.value = '';
            filter();
            requestAnimationFrame(() => search.focus());
            document.body.style.overflow = 'hidden';
        }

        function close() {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        function run(cmd) {
            close();
            if (!cmd) return;
            if (cmd.scroll) {
                const target = $(cmd.scroll);
                if (target) target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
            } else if (cmd.href) {
                if (cmd.external) window.open(cmd.href, '_blank', 'noopener');
                else window.location.href = cmd.href;
            }
        }

        function move(delta) {
            if (!filtered.length) return;
            active = (active + delta + filtered.length) % filtered.length;
            render();
            const el = list.querySelector('.is-active');
            if (el) el.scrollIntoView({ block: 'nearest' });
        }

        opener.addEventListener('click', open);
        search.addEventListener('input', filter);

        list.addEventListener('click', (e) => {
            const btn = e.target.closest('.pcmd');
            if (btn) run(filtered[Number(btn.dataset.i)]);
        });
        list.addEventListener('mousemove', (e) => {
            const btn = e.target.closest('.pcmd');
            if (btn) {
                const i = Number(btn.dataset.i);
                if (i !== active) { active = i; render(); }
            }
        });

        overlay.addEventListener('mousedown', (e) => {
            if (e.target === overlay) close();
        });

        search.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); run(filtered[active]); }
            else if (e.key === 'Escape') { e.preventDefault(); close(); }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                overlay.classList.contains('is-open') ? close() : open();
            } else if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
                close();
            }
        });
    }

    // ----------------------------------------------------------------
    // Init
    // ----------------------------------------------------------------

    async function init() {
        try {
            const data = await loadData();
            document.title = `${data.personal.name} (@duthaho) · ${data.personal.title}`;

            renderHero(data);
            renderOverview(data);
            renderPrinciples(data);
            renderExperience(data);
            renderRepos(data);
            renderWriting(data);
            renderFooter(data);
            setupReveal();
            setupPalette(data);
        } catch (err) {
            console.error('Failed to render page:', err);
            document.querySelector('main').innerHTML = `
                <div class="load-error">
                    Could not load profile data — check that data.json is reachable.
                    <a href="javascript:location.reload()">Reload</a>.
                </div>`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
