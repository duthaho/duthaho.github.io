/**
 * duthaho — about page · "The Through-Line"
 * Renders data.json into a schematic sheet: a hero drawing-title with a drafting
 * title block, a legend/BOM overview, an inverted general-notes panel, an
 * experience spine (one node per role), open-source module blocks, and a field-
 * notes tail. A single minium wire runs the left rail and draws itself on scroll,
 * lighting a node at each station. Ships a working ⌘K palette. No framework.
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

    function firstYear(experience) {
        const years = experience
            .map((j) => (String(j.period).match(/\d{4}/) || [])[0])
            .filter(Boolean)
            .map(Number);
        return years.length ? Math.min(...years) : null;
    }

    function lastYear(experience) {
        const years = experience
            .flatMap((j) => (String(j.period).match(/\d{4}/g) || []))
            .map(Number);
        return years.length ? Math.max(...years) : null;
    }

    // ----------------------------------------------------------------
    // Hero + title block
    // ----------------------------------------------------------------

    function renderHero(data) {
        const { personal, stats, social } = data;

        $('hero-eyebrow').textContent = `${personal.title} · ${personal.location}`;
        $('hero-name').textContent = personal.name;
        $('hero-lede').innerHTML =
            'From AAA mobile titles to AI-powered recruitment — one wire traced ' +
            'through <b>systems that scale</b> and the <b>teams that ship them</b>.';

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

        renderTitleBlock(data);
    }

    // Drafting title block — the metadata box in the corner of every drawing.
    function renderTitleBlock(data) {
        const { personal } = data;
        const since = firstYear(data.experience) || 2013;
        const rev = `${data.footer.year}.07`;

        const cell = (label, value, mod) =>
            `<div class="tcell${mod ? ' ' + mod : ''}">
                <dt>${escapeHTML(label)}</dt>
                <dd>${value}</dd>
            </div>`;

        $('hero-block').innerHTML = `
            <figcaption class="tblock__cap">
                <span>Title block · whoami</span>
                <span class="dot" aria-hidden="true"></span>
            </figcaption>
            <dl class="tblock__grid">
                ${cell('Drawn by', escapeHTML(personal.name))}
                ${cell('Handle', '@duthaho')}
                ${cell('Role', escapeHTML(personal.title))}
                ${cell('Location', escapeHTML(personal.location))}
                ${cell('Since', String(since))}
                ${cell('Focus', 'systems · teams')}
                ${cell('Status', `<span class="tstatus" id="hero-status"></span><span class="caret" id="hero-caret" aria-hidden="true">.</span>`, 'tcell--wide tcell--status')}
                ${cell('Sheet', `01 — About · rev ${escapeHTML(rev)}`, 'tcell--wide')}
            </dl>
        `;

        typeStatus('building in the open');
    }

    function typeStatus(text) {
        const el = $('hero-status');
        const caret = $('hero-caret');
        if (!el) return;

        if (prefersReduced) {
            el.textContent = text;
            if (caret) caret.remove();
            return;
        }

        let i = 0;
        const tick = () => {
            el.textContent = text.slice(0, i);
            i += 1;
            if (i <= text.length) {
                setTimeout(tick, 45);
            } else if (caret) {
                setTimeout(() => caret.remove(), 1200);
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
    // General notes — inverted panel
    // ----------------------------------------------------------------

    function renderPrinciples(data) {
        const list = data.personal.about.principles;
        $('principles-list').innerHTML = list.map((p, i) => `
            <li class="note-item">
                <span class="note-item__no">N.${String(i + 1).padStart(2, '0')}</span>
                <span class="note-item__text">${escapeHTML(p)}</span>
            </li>
        `).join('');
    }

    // ----------------------------------------------------------------
    // Experience — spine with a node per role
    // ----------------------------------------------------------------

    function renderExperience(data) {
        const exp = data.experience;
        const start = firstYear(exp);
        const end = lastYear(exp);
        $('experience-meta').textContent =
            `${start && end ? start + '–' + end + ' · ' : ''}${exp.length} roles`;

        $('experience-list').innerHTML = exp.map((job) => {
            const badge = job.badge
                ? `<span class="xp__badge">${escapeHTML(job.badge)}</span>` : '';
            const bullets = (job.achievements || []).map((a) => `<li>${a}</li>`).join('');
            const stack = (job.stack || []).map((s) => `<li>${escapeHTML(s)}</li>`).join('');
            return `
                <li class="xp__row">
                    <span class="node" aria-hidden="true"></span>
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
        $('oss-meta').textContent = `${data.projects.length} modules`;
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
            <span class="foot__mark">duthaho<span class="tick">.</span></span>
            <span>© ${escapeHTML(String(footer.year))} · ${escapeHTML(personal.name)}</span>
            <span class="foot__social">${links}</span>
            <span class="foot__end">Sheet 01 of 01 · ${escapeHTML(personal.location)} · Set in Archivo &amp; IBM Plex</span>
        `;
    }

    // ----------------------------------------------------------------
    // The wire — scroll-linked trace + node wiring on reveal
    // ----------------------------------------------------------------

    function setupWire() {
        const trace = $('spine-trace');
        const frame = document.querySelector('.frame');
        const nodes = Array.from(document.querySelectorAll('.sheet__head, .xp__row'));

        if (prefersReduced || !frame) {
            if (trace) trace.style.setProperty('--progress', '1');
            nodes.forEach((n) => n.classList.add('is-wired'));
            return;
        }

        // Draw the trace proportional to how far the sheet has been read.
        let ticking = false;
        const update = () => {
            ticking = false;
            const rect = frame.getBoundingClientRect();
            const vh = window.innerHeight;
            const span = rect.height - vh * 0.5;
            const passed = vh * 0.5 - rect.top;
            const p = span > 0 ? Math.min(1, Math.max(0, passed / span)) : 1;
            if (trace) trace.style.setProperty('--progress', p.toFixed(4));
        };
        const onScroll = () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update();

        // Light each node as its station passes the trace tip.
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-wired');
                        obs.unobserve(e.target);
                    }
                });
            }, { rootMargin: '0px 0px -45% 0px', threshold: 0 });
            nodes.forEach((n) => io.observe(n));
        } else {
            nodes.forEach((n) => n.classList.add('is-wired'));
        }
    }

    // ----------------------------------------------------------------
    // Reveal — one composed entrance per region, then static
    // ----------------------------------------------------------------

    function setupReveal() {
        const targets = ['hero-block', 'overview', 'principles', 'experience', 'oss', 'writing']
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
            setupWire();
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
