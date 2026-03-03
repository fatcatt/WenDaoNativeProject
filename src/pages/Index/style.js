import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const borderRadius = 12;
const radiusMd = 8;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  // 顶部栏：签到 | 搜索 | 右侧图标
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3edfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.searchBg,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.btnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 用户区
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.headerBarBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  userRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  // 自己卡片
  selfCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  selfCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selfCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  selfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selfTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  tagText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '500',
  },
  moodLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  moodScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  moodScore: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  moodScoreUnit: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 2,
  },
  moodDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scoreBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  scoreBarItem: {
    alignItems: 'center',
    width: 36,
  },
  scoreBarBg: {
    width: 20,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.btnBg,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreBarFill: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  scoreBarValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  scoreBarLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // 功能网格
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  featureItem: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  featureLabel: {
    fontSize: 12,
    color: '#000000',
  },
  featureTag: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  featureTagText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '500',
  },
  // 推广横幅
  promoBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  // 二级 Tab
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  subTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.tabActive,
  },
  subTabText: {
    fontSize: 14,
    color: '#000000',
  },
  subTabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  // 内容卡片列表
  contentScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  contentCard: {
    width: 280,
    marginRight: 12,
    padding: 14,
    borderRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  contentCardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default styles;
