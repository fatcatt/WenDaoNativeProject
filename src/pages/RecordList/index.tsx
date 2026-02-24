import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Animated,
  PanResponder,
  Easing,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { rootNavigationRef } from '../../navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../store/index';
import { getBaziRecord, deleteBaziRecord } from '../../api/index';
import { parse } from '../../utils/js/tool';
import { GanZhiMap } from '../../utils/constants/shensha';
import styles from './style.js';

const ZODIAC_MAP: Record<string, string> = {
 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇',
 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪',
};

const COLOR_MAP: Record<string, string> = {
  Mu: '#2d7a4a', Huo: '#b54a4a', Tu: '#8b6914', Jin: '#c4952c', Shui: '#1a1612',
};

function formatSolarDate(solar_datetime: string) {
  try {
    return moment.utc(solar_datetime).add(0, 'hours').format('阳历YYYY年MM月DD日');
  } catch {
    return solar_datetime || '';
  }
}

/** 将后端 solar_datetime 转为 BaziPan 可用的 "YYYY-M-D H:mm" */
function toBaziPanSolarDate(solar_datetime: string | null | undefined): string {
  if (!solar_datetime) return '';
  const s = String(solar_datetime).trim();
  const formats = [
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DDTHH:mm:ss.SSSZ',
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-M-D  H:mm:ss',
    'YYYY-M-D H:mm:ss',
    'YYYY-M-D  H:m:s',
    'YYYY-M-D H:mm',
    'YYYY-MM-DD HH:mm',
  ];
  for (const fmt of formats) {
    const m = moment(s, fmt, true);
    if (m.isValid()) return m.format('YYYY-M-D H:mm');
  }
  const m = moment(s);
  return m.isValid() ? m.format('YYYY-M-D H:mm') : s || '';
}

/** BaziPan 需要 gender 为 'male' | 'female' */
function toBaziPanGender(gender: string | null | undefined): string {
  if (!gender) return 'male';
  const g = String(gender).trim();
  if (g === '男' || g === 'male') return 'male';
  if (g === '女' || g === 'female') return 'female';
  return 'male';
}

function getZodiacFromBazi(baziSummary: string): string {
  try {
    const ob = parse(baziSummary);
    const dayZhi = ob?.bz_jr?.slice?.(1, 2) || '';
    return ZODIAC_MAP[dayZhi] || '';
  } catch {
    return '';
  }
}

function parseBaziLines(baziSummary: string): { gan: string; zhi: string } | null {
  try {
    const ob = parse(baziSummary);
    const gan = (ob?.bz_jn?.slice(0, 1) || '') + (ob?.bz_jy?.slice(0, 1) || '') + (ob?.bz_jr?.slice(0, 1) || '') + (ob?.bz_js?.slice(0, 1) || '');
    const zhi = (ob?.bz_jn?.slice(-1) || '') + (ob?.bz_jy?.slice(-1) || '') + (ob?.bz_jr?.slice(-1) || '') + (ob?.bz_js?.slice(-1) || '');
    return { gan, zhi };
  } catch {
    return null;
  }
}

const SWIPE_ACTION_WIDTH = 72;
const SWIPE_THRESHOLD = SWIPE_ACTION_WIDTH / 2;
/** 水平滑动多少 px 就接管（越小越灵敏，4 约等于轻轻一滑就触发） */
const HORIZONTAL_SLOP = 1;

