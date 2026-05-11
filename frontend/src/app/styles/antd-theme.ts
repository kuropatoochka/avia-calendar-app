import type { ThemeConfig } from 'antd';

/**
 * Ant Design theme configuration
 * Centralized theme tokens and style configuration
 */

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#73AFFF',
    colorInfo: '#73AFFF',

    colorText: '#000',
    colorTextSecondary: '#888',
    colorTextDisabled: '#CCC',

    colorBorder: '#D9D9D9',

    fontFamily: 'var(--font-family)',
    fontSize: 14,

    borderRadius: 8,
  },

  components: {
    Layout: {
      bodyBg: 'var(--background-page)',
      headerBg: 'var(--background-page)',
      footerBg: 'var(--background-page)',
    },

    Typography: {
      colorText: 'var(--text-primary)',
      colorTextSecondary: 'var(--text-secondary)',
    },
  },
};
