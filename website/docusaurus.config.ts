import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Some Claude Skills | AI Know-How Used at Curiositech",
  tagline: 'Expert AI Agents for Specialized Tasks',
  favicon: 'img/favicon.ico',

  headTags: [
    // Open Graph
    { tagName: 'meta', attributes: { property: 'og:title', content: 'Some Claude Skills — 190+ Expert AI Skills for Claude Code' } },
    { tagName: 'meta', attributes: { property: 'og:description', content: 'Curated collection of production-ready Claude Code skills. Transform Claude into a domain specialist — from ML pipelines to design systems to career coaching.' } },
    { tagName: 'meta', attributes: { property: 'og:type', content: 'website' } },
    { tagName: 'meta', attributes: { property: 'og:site_name', content: 'Some Claude Skills' } },
    // Twitter Card
    { tagName: 'meta', attributes: { name: 'twitter:card', content: 'summary_large_image' } },
    { tagName: 'meta', attributes: { name: 'twitter:title', content: 'Some Claude Skills — 190+ Expert AI Skills for Claude Code' } },
    { tagName: 'meta', attributes: { name: 'twitter:description', content: 'Curated collection of production-ready Claude Code skills by Curiositech.' } },
  ],

  // Client modules that load before the app - plausible shim prevents errors in dev
  clientModules: [
    require.resolve('./src/clientModules/plausibleShim.ts'),
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://someclaudeskills.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For custom domain, use root path
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'erichowens', // Usually your GitHub org/user name.
  projectName: 'some_claude_skills', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // Remove archive PNGs from build output (keeps them in static/ for reference)
    function excludeArchivePlugin() {
      return {
        name: 'exclude-archive-images',
        async postBuild({outDir}) {
          const fs = require('fs');
          const path = require('path');
          const dir = path.join(outDir, 'img', 'old_new_skill_icons_some');
          if (fs.existsSync(dir)) {
            fs.rmSync(dir, {recursive: true});
          }
        },
      };
    },
    function webpackPolyfillPlugin() {
      return {
        name: 'webpack-polyfill-plugin',
        configureWebpack() {
          return {
            resolve: {
              fallback: {
                buffer: require.resolve('buffer/'),
                stream: require.resolve('stream-browserify'),
                process: require.resolve('process/browser'),
              },
            },
          };
        },
      };
    },
    // Plausible analytics - only in production
    ...(process.env.NODE_ENV === 'production' ? [[
      'docusaurus-plugin-plausible',
      {
        domain: 'someclaudeskills.com',
        customDomain: 'plausible.io',
      },
    ]] : []),
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    announcementBar: {
      id: 'os2_launch_2026',
      content: 'NEW: Try the Desktop OS experience — browse 190+ skills in a Windows 3.1 shell! <a target="_blank" rel="noopener noreferrer" href="https://os2.someclaudeskills.com">os2.someclaudeskills.com</a>',
      backgroundColor: '#000080',
      textColor: '#ffffff',
      isCloseable: true,
    },
    // Social card for link previews
    image: 'img/og-image.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Some Claude Skills",
      logo: {
        alt: "Some Claude Skills",
        src: 'img/logo.svg',
      },
      items: [
        // Skills dropdown
        {
          type: 'dropdown',
          label: 'Skills',
          position: 'left',
          items: [
            {
              to: '/skills',
              label: '🎯 Browse All Skills',
            },
            {
              to: '/favorites',
              label: '⭐ My Favorites',
            },
            {
              to: '/submit-skill',
              label: '💡 Got an Idea?',
            },
          ],
        },
        // Submit Skill standalone CTA
        {
          to: '/submit-skill',
          label: 'Submit Skill',
          position: 'left',
          className: 'navbar-submit-link',
        },
        // Explore dropdown
        {
          type: 'dropdown',
          label: 'Explore',
          position: 'left',
          items: [
            {
              to: '/artifacts',
              label: '🎨 Examples & Artifacts',
            },
            {
              to: '/mcps',
              label: '🔌 MCP Servers',
            },
            {
              to: '/ecosystem',
              label: '🌐 Ecosystem',
            },
          ],
        },
        // Learn dropdown
        {
          type: 'dropdown',
          label: 'Learn',
          position: 'left',
          items: [
            {
              to: '/docs/guides/claude-skills-guide',
              label: '📖 Getting Started',
            },
            {
              type: 'docSidebar',
              sidebarId: 'tutorialSidebar',
              label: '📚 Documentation',
            },
          ],
        },
        // Right side items
        {
          href: 'https://os2.someclaudeskills.com',
          label: 'Desktop OS',
          position: 'right',
          className: 'navbar-os2-link',
        },
        {
          href: 'https://github.com/erichowens/some_claude_skills',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: '/contact',
          label: 'Available for Hire →',
          position: 'right',
          className: 'navbar-hire-link',
        },
        {
          type: 'custom-musicPlayer',
          position: 'right',
        },
        {
          type: 'custom-themePicker',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Skills',
          items: [
            {
              label: 'Browse Skills',
              to: '/skills',
            },
            {
              label: 'Submit a Skill',
              to: '/submit-skill',
            },
            {
              label: 'Ecosystem',
              to: '/ecosystem',
            },
            {
              label: 'Examples',
              to: '/artifacts',
            },
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/erichowens/some_claude_skills',
            },
            {
              label: 'Anthropic Claude',
              href: 'https://www.anthropic.com/claude',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/erich-owens-01a38446/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/erichowens',
            },
          ],
        },
      ],
      copyright: `Made by Erich Owens at Curiositech | © ${new Date().getFullYear()} | Windows 3.1 aesthetic by design.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
