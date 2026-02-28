import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const styles = StyleSheet.create({
  settingWrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  userCard: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  userCardTextWrap: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  loginButtonText: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  logoutButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
    marginHorizontal: 8,
  },
  funcCard: {
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  funcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  funcRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  funcRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funcRowText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 12,
  },
  funcRowArrow: {
    marginLeft: 8,
  },
  recordSection: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  recordSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
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
