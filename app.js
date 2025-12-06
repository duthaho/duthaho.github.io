/**
 * DUTHAHO CV - Dynamic Content Loader
 * Loads CV data from data.json and renders it to the page
 */

(function() {
    'use strict';

    // ==========================================================================
    // Data Fetching
    // ==========================================================================

    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to load CV data:', error);
            document.getElementById('loading').innerHTML = `
                <div class="loading__error">
                    <p>Failed to load CV data</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
            throw error;
        }
    }

    // ==========================================================================
    // Render Functions
    // ==========================================================================

    function renderHero(data) {
        const { personal, stats } = data;

        // Update page title
        document.title = `${personal.nickname} // ${personal.title}`;

        // Hero content
        document.getElementById('hero-title').textContent = personal.title;
        document.getElementById('hero-name').textContent = personal.name;
        document.getElementById('hero-description').innerHTML = `
            ${personal.description}
            <br>Based in <span class="highlight">${personal.location}</span>.
        `;

        // Stats
        const statsHtml = stats.map(stat => `
            <div class="stat">
                <span class="stat__value">${stat.value}</span>
                <span class="stat__label">${stat.label}</span>
            </div>
        `).join('');
        document.getElementById('hero-stats').innerHTML = statsHtml;
    }

    function renderSkills(data) {
        const { coreSkills, techStack } = data;

        // Core skills
        const coreSkillsHtml = coreSkills.map(skill => `
            <span class="terminal__tag terminal__tag--${skill.type}">${skill.name}</span>
        `).join('');
        document.getElementById('core-skills').innerHTML = coreSkillsHtml;

        // Tech stack
        const techStackHtml = techStack.map(tech => `<span>${tech}</span>`).join('');
        document.getElementById('tech-stack').innerHTML = techStackHtml;
    }

    function renderAbout(data) {
        const { about } = data.personal;

        // About text
        const aboutTextHtml = `
            <p class="about__intro">
                <span class="about__quote">"</span>
                ${about.intro}
            </p>
            ${about.paragraphs.map(p => `<p>${p}</p>`).join('')}
        `;
        document.getElementById('about-text').innerHTML = aboutTextHtml;

        // Principles
        const principlesHtml = about.principles.map(principle => `
            <li><span class="about__bullet">></span> ${principle}</li>
        `).join('');
        document.getElementById('about-principles').innerHTML = principlesHtml;
    }

    function renderExperience(data) {
        const { experience } = data;

        const experienceHtml = experience.map((job, index) => {
            const isLast = index === experience.length - 1;
            const statusBadge = job.status === 'current'
                ? '<span class="job__status job__status--active">CURRENT</span>'
                : '';
            const badge = job.badge
                ? `<span class="job__badge">${job.badge}</span>`
                : '';

            return `
                <article class="job">
                    <div class="job__marker">
                        <div class="job__dot"></div>
                        ${!isLast ? '<div class="job__line"></div>' : ''}
                    </div>
                    <div class="job__content">
                        <header class="job__header">
                            <div class="job__meta">
                                <span class="job__date">${job.period}</span>
                                ${statusBadge}
                                ${badge}
                            </div>
                            <h3 class="job__title">${job.title}</h3>
                            <a href="${job.url}" class="job__company" target="_blank" rel="noopener">@ ${job.company}</a>
                        </header>
                        <div class="job__description">
                            <p class="job__summary">${job.summary}</p>
                            <ul class="job__achievements">
                                ${job.achievements.map(a => `<li>${a}</li>`).join('')}
                            </ul>
                            <div class="job__stack">
                                ${job.stack.map(s => `<span>${s}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        document.getElementById('experience-timeline').innerHTML = experienceHtml;
    }

    function renderProjects(data) {
        const { projects } = data;

        const projectsHtml = projects.map(project => {
            const isFeatured = project.featured;
            const statsHtml = [];

            if (project.stars) {
                statsHtml.push(`<span class="project__stat">${project.stars} stars</span>`);
            }
            if (project.forks) {
                statsHtml.push(`<span class="project__stat">${project.forks} forks</span>`);
            }

            return `
                <article class="project ${isFeatured ? 'project--featured' : ''}">
                    <div class="project__content">
                        ${isFeatured ? '<span class="project__label">Featured</span>' : ''}
                        <h3 class="project__title">${project.name}</h3>
                        <p class="project__description">${project.description}</p>
                        ${statsHtml.length ? `<div class="project__stats">${statsHtml.join('')}</div>` : ''}
                        <a href="${project.url}" class="project__link" target="_blank" rel="noopener">
                            ${isFeatured ? 'View on GitHub' : 'View'}
                            ${isFeatured ? `
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                            ` : ''}
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        document.getElementById('projects-grid').innerHTML = projectsHtml;
    }

    function renderArticles(data) {
        const { articles } = data;

        const articlesHtml = articles.map((article, index) => `
            <a href="${article.url}" class="article" target="_blank" rel="noopener">
                <span class="article__number">${String(index + 1).padStart(2, '0')}</span>
                <div class="article__content">
                    <h3 class="article__title">${article.title}</h3>
                    <p class="article__excerpt">${article.excerpt}</p>
                </div>
                <span class="article__arrow">></span>
            </a>
        `).join('');

        document.getElementById('articles-list').innerHTML = articlesHtml;
    }

    function renderSocial(data) {
        const { social } = data;

        const socialHtml = social.map(link => `
            <a href="${link.url}" class="connect__link" target="_blank" rel="noopener">
                <span class="connect__link-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <use href="#icon-${link.icon}"></use>
                    </svg>
                </span>
                <span>${link.name}</span>
            </a>
        `).join('');

        document.getElementById('connect-links').innerHTML = socialHtml;
    }

    function renderFooter(data) {
        const { footer, personal } = data;

        document.getElementById('footer-copyright').textContent = `${footer.copyright} © ${footer.year}`;
        document.getElementById('footer-location').textContent = personal.location;
        document.getElementById('footer-badge').textContent = footer.badge;
    }

    // ==========================================================================
    // Animations & Interactions
    // ==========================================================================

    function initAnimations() {
        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.job, .project, .article, .section__header').forEach(el => {
            observer.observe(el);
        });
    }

    function initTypingEffect(nickname) {
        const navCommand = document.querySelector('.nav__command');
        const text = `cd ~/${nickname.toLowerCase()}`;

        if (navCommand) {
            navCommand.textContent = '';
            let i = 0;

            const typeWriter = () => {
                if (i < text.length) {
                    navCommand.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };

            setTimeout(typeWriter, 500);
        }
    }

    // ==========================================================================
    // Initialize App
    // ==========================================================================

    async function init() {
        try {
            const data = await loadData();

            // Render all sections
            renderHero(data);
            renderSkills(data);
            renderAbout(data);
            renderExperience(data);
            renderProjects(data);
            renderArticles(data);
            renderSocial(data);
            renderFooter(data);

            // Hide loading screen
            const loading = document.getElementById('loading');
            loading.classList.add('loading--hidden');
            setTimeout(() => loading.remove(), 300);

            // Initialize animations
            initAnimations();
            initTypingEffect(data.personal.nickname);

        } catch (error) {
            console.error('Failed to initialize CV:', error);
        }
    }

    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
