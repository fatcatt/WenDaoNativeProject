import { StyleSheet, Platform } from 'react-native';

const colors = {
  bg: '#f5f2eb',
  card: '#ffffff',
  primary: '#8b4513',
  primaryLight: '#a0522d',
  border: '#e8e4dc',
  borderFocus: '#c4a77d',
  text: '#1a1612',         // 加深正文，提升可读
  textSecondary: '#4a4238', // 加深辅文，仍弱于正文
  male: '#2e5c8a',
  female: '#8b3a62',
};

const styles = StyleSheet.create({
  homeWrapper: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 6 : 12,
    paddingBottom: 18,
  },
  contentWrapper: {
    flex: 1,
  },
  // 表单卡片（左右边距与主按钮一致，不贴边）
  inputInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    marginHorizontal: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  selectButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  genderWrapper: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  activeButton: {
    minWidth: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  unActiveButton: {
    minWidth: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeGenderText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  unActiveGenderText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  formItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 15,
    color: colors.text,
  },
  formItemPlaceholder: {
    color: '#6b6358',
  },
  // 主按钮（不贴边，左右留白）
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // 底部关注
  contact: {
    marginTop: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contactLink: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  // 弹窗
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingHorizontal: 16,
  },
  // 反推弹窗
  modalFtRes: {
    maxHeight: 200,
  },
  ftResItem: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.bg,
    borderRadius: 8,
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  containerColumn: {
    flex: 1,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  middleFont: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  mt16: { marginTop: 12 },
  mr16: { marginRight: 12 },
  ml16: { marginLeft: 12 },
  mb16: { marginBottom: 12 },
  bigFont: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  miniFont: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  gzSelectBox: {
    width: 48,
    height: 48,
    backgroundColor: colors.bg,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalnei: {
    minHeight: 200,
  },
});

export default styles;
