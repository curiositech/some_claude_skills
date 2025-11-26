import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Erich's Best Claude Skills",
  tagline: 'Expert AI Agents for Specialized Tasks',
  favicon: 'img/favicon.ico',

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
        customDomain: 'https://plausible.io',
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
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Erich's Best Claude Skills",
      logo: {
        alt: "Erich's Best Claude Skills",
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/',
          label: 'Home',
          position: 'left',
        },
        {
          to: '/skills',
          label: 'Skills Gallery',
          position: 'left',
        },
        {
          to: '/artifacts',
          label: 'Examples',
          position: 'left',
          className: 'beta-nav-item',
        },
        {
          to: '/docs/guides/claude-skills-guide',
          label: 'Guide',
          position: 'left',
        },
        {
          to: '/favorites',
          label: 'Favorites',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/contact',
          label: 'Hire Author',
          position: 'right',
        },
        {
          href: 'https://github.com/erichowens/some_claude_skills',
          label: 'GitHub',
          position: 'right',
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
              label: 'Skills Gallery',
              to: '/skills',
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
      copyright: `Made by Erich Owens | Ex-Meta ML Engineer | © ${new Date().getFullYear()} | Windows 3.1 aesthetic by design.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
