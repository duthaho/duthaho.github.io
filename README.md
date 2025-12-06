# Duong Thanh Hop (DUTHAHO) - Interactive CV

A terminal-inspired interactive CV/Resume showcasing professional experience, skills, and projects with a bold developer-centric aesthetic.

![CV Preview](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

## Overview

This interactive CV presents professional experience, technical skills, and projects through a distinctive **Terminal Architecture** theme. The dark, sophisticated design features terminal-inspired elements, ASCII art, and code editor aesthetics that authentically represent a Solution Architect's identity.

## Features

- **Dynamic Content** - All CV data loaded from `data.json` for easy updates
- **Dark Terminal Aesthetic** - Deep navy palette with cyan/magenta/amber accents
- **ASCII Art Hero** - Striking name banner with animated glow effect
- **Interactive Terminal** - Simulated command-line showing skills and tech stack
- **Timeline Experience** - Vertical timeline with glowing markers and hover effects
- **Scroll Animations** - Elements fade in as you scroll (IntersectionObserver)
- **Responsive Design** - Fully adaptive from mobile to desktop
- **Print Optimized** - Clean print styles for PDF export
- **Noise Texture** - Subtle grain overlay for depth and atmosphere

## Quick Start

### View Online

Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/duthaho/cv.git

# Navigate to directory
cd cv

# Open in browser (or double-click index.html)
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Local Development

No build process required! Just edit the HTML and CSS files directly.

```bash
# Use any local server (optional)
python -m http.server 8000
# or
npx serve
```

Then visit `http://localhost:8000`

## Project Structure

```
cv/
├── index.html          # HTML template structure
├── styles.css          # Terminal theme styling
├── app.js              # Dynamic content renderer
├── data.json           # CV content data (edit this!)
├── favicon.ico         # Site favicon
└── README.md           # This file
```

## Architecture

The CV uses a data-driven approach:

1. **data.json** - Contains all CV content (personal info, experience, projects, etc.)
2. **app.js** - Fetches JSON and renders content dynamically
3. **index.html** - Provides the HTML template structure
4. **styles.css** - Handles all styling and animations

This separation makes it easy to update content without touching HTML/JS code.

## Design System

### Color Palette

```css
:root {
    /* Core palette */
    --bg-primary: #0a0e17;
    --bg-secondary: #111827;
    --bg-tertiary: #1a2332;

    /* Terminal accents */
    --accent-cyan: #22d3ee;
    --accent-magenta: #e879f9;
    --accent-amber: #fbbf24;
    --accent-green: #4ade80;
}
```

### Typography

- **Display**: Playfair Display - Elegant serif for headings
- **Mono**: JetBrains Mono - Code-style for body and UI elements

### Key Animations

- Blinking cursor in navigation
- Typing effect on page load
- Glow pulse on ASCII art
- Scroll-triggered fade-in reveals
- Hover lift effects on cards

## Sections

1. **Navigation**
   - Terminal-style prompt with typing animation
   - Glassmorphism blur effect
   - Smooth scroll links

2. **Hero**
   - ASCII art name banner
   - Role and location
   - Key stats (years, stars, requests)
   - Interactive terminal showing skills

3. **About**
   - Personal introduction
   - Core principles sidebar

4. **Experience**
   - Timeline with 5 positions
   - Achievements with metrics
   - Tech stack tags

5. **Projects**
   - Featured project highlight
   - Grid of open-source work
   - GitHub stats

6. **Writing**
   - Latest technical articles
   - Link to Substack

7. **Connect**
   - Social links with icons
   - GitHub, LinkedIn, Substack, Blog

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **JavaScript** - IntersectionObserver, Smooth scroll, Typing effect
- **Google Fonts** - JetBrains Mono, Playfair Display

## Customization

All content is stored in `data.json`. Simply edit the JSON file to update your CV.

### Update Personal Information

```json
{
  "personal": {
    "name": "Your Name",
    "nickname": "NICKNAME",
    "title": "Your Title",
    "location": "Your City, Country",
    "description": "Your tagline here."
  },
  "stats": [
    { "value": "10+", "label": "years exp" },
    { "value": "100+", "label": "github stars" }
  ]
}
```

### Add/Modify Experience

```json
{
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "url": "https://company.com",
      "period": "2020 - Present",
      "status": "current",
      "summary": "Brief description of role.",
      "achievements": [
        "Achievement with <strong>metrics</strong>",
        "Another achievement"
      ],
      "stack": ["Python", "React", "AWS"]
    }
  ]
}
```

### Add Projects

```json
{
  "projects": [
    {
      "name": "project-name",
      "description": "Project description.",
      "url": "https://github.com/you/project",
      "stars": 50,
      "forks": 10,
      "featured": true
    }
  ]
}
```

### Change Color Scheme

Edit CSS variables in `styles.css`:

```css
:root {
    --accent-cyan: #your-primary;
    --accent-magenta: #your-secondary;
    --accent-amber: #your-tertiary;
}
```

## Responsive Breakpoints

- **Desktop**: 1024px+ (full layout with ASCII art)
- **Tablet**: 768px - 1023px (single column hero, 2-col projects)
- **Mobile**: Below 768px (stacked layout, simplified nav)

## Key Highlights

- 163+ GitHub Stars
- 18+ Forks
- 15+ Public Repositories
- Arctic Code Vault Contributor
- 10+ Years Experience
- Solution Architect

## Live Demo

Visit the live version: [https://duthaho.github.io/cv/](https://duthaho.github.io/cv/)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## License

This project is open source and available under the [MIT License](LICENSE).

## About Me

**Duong Thanh Hop (DUTHAHO)**
- Solution Architect @ [Paradox.ai](https://paradox.ai/)
- Da Nang, Vietnam
- Website: [duthaho.dev](https://www.duthaho.dev)
- LinkedIn: [linkedin.com/in/duthaho](https://www.linkedin.com/in/duthaho)
- GitHub: [github.com/duthaho](https://github.com/duthaho)
- Blog: [duthaho.substack.com](https://duthaho.substack.com/)

## Contributing

While this is a personal CV, feel free to:
- Fork this repository to create your own CV
- Submit issues for bugs or improvements
- Share ideas for better presentation

## Acknowledgments

- Typography by [Google Fonts](https://fonts.google.com/)
- Hosted on [GitHub Pages](https://pages.github.com/)

---

Made with code by [DUTHAHO](https://github.com/duthaho)
