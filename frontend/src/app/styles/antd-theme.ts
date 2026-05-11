import type { ThemeConfig } from "antd"

/**
 * Ant Design theme configuration
 * Centralized theme tokens and style configuration
 */

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: 'var(--color-primary)',
    colorInfo: 'var(--color-primary)',

    colorText: 'var(--text-primary)',
    colorTextSecondary: 'var(--text-secondary)',
    colorTextDisabled: 'var(--text-disabled)',

    colorBorder: 'var(--border-primary)',
    colorBgBase: 'var(--background-page)',
    colorBgLayout: 'var(--background-page)',
    colorBgContainer: 'var(--background-section)',

    fontFamily: 'var(--font-family)',
    fontSize: 14,

    borderRadius: 8,

    boxShadow: 'var(--shadow-sm)',
    boxShadowSecondary: 'var(--shadow-md)',
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