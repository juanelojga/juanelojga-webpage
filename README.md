# Juan Almeida - Personal Portfolio Website

A high-performance, multilingual personal portfolio website built with Astro, showcasing projects, experience, and technical expertise.

🌐 **Live Site:** [https://www.juanelojga.com](https://www.juanelojga.com)

## ✨ Features

- 🚀 **Lightning Fast**: Built with Astro for optimal performance and SEO
- 🌍 **Internationalization**: Full support for English and Spanish
- 📱 **Fully Responsive**: Mobile-first design with Tailwind CSS
- ♿ **Accessible**: WCAG compliant with semantic HTML and ARIA attributes
- 🎨 **Modern Design**: Clean UI with Material Symbols and FontAwesome icons
- 📊 **Analytics Ready**: Google Analytics integration via Partytown
- 🔍 **SEO Optimized**: Sitemap generation, Open Graph tags, and semantic markup
- 🛠️ **Developer Tools**: ESLint, Prettier, Husky, and lint-staged pre-configured

## 🏗️ Tech Stack

### Core Framework

- **Astro 5.15.3** - Static Site Generator
- **TypeScript 5.9.3** - Type-safe JavaScript

### Styling & UI

- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Material Symbols 0.39.1** - Modern iconography
- **FontAwesome 7.1.0** - Icon library

### Integrations

- **@astrojs/tailwind** - Tailwind CSS integration
- **@astrojs/sitemap** - Automatic sitemap generation
- **@astrojs/image** - Optimized image handling
- **@astrojs/partytown** - Third-party script optimization

### Code Quality

- **ESLint 8.57.1** - Linting for JavaScript, TypeScript, and Astro
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks
- **lint-staged 16.2.6** - Pre-commit linting

## 🚀 Project Structure

text juanelojga-webpage/ ├── public/ # Static assets │ ├── favicon.ico │ ├── me.jpg │ └── og-image.jpg ├── src/ │ ├── assets/ # Build-time assets │ ├── components/ # Reusable Astro components │ │ ├── About.astro │ │ ├── Contact.astro │ │ ├── Footer.astro │ │ ├── GoogleAnalytics.astro │ │ ├── Hero.astro │ │ ├── Navbar.astro │ │ └── Projects.astro │ ├── content/ # Content collections (JSON data) │ │ ├── core-technologies.json │ │ ├── experience.json │ │ ├── projects.json │ │ └── tools-platforms.json │ ├── css/ # Global styles │ ├── i18n/ # Internationalization │ │ ├── en.json │ │ └── es.json │ ├── layouts/ # Page layouts │ │ └── Layout.astro │ ├── pages/ # Route pages │ │ ├── [lang]/ # Localized routes │ │ │ └── index.astro │ │ └── index.astro # Root redirect │ ├── tests/ # Test files │ └── utils/ # Utility functions ├── astro.config.mjs # Astro configuration ├── tailwind.config.mjs # Tailwind configuration ├── tsconfig.json # TypeScript configuration ├── netlify.toml # Netlify deployment config └── package.json # Dependencies and scripts

## 🧞 Commands

All commands are run from the root of the project:

| Command             | Action                                              |
| :------------------ | :-------------------------------------------------- |
| `npm install`       | Install dependencies                                |
| `npm run dev`       | Start local dev server at `localhost:4321`          |
| `npm run build`     | Build production site to `./dist/`                  |
| `npm run preview`   | Preview your build locally before deploying         |
| `npm run lint`      | Run ESLint to check for code issues                 |
| `npm run lint:fix`  | Fix ESLint issues automatically                     |
| `npm run format`    | Format code with Prettier                           |
| `npm run astro ...` | Run Astro CLI commands (`astro add`, `astro check`) |

## 🌍 Internationalization (i18n)

The website supports multiple languages with Astro's built-in i18n routing:

- **Default Locale**: English (`en`)
- **Supported Locales**: English (`en`), Spanish (`es`)
- **URL Structure**:
  - English: `https://www.juanelojga.com/en/`
  - Spanish: `https://www.juanelojga.com/es/`

Translation files are located in `src/i18n/` with structured JSON containing all UI strings and content.

## 📦 Content Management

Content is managed through JSON files in `src/content/`:

- `core-technologies.json` - Core technical skills
- `experience.json` - Professional experience
- `projects.json` - Portfolio projects
- `tools-platforms.json` - Tools and platforms

This approach enables easy content updates without modifying component code.

## 🚀 Deployment

The site is configured for deployment on **Netlify** with:

- Automatic builds on push
- Node.js 20 environment
- Optimized caching for static assets
- Automatic redirects for i18n routing

Deploy configuration is in `netlify.toml`.

## 🛠️ Development Setup

### Prerequisites

- **Node.js 20** (specified in `.nvmrc`)
- npm package manager

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd juanelojga-webpage
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:4321`

### Code Quality

Git hooks are automatically set up via Husky to run:

- ESLint and Prettier checks before commits
- Auto-formatting for staged files

## 📝 License

This project is a personal portfolio website. All rights reserved.

## 👤 Contact

**Juan Almeida**

- Website: [www.juanelojga.com](https://www.juanelojga.com)
- GitHub: [Your GitHub Profile]
- LinkedIn: [Your LinkedIn Profile]

---

Built with ❤️ using [Astro](https://astro.build)
