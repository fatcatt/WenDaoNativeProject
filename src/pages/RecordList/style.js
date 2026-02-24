import { StyleSheet, Platform } from 'react-native';

const colors = {
  bg: '#f5f2eb',
  card: '#ffffff',
  text: '#1a1612',
  textSecondary: '#4a4238',
  border: '#e8e4dc',
  searchBg: '#f0ede6',
  tabActive: '#5c4a3a',
  filterBtn: '#4a4238',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  searchClearBtn: {
    paddingLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.searchBg,
  },
  filterBtnText: {
    fontSize: 14,
    color: colors.filterBtn,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLabel: {
    fontSize: 15,
    color: colors.tabActive,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: colors.tabActive,
    paddingBottom: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  swipeRowWrap: {
    overflow: 'hidden',
    marginTop: 8,
    borderRadius: 10,
    position: 'relative',
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 72,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swipeActionDelete: {
    flex: 1,
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  swipeContent: {
    width: '100%',
    backgroundColor: colors.card,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  recordLeft: {
    flex: 1,
    marginRight: 12,
  },
  recordNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordNickname: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  recordGender: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recordDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recordRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baziWrap: {
    marginRight: 12,
  },
  baziRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baziColumn: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baziGan: {
    fontSize: 16,
    fontWeight: '700',
  },
  baziZhi: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  zodiacCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1612',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacText: {
    fontSize: 16,
    color: '#c4952c',
    fontWeight: '700',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default styles;
