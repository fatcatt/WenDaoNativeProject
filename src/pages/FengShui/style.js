import {StyleSheet, Platform} from 'react-native';

const colors = {
  bg: '#f5f2eb',
  card: '#ffffff',
  primary: '#8b4513',
  primaryLight: '#a0522d',
  border: '#e8e4dc',
  text: '#1a1612',
  textSecondary: '#4a4238',
  btnBorder: '#c4a77d',
  btnBg: '#e8e4dc',
  tabActive: '#8b4513',
  tabInactive: '#4a4238',
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    minWidth: 90,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    minWidth: 90,
    alignItems: 'flex-end',
  },
  upgradeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  upgradeBtnText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  northToggle: {
    flexDirection: 'row',
    backgroundColor: colors.btnBg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  northToggleItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  northToggleItemActive: {
    backgroundColor: colors.primary,
  },
  northToggleText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  northToggleTextActive: {
    color: colors.card,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoBlock: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  controlBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.btnBorder,
    backgroundColor: colors.btnBg,
  },
  controlBtnText: {
    fontSize: 13,
    color: colors.text,
  },
  controlBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  controlBtnTextActive: {
    color: colors.card,
  },
  compassWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 65,
    paddingBottom: 65,
    backgroundColor: '#ffffff',
  },
  compassHint: {
    marginTop: 12,
    paddingHorizontal: 24,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  autoManualToggle: {
    flexDirection: 'row',
    backgroundColor: colors.btnBg,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  autoManualItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  autoManualItemActive: {
    backgroundColor: colors.primary,
  },
  autoManualText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  autoManualTextActive: {
    color: colors.card,
    fontWeight: '600',
  },
  styleStrip: {
    flex: 1,
  },
  styleStripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  styleDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.btnBg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  styleDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
});

export default styles;