function SwipeableRecordRow({
  children,
  onPress,
  onDelete,
}: {
  children: React.ReactNode;
  onPress: () => void;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      offsetRef.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const runSnap = useCallback((toValue: number) => {
    Animated.timing(translateX, {
      toValue,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      offsetRef.current = toValue;
    });
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
        const absDx = Math.abs(g.dx);
        const absDy = Math.abs(g.dy);
        return absDx >= HORIZONTAL_SLOP && absDx >= absDy;
      },
      onPanResponderGrant: () => {
        startRef.current = offsetRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = Math.max(-SWIPE_ACTION_WIDTH, Math.min(0, startRef.current + g.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const current = startRef.current + g.dx;
        const toValue = current < -SWIPE_THRESHOLD ? -SWIPE_ACTION_WIDTH : 0;
        runSnap(toValue);
      },
      onPanResponderTerminate: () => {
        const current = offsetRef.current;
        runSnap(current < -SWIPE_THRESHOLD ? -SWIPE_ACTION_WIDTH : 0);
      },
    })
  ).current;

  return (
    <View style={styles.swipeRowWrap}>
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.swipeActionDelete}
          onPress={() => {
            translateX.setValue(0);
            onDelete();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.swipeActionText}>删除</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.swipeContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.recordItem} onPress={onPress} activeOpacity={1}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function RecordListScreen({ navigation }: { navigation: any }) {
  const { userid } = useUserStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadRecords = useCallback(async () => {
    const uid = userid || (await AsyncStorage.getItem('userid')) || '';
    if (!uid) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getBaziRecord({ userid: uid });
      setRecords(Array.isArray(res) ? res : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const filteredRecords = records.filter(
    (r) =>
      !searchText.trim() ||
      (r.nickname && r.nickname.includes(searchText.trim())) ||
      (r.solar_datetime && String(r.solar_datetime).includes(searchText.trim()))
  );

  const handleDeleteRecord = useCallback(
    (item: any) => {
      Alert.alert(
        '确认删除',
        '确定要删除这条记录吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定删除',
            style: 'destructive',
            onPress: async () => {
              const uid = userid || (await AsyncStorage.getItem('userid')) || '';
              if (!uid) return;
              try {
                await deleteBaziRecord({ id: item.id, userid: uid });
                setRecords((prev) => prev.filter((r) => r.id !== item.id));
              } catch {
                Alert.alert('删除失败');
              }
            },
          },
        ]
      );
    },
    [userid]
  );

  const handlePressRecord = (item: any) => {
    const solarDate = toBaziPanSolarDate(item.solar_datetime) || String(item.solar_datetime || '').trim() || '';
    const params = {
      navigationParams: {
        solarDate: solarDate || moment().format('YYYY-M-D H:mm'),
        gender: toBaziPanGender(item.gender),
        nickname: item.nickname ?? '',
        id: item.id ?? '',
      },
    };
    if (rootNavigationRef?.isReady?.() && rootNavigationRef.navigate) {
      rootNavigationRef.navigate('八字盘', params);
      return;
    }
    let nav: any = navigation;
    while (nav?.getParent?.()) nav = nav.getParent();
    if (nav?.navigate) {
      nav.navigate('八字盘', params);
    } else {
      navigation.navigate('八字盘', params);
    }
  };

  /** 按列渲染八字，每列固定宽度，上下天干地支对齐 */
  const renderBaziColumns = (ganLine: string, zhiLine: string) => {
    const ganChars = ganLine.split('');
    const zhiChars = zhiLine.split('');
    const count = Math.max(ganChars.length, zhiChars.length, 4);
    return (
      <View style={styles.baziRow}>
        {Array.from({ length: count }, (_, i) => {
          const gan = ganChars[i] || '';
          const zhi = zhiChars[i] || '';
          const ganKey = GanZhiMap[gan as keyof typeof GanZhiMap];
          const zhiKey = GanZhiMap[zhi as keyof typeof GanZhiMap];
          const ganColor = ganKey ? COLOR_MAP[ganKey] : '#1a1612';
          const zhiColor = zhiKey ? COLOR_MAP[zhiKey] : '#1a1612';
          return (
            <View key={i} style={styles.baziColumn}>
              <Text style={[styles.baziGan, { color: ganColor }]}>{gan}</Text>
              <Text style={[styles.baziZhi, { color: zhiColor }]}>{zhi}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const bazi = parseBaziLines(item.bazi_summary);
    const zodiac = getZodiacFromBazi(item.bazi_summary);
    const ganLine = bazi?.gan || '';
    const zhiLine = bazi?.zhi || '';

    return (
      <SwipeableRecordRow
        onPress={() => handlePressRecord(item)}
        onDelete={() => handleDeleteRecord(item)}
      >
        <>
          <View style={styles.recordLeft}>
            <View style={styles.recordNameRow}>
              <Text style={styles.recordNickname}>{item.nickname || '未命名'}</Text>
              <Text style={styles.recordGender}>{item.gender === 'male' ? '男' : item.gender === 'female' ? '女' : (item.gender || '')}</Text>
            </View>
            <Text style={styles.recordDate}>{formatSolarDate(item.solar_datetime)}</Text>
          </View>
          <View style={styles.recordRight}>
            <View style={styles.baziWrap}>
              {renderBaziColumns(ganLine, zhiLine)}
            </View>
            {zodiac ? (
              <View style={styles.zodiacCircle}>
                <Text style={styles.zodiacText}>{zodiac}</Text>
              </View>
            ) : null}
          </View>
        </>
      </SwipeableRecordRow>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Icon name="search-outline" size={20} color="#4a4238" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="请输入搜索的内容"
              placeholderTextColor="#9a9389"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>筛选</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryRow}>
        <Text style={styles.categoryLabel}>全部</Text>
      </View>

      {loading ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color="#5c4a3a" />
        </View>
      ) : filteredRecords.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {!userid ? '请先登录后查看排盘记录' : searchText ? '无匹配记录' : '暂无保存的八字记录'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}
