/**
 * TAILWIND CSS DOCUSAURUS PLUGIN
 * ==============================
 * 
 * Integrates Tailwind CSS with Docusaurus by adding the PostCSS loader.
 * This plugin configures webpack to process Tailwind CSS classes.
 */

import type { Plugin } from '@docusaurus/types';

export default function tailwindPlugin(): Plugin {
  return {
    name: 'tailwind-plugin',
    configurePostCss(postcssOptions) {
      // Add Tailwind CSS and Autoprefixer
      postcssOptions.plugins.push(
        require('tailwindcss'),
        require('autoprefixer')
      );
      return postcssOptions;
    },
  };
}
