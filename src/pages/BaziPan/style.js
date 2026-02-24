import { Platform } from 'react-native';

// 头部与参考图一致：白底、与上方/盘面分割
const colors = {
  bg: '#f5f2eb',
  primary: '#8b4513',
  primaryLight: '#a0522d',
  headerBg: '#ffffff',
  headerText: '#1a1612',
  text: '#1a1612',
  textSecondary: '#4a4238',
  border: '#e8e4dc',
  card: '#ffffff',
  cardWarm: '#faf8f5',
  tabAccent: '#5c4a3a',
  // Tab 栏与首页同色系深色
  tabBarBg: '#5c4a3a',
  tabBarBorder: '#4a3d30',
  tabBarText: '#c4b8a8',
  tabBarTextActive: '#f5f2eb',
  tabBarActiveLine: '#c4a77d',
};

const styles = {
  // 整页：上白头 + 下盘面
  paipanWrapper: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  // 顶部安全区（与状态栏分割，白底）
  safeAreaTop: {
    backgroundColor: colors.headerBg,
  },
  // 导航栏：白底，与上方有间距
  navBar: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navSide: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  navSideRight: {
    minWidth: 40,
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 16,
  },
  headerTitleWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.headerText,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Tab 栏：与首页同色系深色
  tabBar: {
    backgroundColor: colors.tabBarBg,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorder,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.tabBarActiveLine,
  },
  tabText: {
    fontSize: 14,
    color: colors.tabBarText,
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 14,
    color: colors.tabBarTextActive,
    fontWeight: '600',
  },
  // 盘面内容区（与头部白条分割）
  paipanContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.bg,
  },
  safeAreaBottom: {
    backgroundColor: colors.bg,
  },
  header: {
    height: 0,
    opacity: 0,
  },
  // 兼容旧名
  bazipanHeader: {
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    paddingTop: 8,
    paddingLeft: 12,
    paddingRight: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  safeArea: {
    backgroundColor: colors.headerBg,
  },
  container: {
    backgroundColor: colors.bg,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    marginRight: 4,
  },
  bigFont: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  middleFont: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  miniFont: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  boldFont: {
    fontWeight: '500',
  },
  marginSeparate: {
    marginBottom: 10,
  },
  formalFontFamily: {},
  inFormalFontFamily: {},
  tabLeft: {
    marginLeft: 8,
  },
  colorJin: { color: '#c4952c' },
  colorMu: { color: '#2d7a4a' },
  colorShui: { color: colors.text },
  colorHuo: { color: '#b54a4a' },
  colorTu: { color: '#8b6914' },
  fontFamilyMain: {
    fontFamily: 'Arial',
  },
  inline: {
    flexWrap: 'nowrap',
    flexDirection: 'row',
  },
  canggan: {
    marginBottom: 2,
  },
  yunFont: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '600',
  },
  genderTitle: {
    fontSize: 18,
    color: colors.text,
  },
  startWithBox: {
    marginBottom: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  startWithText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  liunianText: {
    fontSize: 16,
    marginBottom: 2,
    color: colors.text,
  },
  touchable: {
    borderRadius: 6,
    backgroundColor: 'transparent',
    padding: 4,
  },
  nianIndex: {
    alignItems: 'center',
  },
  notice: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -140 }, { translateY: -40 }],
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 22,
    paddingHorizontal: 36,
    minWidth: 280,
    borderRadius: 16,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  noticeText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  remarkWrapper: {
    marginTop: 32,
  },
  remark: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: colors.card,
  },
  geju: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '90%',
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  openButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 16,
    ...Platform.select({ android: { elevation: 2 } }),
  },
  textStyle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: colors.text,
  },
  modalTitleWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'center',
  },
  gejuWrapper: {
    justifyContent: 'flex-start',
    backgroundColor: colors.cardWarm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  gejuText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 22,
  },
  yongshenText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  gejuModalTitle: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 20,
  },
  mingyu: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  shenshaText: {
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalContent: {
    width: '85%',
    maxHeight: '75%',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  scrollContainer: {},
};

export default styles;
