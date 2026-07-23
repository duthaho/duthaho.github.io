/**
 * duthaho — about page · "As Built" (Sheet 01)
 * Renders data.json into a blueprint-terminal single-column document: a prompt
 * hero whose signature is a live neofetch panel (ASCII terminal art + dotted-
 * leader fields in a drawing frame, echoing the GitHub profile card), an opening
 * prose block, numbered beliefs, a career timeline with nodes, a focus grid,
 * open-source cards, recent writing, and a closing pull-quote. Blueprint-blue
 * paper, mono-forward, one restrained vermilion registration accent. No
 * framework, no scroll wire. Print/light users are honoured.
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

    // ---------------------------------------------------------------- Nav social
    function renderNavSocial(data) {
        $('nav-social').innerHTML = data.social.map((l) =>
            `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(l.name)}" title="${escapeHTML(l.name)}">${iconSvg(l.icon)}</a>`
        ).join('');
    }

    // ---------------------------------------------------------------- Hero
    // Terminal ASCII art for the fetch panel — pure ASCII so the monospace
    // frame always aligns. Highlighted lines (index 4, 9) render bright.
    function buildArt() {
        const IW = 16;
        const frame = (t) => '|' + (' ' + t).padEnd(IW) + '|';
        const lines = [
            '.' + '-'.repeat(IW) + '.',
            frame('o  o  o'),
            '|' + '-'.repeat(IW) + '|',
            frame('~ $ whoami'),
            frame('> duthaho'),
            frame(''),
            frame('~ $ ./ship.sh'),
            frame('[#######--] 92%'),
            frame(''),
            frame('~ $ _'),
            "'" + '-'.repeat(IW) + "'",
        ];
        const hi = new Set([4, 9]);
        return lines
            .map((ln, i) => (hi.has(i) ? `<b>${escapeHTML(ln)}</b>` : escapeHTML(ln)))
            .join('\n');
    }

    function renderHero(data) {
        const { personal, social, stats = [], footer = {} } = data;
        const urlOf = (icon) => (social.find((s) => s.icon === icon) || {}).url || '#';
        const bare = (u) => String(u).replace(/^https?:\/\//, '').replace(/\/$/, '');
        const rev = `${footer.year || new Date().getFullYear()}.07`;

        // prompt line reads `~/duthaho $ neofetch` (the "~/duthaho" is CSS ::before)
        $('hero-eyebrow').innerHTML =
            `<span class="prompt" aria-hidden="true">$ neofetch</span>`;

        $('hero-name').innerHTML =
            `${escapeHTML(personal.name)}<span class="hero__caret" aria-hidden="true"></span>`;

        $('hero-lede').innerHTML =
            'From AAA mobile titles to AI-powered recruitment — designing ' +
            '<b>systems that scale</b> and the <b>teams that ship them</b>.';

        // --- the signature: neofetch panel (art + dotted-leader fields) ---
        const rowT = (k, v) => `<div class="fetch__row"><dt>${escapeHTML(k)}</dt><span class="fetch__lead" aria-hidden="true"></span><dd>${escapeHTML(v)}</dd></div>`;
        const rowH = (k, v) => `<div class="fetch__row"><dt>${escapeHTML(k)}</dt><span class="fetch__lead" aria-hidden="true"></span><dd>${v}</dd></div>`;
        const head = (t) => `<div class="fetch__head">${escapeHTML(t)}</div>`;
        const link = (u, label) => `<a href="${escapeHTML(u)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>`;
        const uptime = stats[0] ? `${stats[0].value} ${stats[0].label}` : '10+ years in production';

        const info = [
            head(`${(personal.nickname || 'duthaho').toLowerCase()}@architect`),
            rowT('OS', 'Distributed Systems · Linux · K8s'),
            rowT('Host', 'Paradox · ex-Gameloft'),
            rowT('Uptime', uptime),
            rowT('Kernel', 'Event-driven + DDD @ 1M+ req/day'),
            rowT('IDE', 'VS Code · Claude Code'),
            rowT('Location', personal.location),
            head('Stack'),
            rowT('Languages', 'Python · TypeScript · Node.js'),
            rowT('Frameworks', 'Django · FastAPI · Vue'),
            rowT('Data', 'MySQL · MongoDB · Redis'),
            rowT('Infra', 'Kubernetes · Docker · AWS'),
            rowT('Spoken', 'Vietnamese · English'),
            head('Contact'),
            rowH('Résumé', `<a href="resume.html">resume.html →</a>`),
            rowH('GitHub', link(urlOf('github'), '@duthaho')),
            rowH('LinkedIn', link(urlOf('linkedin'), 'in/duthaho')),
            rowH('Blog', link(urlOf('globe'), bare(urlOf('globe')))),
        ].join('');

        const fig = document.createElement('figure');
        fig.className = 'fetch';
        fig.innerHTML =
            `<figcaption class="fetch__stamp">` +
                `<span>Profile — as built · @${escapeHTML(personal.nickname || 'DUTHAHO')}</span>` +
                `<span><i aria-hidden="true">▎</i>DWG NO. DTH-001 · REV ${escapeHTML(rev)}</span>` +
            `</figcaption>` +
            `<pre class="fetch__art" aria-hidden="true">${buildArt()}</pre>` +
            `<dl class="fetch__info">${info}</dl>`;

        const statsEl = $('hero-stats');
        statsEl.parentNode.insertBefore(fig, statsEl);

        $('hero-stats').innerHTML = stats
            .map((s) => `<li><b>${escapeHTML(s.value)}</b> ${escapeHTML(s.label)}</li>`)
            .join('');

        const gh = social.find((s) => s.icon === 'github');
        const li = social.find((s) => s.icon === 'linkedin');
        const links = [
            `<a href="resume.html" class="hlink hlink--primary">Read the résumé <span class="arrow" aria-hidden="true">→</span></a>`,
        ];
        if (gh) links.push(`<a href="${escapeHTML(gh.url)}" target="_blank" rel="noopener" class="hlink">${iconSvg('github')} GitHub</a>`);
        if (li) links.push(`<a href="${escapeHTML(li.url)}" target="_blank" rel="noopener" class="hlink">${iconSvg('linkedin')} LinkedIn</a>`);
        $('hero-actions').innerHTML = links.join('');
    }

    // ---------------------------------------------------------------- Intro prose
    function renderIntro(data) {
        const { about } = data.personal;
        $('intro-prose').innerHTML =
            `<p class="lede">${escapeHTML(about.intro)}</p>` +
            about.paragraphs.map((p) => `<p>${p}</p>`).join('');
    }

    // ---------------------------------------------------------------- Philosophy
    function renderPhilosophy(data) {
        const list = data.personal.about.principles;
        $('philosophy-list').innerHTML = list.map((p) => `
            <li class="belief">
                <span class="belief__no" aria-hidden="true"></span>
                <span class="belief__text">${escapeHTML(p)}</span>
            </li>
        `).join('');
    }

    // ---------------------------------------------------------------- Journey
    function renderJourney(data) {
        const exp = data.experience;
        const start = firstYear(exp);
        const end = lastYear(exp);
        $('journey-meta').textContent =
            `${start && end ? start + '–' + end + ' · ' : ''}${exp.length} roles`;

        $('journey-list').innerHTML = exp.map((job) => {
            const badge = job.badge
                ? `<span class="job__badge">${escapeHTML(job.badge)}</span>` : '';
            const bullets = (job.achievements || []).map((a) => `<li>${a}</li>`).join('');
            const stack = (job.stack || []).map((s) => `<li>${escapeHTML(s)}</li>`).join('');
            return `
                <li class="job">
                    <div class="job__aside">
                        <span class="job__period">${escapeHTML(enDash(job.period))}</span>
                        <a class="job__co" href="${escapeHTML(job.url)}" target="_blank" rel="noopener">${escapeHTML(job.company)}</a>
                        ${badge}
                    </div>
                    <div class="job__body">
                        <h3 class="job__role">${escapeHTML(job.title)}</h3>
                        <p class="job__summary">${escapeHTML(job.summary)}</p>
                        <ul class="job__bullets">${bullets}</ul>
                        <ul class="job__stack">${stack}</ul>
                    </div>
                </li>
            `;
        }).join('');
    }

    // ---------------------------------------------------------------- Focus
    function renderFocus(data) {
        const core = (data.coreSkills || [])
            .map((s) => {
                const detail = (data.interests || []).find((i) => i.name === s.name);
                return `<li>${escapeHTML(s.name)}${detail ? `<span>${escapeHTML(detail.summary)}</span>` : ''}</li>`;
            }).join('');
        const stack = (data.techStack || []).map((t) => `<li>${escapeHTML(t)}</li>`).join('');

        $('focus-body').innerHTML = `
            <div class="focus__group">
                <span class="focus__label">Core practice</span>
                <ul class="corelist">${core}</ul>
            </div>
            <div class="focus__group">
                <span class="focus__label">Tools I reach for</span>
                <ul class="chips">${stack}</ul>
            </div>
        `;
    }

    // ---------------------------------------------------------------- Building
    function renderBuilding(data) {
        $('building-meta').textContent = `${data.projects.length} repositories`;
        $('building-list').innerHTML = data.projects.map((p) => {
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

    // ---------------------------------------------------------------- Writing
    function renderWriting(data) {
        $('writing-meta').textContent = `${data.articles.length} recent`;
        $('writing-list').innerHTML = data.articles.map((a) => `
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

    // ---------------------------------------------------------------- Pull-quote
    function renderQuote() {
        $('pull-quote').innerHTML =
            `Good systems aren’t shipped, they’re inherited. I optimize for the ` +
            `engineer reading this on a bad Wednesday.<cite>How I work</cite>`;
    }

    // ---------------------------------------------------------------- Footer
    function renderFooter(data) {
        const { footer, personal, social } = data;
        const links = social.map((l) =>
            `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(l.name)}" title="${escapeHTML(l.name)}">${iconSvg(l.icon)}</a>`
        ).join('');
        $('page-foot').innerHTML = `
            <span class="foot__mark">duthaho<span class="tick">.</span></span>
            <span>© ${escapeHTML(String(footer.year))} · ${escapeHTML(personal.name)}</span>
            <span class="foot__social">${links}</span>
            <span class="foot__end">${escapeHTML(personal.location)} · Set in Geist · Built by hand</span>
        `;
    }

    // ---------------------------------------------------------------- Reveal
    function setupReveal() {
        const targets = Array.from(document.querySelectorAll('.hero, .block, .pullquote'));

        if (prefersReduced || !('IntersectionObserver' in window)) {
            targets.forEach((t) => t.classList.add('is-in'));
            return;
        }
        targets.forEach((t) => t.classList.add('reveal'));
        // No negative bottom margin: a trailing element (the pull-quote) can
        // never scroll past a -8% line, so it would stay hidden forever.
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    obs.unobserve(e.target);
                }
            });
        }, { rootMargin: '0px', threshold: 0.1 });
        targets.forEach((t) => io.observe(t));
    }

    // ---------------------------------------------------------------- Init
    async function init() {
        try {
            const data = await loadData();
            document.title = `${data.personal.name} (@duthaho) — ${data.personal.title}`;

            renderNavSocial(data);
            renderHero(data);
            renderIntro(data);
            renderPhilosophy(data);
            renderJourney(data);
            renderFocus(data);
            renderBuilding(data);
            renderWriting(data);
            renderQuote();
            renderFooter(data);
            setupReveal();
        } catch (err) {
            console.error('Failed to render page:', err);
            const main = document.querySelector('main');
            if (main) main.innerHTML = `
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
