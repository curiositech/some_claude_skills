"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var prism_react_renderer_1 = require("prism-react-renderer");
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
var config = {
    title: "Some Skills",
    tagline: 'Expert AI Agents for Specialized Tasks',
    favicon: 'img/favicon.ico',
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
    plugins: __spreadArray([
        function webpackPolyfillPlugin() {
            return {
                name: 'webpack-polyfill-plugin',
                configureWebpack: function () {
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
        }
    ], (process.env.NODE_ENV === 'production' ? [[
            'docusaurus-plugin-plausible',
            {
                domain: 'someclaudeskills.com',
                customDomain: 'plausible.io',
            },
        ]] : []), true),
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
            },
        ],
    ],
    themeConfig: {
        // Social card for link previews
        image: 'img/og-image.png',
        colorMode: {
            defaultMode: 'light',
            disableSwitch: true,
            respectPrefersColorScheme: false,
        },
        navbar: {
            title: "Some Skills",
            logo: {
                alt: "Some Skills",
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
                    label: 'The Skills',
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
                    to: '/mcps',
                    label: 'MCPs',
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
                    label: 'Hire Me',
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
                            label: 'The Skills',
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
            copyright: "Made by Erich Owens | Ex-Meta ML Engineer | \u00A9 ".concat(new Date().getFullYear(), " | Windows 3.1 aesthetic by design."),
        },
        prism: {
            theme: prism_react_renderer_1.themes.github,
            darkTheme: prism_react_renderer_1.themes.dracula,
        },
    },
};
exports.default = config;
