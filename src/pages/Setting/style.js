import { StyleSheet, Platform } from 'react-native';

// 与首页同色系；正文加深，Tab 用灰棕弱化
const colors = {
  bg: '#f5f2eb',
  primary: '#8b4513',
  primaryLight: '#a0522d',
  tabAccent: '#5c4a3a',   // 页面内 Tab 用灰棕，不抢眼
  text: '#1a1612',
  textSecondary: '#4a4238',
  border: '#e8e4dc',
  card: '#ffffff',
};

const styles = StyleSheet.create({
  settingWrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  alipayButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  alipayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: 0,
    backgroundColor: colors.bg,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pagerView: {
    flex: 1,
  },
  pagetext: {
    paddingTop: 24,
    color: colors.textSecondary,
  },
  buttonTextHl: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.tabAccent,
  },
  buttonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  highlightBarWrapper: {
    width: 60,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  highlightBar: {
    width: 28,
    height: 3,
    backgroundColor: colors.tabAccent,
    borderRadius: 2,
  },
  page: {
    flex: 1,
  },
  emptyHint: {
    marginLeft: 16,
    fontSize: 15,
    color: colors.textSecondary,
  },
});

export default styles;
