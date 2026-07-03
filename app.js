/**
 * duthaho — career architecture
 * Renders data.json as an engineering drawing: cyanotype sheet hero with a
 * career system diagram, then numbered spec sections (overview, details,
 * open source, field notes). Diagram nodes cross-reference experience
 * details the way callout bubbles reference details on a real drawing.
 */
(function () {
    'use strict';

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    const $ = (id) => document.getElementById(id);

    function escapeHTML(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    const drawingDate = (iso) => String(iso || '').replace(/-/g, '.');

    // ----------------------------------------------------------------
    // Data load
    // ----------------------------------------------------------------

    async function loadData() {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    // ----------------------------------------------------------------
    // Header bar
    // ----------------------------------------------------------------

    function renderTbar(data) {
        $('tbar-social').innerHTML = data.social.map(link => `
            <li><a href="${escapeHTML(link.url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(link.name)}" title="${escapeHTML(link.name)}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${escapeHTML(link.icon)}"/></svg>
            </a></li>
        `).join('');
    }

    // ----------------------------------------------------------------
    // Sheet (hero)
    // ----------------------------------------------------------------

    function renderSheet(data) {
        const { personal, footer } = data;

        $('sheet-eyebrow').textContent =
            `DWG NO. DTH-001 · CAREER ARCHITECTURE · REV ${footer.year}.07`;
        $('sheet-name').textContent = personal.name;
        $('sheet-role').innerHTML =
            `<span class="role-main">${escapeHTML(personal.title)}</span>` +
            `<span>${escapeHTML(personal.location)}</span>`;
        $('sheet-desc').textContent = personal.description;
    }

    function renderStats(data) {
        $('sheet-stats').innerHTML = data.stats.map(s => `
            <li class="dim">
                <span class="dim__value">${escapeHTML(s.value)}</span>
                <span class="dim__label">${escapeHTML(s.label)}</span>
            </li>
        `).join('');
    }

    function renderTitleBlock(data) {
        const { personal, footer } = data;
        $('sheet-tblock').innerHTML = `
            <div class="tblock__row">
                <div class="tblock__cell tblock__cell--title">
                    <b>Title</b><span>Career architecture — ${escapeHTML(personal.nickname)}</span>
                </div>
            </div>
            <div class="tblock__row">
                <div class="tblock__cell"><b>Drawn by</b><span>@duthaho</span></div>
                <div class="tblock__cell"><b>Checked by</b><span>Production</span></div>
                <div class="tblock__cell"><b>Location</b><span>16.0544°N 108.2022°E</span></div>
            </div>
            <div class="tblock__row">
                <div class="tblock__cell"><b>Scale</b><span>12 yrs : 1 sheet</span></div>
                <div class="tblock__cell"><b>Rev</b><span>${escapeHTML(String(footer.year))}.07</span></div>
                <div class="tblock__cell"><b>Sheet</b><span>1 of 1</span></div>
            </div>
        `;
    }

    // ----------------------------------------------------------------
    // Career diagram (SVG system diagram, chronological left → right)
    // ----------------------------------------------------------------

    function renderDiagram(data) {
        const exp = data.experience;              // reverse-chronological
        const chron = exp.slice().reverse();      // chronological
        const n = chron.length;
        if (n < 2) return;

        const W = 960, H = 208;
        const x0 = 70, x1 = 890, baseY = 118;
        const xs = chron.map((_, i) => x0 + (x1 - x0) * i / (n - 1));

        const parts = [];

        // baseline
        parts.push(`<path class="dgm-line" d="M ${x0 - 26} ${baseY} H ${x1 + 26}"/>`);

        // flow arrows between nodes
        for (let i = 0; i < n - 1; i++) {
            const mx = (xs[i] + xs[i + 1]) / 2;
            parts.push(`<polyline class="dgm-arrow" points="${mx - 4},${baseY - 4} ${mx + 3},${baseY} ${mx - 4},${baseY + 4}"/>`);
        }

        // nodes with callout bubbles (D-numbers match experience details)
        chron.forEach((job, i) => {
            const x = xs[i];
            const dNo = n - i; // Paradox (last chronologically) = D1
            const years = String(job.period).replace(/\s/g, '').replace('-', '–');
            const delay = 0.35 + i * 0.14;
            parts.push(`
                <g class="dgm-node" data-target="detail-${dNo}" style="transition-delay:${delay}s"
                   tabindex="0" role="link" aria-label="${escapeHTML(job.company)}, ${escapeHTML(job.period)} — jump to detail D${dNo}">
                    <line class="leader" x1="${x}" y1="${baseY - 12}" x2="${x}" y2="${baseY - 46}"/>
                    <circle class="bubble" cx="${x}" cy="${baseY - 60}" r="14"/>
                    <text class="dno" x="${x}" y="${baseY - 56.5}" text-anchor="middle">D${dNo}</text>
                    <circle class="dot" cx="${x}" cy="${baseY}" r="7"/>
                    <text class="co" x="${x}" y="${baseY + 36}" text-anchor="middle">${escapeHTML(job.company.toUpperCase())}</text>
                    <text class="period" x="${x}" y="${baseY + 54}" text-anchor="middle">${escapeHTML(years)}</text>
                </g>
            `);
        });

        $('diagram').innerHTML =
            `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="false">${parts.join('')}</svg>`;

        // callout → detail cross-reference
        $('diagram').querySelectorAll('.dgm-node').forEach(node => {
            const go = () => {
                const target = document.getElementById(node.dataset.target);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            node.addEventListener('click', go);
            node.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
            });
        });

        // trigger the draw-in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => $('sheet').classList.add('is-drawn'));
        });
    }

    // ----------------------------------------------------------------
    // 01 Overview
    // ----------------------------------------------------------------

    function renderOverview(data) {
        const { about } = data.personal;

        $('overview-prose').innerHTML =
            `<p class="lede">${escapeHTML(about.intro)}</p>` +
            about.paragraphs.map(p => `<p>${p}</p>`).join('');

        $('overview-scope').innerHTML = data.coreSkills
            .map(s => `<li>${escapeHTML(s.name)}</li>`).join('');

        $('overview-notes').innerHTML = about.principles
            .map(p => `<li>${escapeHTML(p)}</li>`).join('');

        $('overview-stack').innerHTML = data.techStack
            .map(t => `<li>${escapeHTML(t)}</li>`).join('');
    }

    // ----------------------------------------------------------------
    // 02 Experience (detail views)
    // ----------------------------------------------------------------

    function renderExperience(data) {
        const exp = data.experience;
        $('experience-count').textContent = `${exp.length} details · see dwg callouts D1–D${exp.length}`;

        $('experience-feed').innerHTML = exp.map((job, i) => {
            const dNo = i + 1;
            const period = String(job.period).replace('-', '–');
            const badge = job.badge
                ? `<span class="detail__badge">${escapeHTML(job.badge)}</span>` : '';
            const bullets = (job.achievements || []).map(a => `<li>${a}</li>`).join('');
            const stack = (job.stack || []).map(s => `<li>${escapeHTML(s)}</li>`).join('');

            return `
                <li class="detail" id="detail-${dNo}">
                    <div class="detail__no">D${dNo}<small>Detail</small></div>
                    <div class="detail__body">
                        <div class="detail__head">
                            <h3 class="detail__role">${escapeHTML(job.title)}</h3>
                            <a class="detail__co" href="${escapeHTML(job.url)}" target="_blank" rel="noopener">${escapeHTML(job.company)}</a>
                            ${badge}
                            <span class="detail__leader" aria-hidden="true"></span>
                            <span class="detail__period">${escapeHTML(period)}</span>
                        </div>
                        <p class="detail__summary">${escapeHTML(job.summary)}</p>
                        <ul class="detail__bullets">${bullets}</ul>
                        <ul class="detail__stack">${stack}</ul>
                    </div>
                </li>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // 03 Open source
    // ----------------------------------------------------------------

    function renderRepos(data) {
        $('repos-grid').innerHTML = data.projects.map(p => {
            const meta = [];
            if (p.stars) meta.push(`<span><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-star"/></svg>${p.stars}</span>`);
            if (p.forks) meta.push(`<span><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-fork"/></svg>${p.forks}</span>`);
            return `
                <article class="repo${p.featured ? ' repo--featured' : ''}">
                    <a class="repo__name" href="${escapeHTML(p.url)}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a>
                    <p class="repo__desc">${escapeHTML(p.description)}</p>
                    <footer class="repo__meta">${meta.join('')}</footer>
                </article>
            `;
        }).join('');
    }

    // ----------------------------------------------------------------
    // 04 Field notes
    // ----------------------------------------------------------------

    function renderWriting(data) {
        $('writing-feed').innerHTML = data.articles.map(a => `
            <li class="note">
                <span class="note__date">${escapeHTML(drawingDate(a.date))}</span>
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
        const links = social.map(l =>
            `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener">${escapeHTML(l.name)}</a>`
        ).join(' · ');
        $('page-foot').innerHTML = `
            <span>© ${footer.year} ${escapeHTML(footer.copyright)}</span>
            <span>${links}</span>
            <span class="foot__end">${escapeHTML(personal.location)} · Set in Saira &amp; IBM Plex</span>
        `;
    }

    // ----------------------------------------------------------------
    // Init
    // ----------------------------------------------------------------

    async function init() {
        try {
            const data = await loadData();
            document.title = `${data.personal.name} (@duthaho) · ${data.personal.title}`;

            renderTbar(data);
            renderSheet(data);
            renderStats(data);
            renderTitleBlock(data);
            renderDiagram(data);
            renderOverview(data);
            renderExperience(data);
            renderRepos(data);
            renderWriting(data);
            renderFooter(data);
        } catch (err) {
            console.error('Failed to render page:', err);
            document.querySelector('main').innerHTML = `
                <div class="load-error">
                    Could not load profile data — check that data.json is reachable.
                    <a href="javascript:location.reload()">Reload the drawing</a>.
                </div>`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
