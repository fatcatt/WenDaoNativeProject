import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useUserStore } from '../../store/index';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getBaziRecord } from '../../api/index';
import { colors } from '../../theme/colors';
import moment from 'moment';
import styles from './style';

const FEATURES = [
  { key: 'ie', label: 'I人E人', icon: 'users', color: '#e67e22' },
  { key: 'xingzuo', label: '星座', icon: 'star', color: '#3498db' },
  { key: 'xingpan', label: '星盘', icon: 'compass', color: '#5dade2' },
  { key: 'shengchen', label: '生辰', icon: 'birthday-cake', color: '#e8a838' },
  { key: 'yuanfen', label: '缘分合盘', icon: 'heart', color: '#e91e8c' },
  { key: 'peiban', label: '陪伴小星', icon: 'sun', color: '#f1c40f' },
  { key: 'linghun', label: '灵魂伴侣', icon: 'user-friends', color: '#f1948a' },
  { key: 'zhihui', label: '智慧卡', icon: 'layer-group', color: '#9b59b6' },
  { key: 'baogao', label: '星盘报告', icon: 'file-alt', color: '#5dade2'},
  { key: 'more', label: '更多', icon: 'ellipsis-h', color: '#95a5a6' },
];

const SCORE_ITEMS = [
  { label: '爱情', value: 61 },
  { label: '财富', value: 64 },
  { label: '事业', value: 57 },
  { label: '学习', value: 58 },
  { label: '人际', value: 50 },
];

const SUB_TABS = ['推荐', '关注', '测试', '星座', '树洞', '心理', '交友'];

export default function IndexScreen({ navigation }: { navigation: any }) {
  const { userInfo, setUserInfo: setUserInfoStore } = useUserStore();
  const [activeSubTab, setActiveSubTab] = useState('推荐');

  useFocusEffect(
    React.useCallback(() => {
      if (userInfo?.headimg_url) return;
      AsyncStorage.getItem('unionid').then((unionid) => {
        if (!unionid) return;
        getUserData({ unionid }).then((res) => setUserInfoStore(res)).catch(() => {});
      });
    }, [userInfo?.headimg_url, setUserInfoStore])
  );

  /** 后端 solar_datetime 转为 BaziPan 需要的 "YYYY-M-D H:mm" */
  const toBaziPanSolarDate = (solar_datetime: string | null | undefined): string => {
    if (!solar_datetime) return moment().format('YYYY-M-D H:mm');
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
    return m.isValid() ? m.format('YYYY-M-D H:mm') : s || moment().format('YYYY-M-D H:mm');
  };

  const toBaziPanGender = (gender: string | null | undefined): string => {
    if (!gender) return 'male';
    const g = String(gender).trim();
    if (g === '男' || g === 'male') return 'male';
    if (g === '女' || g === 'female') return 'female';
    return 'male';
  };

  const onFeaturePress = async (key: string) => {
    if (key === 'xingpan') {
      navigation.navigate('八字');
      return;
    }
    if (key === 'shengchen') {
      const userid = await AsyncStorage.getItem('userid');
      if (!userid) {
        navigation.navigate('八字', { initialRelationship: '自己' });
        return;
      }
      try {
        const list = await getBaziRecord({ userid });
        const records = Array.isArray(list) ? list : [];
        // 只认「关系」字段明确为「自己」的记录，避免老数据/空字符串被误用；多条时取最近一条
        const selfRecords = records.filter(
          (r: any) => typeof r.relationship === 'string' && r.relationship.trim() === '自己'
        );
        const selfRecord = selfRecords.length > 0
          ? selfRecords.sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0))[0]
          : null;
        if (selfRecord) {
          console.log(selfRecord.solar_datetime)
          navigation.navigate('八字盘', {
            navigationParams: {
              solarDate: toBaziPanSolarDate(selfRecord.solar_datetime),
              gender: toBaziPanGender(selfRecord.gender),
              nickname: selfRecord.nickname ?? '',
              relationship: '自己',
              id: selfRecord.id ?? '',
            },
          });
        } else {
          navigation.navigate('八字', { initialRelationship: '自己' });
        }
      } catch {
        navigation.navigate('八字', { initialRelationship: '自己' });
      }
      return;
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 顶部：签到 | 搜索 | 图标 */}
        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.signInBtn} activeOpacity={0.8}>
            <FontAwesome5 name="calendar-check" size={14} color="#5c4a3a" />
          </TouchableOpacity>
          <View style={styles.searchWrap}>
            <FontAwesome5 name="search" size={14} color="#4a4238" />
            <Text style={styles.searchPlaceholder}>人生K线</Text>
          </View>
          
        </View> */}

        {/* 用户区：与八字页一致，显示当前登录用户头像 */}
        <View style={styles.userBanner}>
          <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.8}>
            {userInfo?.headimg_url ? (
              <Image source={{ uri: userInfo.headimg_url }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <View style={styles.avatar}>
                <FontAwesome5 name="user" size={20} color="#4a4238" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarPlus}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('八字')}
          >
            <FontAwesome5 name="plus" size={14} color={colors.primaryLight} />
          </TouchableOpacity>
          <View style={styles.userRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('记录')}
            >
              <FontAwesome5 name="list-alt" size={18} color="#5c4a3a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 自己卡片：左右布局，左侧文案、右侧柱状图 */}
        <View style={styles.selfCard}>
          <View style={styles.selfCardRow}>
            <View style={styles.selfCardLeft}>
              <View style={styles.selfCardHeader}>
                <Text style={styles.selfTitle}>自己</Text>
              </View>
              <Text style={styles.moodLabel}>今日心情</Text>
              <View style={styles.moodScoreRow}>
                <Text style={styles.moodScore}>60</Text>
                <Text style={styles.moodScoreUnit}>分</Text>
              </View>
              <Text style={styles.moodDesc}>
                今天情绪容易紧张，也容易患得患失，待人处事建议放轻松一些。
              </Text>
            </View>
            <View style={styles.scoreBarsRow}>
              {SCORE_ITEMS.map((item) => (
                <View key={item.label} style={styles.scoreBarItem}>
                  <View style={styles.scoreBarBg}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { height: `${item.value}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreBarValue}>{item.value}</Text>
                  <Text style={styles.scoreBarLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 功能网格 */}
        <Text style={styles.sectionTitle}>功能</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={styles.featureItem}
              onPress={() => onFeaturePress(f.key)}
              activeOpacity={0.8}
            >
              <View style={styles.featureIconWrap}>
                {f.tag ? (
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>{f.tag}</Text>
                  </View>
                ) : null}
                <FontAwesome5 name={f.icon} size={26} solid color={f.color} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 二级 Tab */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabs}
        >
          {SUB_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.subTab,
                activeSubTab === tab && styles.subTabActive,
              ]}
              onPress={() => setActiveSubTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.subTabText,
                  activeSubTab === tab && styles.subTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 内容卡片 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contentScroll}
        >
          <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>比劫夺财</Text>
            <Text style={styles.contentCardMeta}>发布 · 星垣水镜</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>今日宜忌</Text>
            <Text style={styles.contentCardMeta}>每日运势</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>命理小知识</Text>
            <Text style={styles.contentCardMeta}>学习</Text>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
