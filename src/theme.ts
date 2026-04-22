import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = theme;

const FONT_FAMILY =
  "Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'";

const FONT_FAMILY_CODE =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const lightTheme: ThemeConfig = {
  cssVar: true,
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#f54e00',
    colorInfo: '#f54e00',
    colorSuccess: '#1f8a65',
    colorWarning: '#c08532',
    colorError: '#cf2d56',

    colorBgBase: '#f2f1ed',
    colorTextBase: '#26251e',

    colorBgContainer: '#f7f7f4',
    colorBgLayout: '#f2f1ed',
    colorBgElevated: '#ffffff',

    colorBorder: 'rgba(38, 37, 30, 0.15)',
    colorBorderSecondary: 'rgba(38, 37, 30, 0.08)',

    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: FONT_FAMILY,
    fontFamilyCode: FONT_FAMILY_CODE,

    colorLink: '#f54e00',
    colorLinkHover: '#cf2d56',
    colorLinkActive: '#d4400a',
  },
  components: {
    Button: {
      controlHeight: 38,
      borderRadius: 8,
      primaryShadow: 'none',
      defaultBg: '#ebeae5',
      defaultColor: '#26251e',
      defaultBorderColor: 'rgba(38, 37, 30, 0.12)',
      defaultHoverBg: '#e6e5e0',
      defaultHoverColor: '#cf2d56',
      defaultHoverBorderColor: 'rgba(38, 37, 30, 0.2)',
    },
    Card: {
      borderRadiusLG: 10,
      colorBgContainer: '#f7f7f4',
      paddingLG: 24,
      boxShadowTertiary: 'none',
    },
    Table: {
      headerBg: '#ebeae5',
      headerColor: 'rgba(38, 37, 30, 0.65)',
      rowHoverBg: 'rgba(38, 37, 30, 0.03)',
      borderColor: 'rgba(38, 37, 30, 0.08)',
      headerBorderRadius: 8,
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
    },
    Input: {
      activeBorderColor: '#f54e00',
      hoverBorderColor: 'rgba(38, 37, 30, 0.3)',
      activeShadow: '0 0 0 2px rgba(245, 78, 0, 0.08)',
    },
    Select: {
      optionSelectedBg: '#ebeae5',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: 'rgba(38, 37, 30, 0.65)',
      itemHoverColor: '#26251e',
      itemHoverBg: 'rgba(38, 37, 30, 0.05)',
      itemSelectedColor: '#f54e00',
      itemSelectedBg: 'rgba(245, 78, 0, 0.06)',
      subMenuItemBg: 'transparent',
      itemBorderRadius: 6,
      itemHeight: 36,
      iconMarginInlineEnd: 10,
      activeBarBorderWidth: 0,
    },
    Layout: {
      headerBg: '#f7f7f4',
      bodyBg: '#f2f1ed',
      siderBg: '#f7f7f4',
      triggerBg: '#ebeae5',
    },
    Tabs: {
      inkBarColor: '#f54e00',
      itemActiveColor: '#f54e00',
      itemSelectedColor: '#f54e00',
      itemHoverColor: '#cf2d56',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Badge: {
      colorBgContainer: '#f54e00',
    },
    Pagination: {
      itemActiveBg: '#ebeae5',
      colorPrimary: '#f54e00',
      colorPrimaryHover: '#cf2d56',
    },
    Modal: {
      contentBg: '#f7f7f4',
      headerBg: '#f7f7f4',
    },
    Drawer: {
      colorBgElevated: '#f7f7f4',
    },
    Dropdown: {
      controlItemBgHover: '#ebeae5',
      controlItemBgActive: '#e6e5e0',
    },
    Breadcrumb: {
      separatorColor: 'rgba(38, 37, 30, 0.3)',
      linkColor: 'rgba(38, 37, 30, 0.55)',
      linkHoverColor: '#f54e00',
      lastItemColor: '#26251e',
    },
    Divider: {
      colorSplit: 'rgba(38, 37, 30, 0.08)',
    },
    Radio: {
      buttonSolidCheckedBg: '#26251e',
      buttonSolidCheckedHoverBg: '#3a3930',
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
  },
};

export const darkTheme: ThemeConfig = {
  cssVar: true,
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: '#f54e00',
    colorInfo: '#f54e00',
    colorSuccess: '#34d399',
    colorWarning: '#f5c16c',
    colorError: '#f87171',

    colorBgBase: '#1a1915',
    colorTextBase: '#e6e5e0',

    colorBgContainer: '#26251e',
    colorBgLayout: '#1a1915',
    colorBgElevated: '#2d2c25',

    colorBorder: 'rgba(230, 229, 224, 0.12)',
    colorBorderSecondary: 'rgba(230, 229, 224, 0.06)',

    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: FONT_FAMILY,
    fontFamilyCode: FONT_FAMILY_CODE,

    colorLink: '#f5814d',
    colorLinkHover: '#f87171',
    colorLinkActive: '#f54e00',
  },
  components: {
    Button: {
      controlHeight: 38,
      borderRadius: 8,
      primaryShadow: 'none',
      defaultBg: '#2d2c25',
      defaultColor: '#e6e5e0',
      defaultBorderColor: 'rgba(230, 229, 224, 0.1)',
      defaultHoverBg: '#3a3930',
      defaultHoverColor: '#f5814d',
      defaultHoverBorderColor: 'rgba(230, 229, 224, 0.2)',
    },
    Card: {
      borderRadiusLG: 10,
      colorBgContainer: '#26251e',
      paddingLG: 24,
      boxShadowTertiary: 'none',
    },
    Table: {
      headerBg: '#2d2c25',
      headerColor: 'rgba(230, 229, 224, 0.6)',
      rowHoverBg: 'rgba(230, 229, 224, 0.04)',
      borderColor: 'rgba(230, 229, 224, 0.08)',
      headerBorderRadius: 8,
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
    },
    Input: {
      activeBorderColor: '#f54e00',
      hoverBorderColor: 'rgba(230, 229, 224, 0.2)',
      activeShadow: '0 0 0 2px rgba(245, 78, 0, 0.12)',
    },
    Select: {
      optionSelectedBg: '#2d2c25',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: 'rgba(230, 229, 224, 0.6)',
      itemHoverColor: '#e6e5e0',
      itemHoverBg: 'rgba(230, 229, 224, 0.06)',
      itemSelectedColor: '#f5814d',
      itemSelectedBg: 'rgba(245, 78, 0, 0.1)',
      subMenuItemBg: 'transparent',
      itemBorderRadius: 6,
      itemHeight: 36,
      iconMarginInlineEnd: 10,
      activeBarBorderWidth: 0,
    },
    Layout: {
      headerBg: '#26251e',
      bodyBg: '#1a1915',
      siderBg: '#1f1e18',
      triggerBg: '#2d2c25',
    },
    Tabs: {
      inkBarColor: '#f54e00',
      itemActiveColor: '#f5814d',
      itemSelectedColor: '#f5814d',
      itemHoverColor: '#f87171',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Pagination: {
      itemActiveBg: '#2d2c25',
      colorPrimary: '#f5814d',
      colorPrimaryHover: '#f87171',
    },
    Modal: {
      contentBg: '#26251e',
      headerBg: '#26251e',
    },
    Drawer: {
      colorBgElevated: '#26251e',
    },
    Dropdown: {
      controlItemBgHover: '#2d2c25',
      controlItemBgActive: '#3a3930',
    },
    Breadcrumb: {
      separatorColor: 'rgba(230, 229, 224, 0.25)',
      linkColor: 'rgba(230, 229, 224, 0.5)',
      linkHoverColor: '#f5814d',
      lastItemColor: '#e6e5e0',
    },
    Divider: {
      colorSplit: 'rgba(230, 229, 224, 0.08)',
    },
    Radio: {
      buttonSolidCheckedBg: '#e6e5e0',
      buttonSolidCheckedHoverBg: '#d5d4cf',
      buttonSolidCheckedColor: '#1a1915',
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
  },
};
