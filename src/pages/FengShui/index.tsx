import React, {useEffect, useState, useRef} from 'react';
import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import styles from './style.js';
import CompassRose from './CompassRose';
import {getZuoXiang, degreesToCardinal} from './utils';

// 使用设备磁力计的罗盘库（需 npm install + ios: pod install，真机才有数据）
let CompassHeadingModule: { start: (rate: number, cb: (e: { heading: number }) => void) => void; stop: () => void } | null = null;
try {
  CompassHeadingModule = require('react-native-compass-heading').default;
} catch (_) {
  CompassHeadingModule = null;
}

const ZOOM_STEP = 0.05;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2;

export default function FengShuiScreen() {
  const [heading, setHeading] = useState(0);
  const [compassAvailable, setCompassAvailable] = useState(false);
  const [northMode, setNorthMode] = useState<'磁北' | '真北'>('真北');
  const [diskScale, setDiskScale] = useState(1);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  lockedRef.current = locked;

  useEffect(() => {
    if (!CompassHeadingModule) return;
    const rate = 3;
    CompassHeadingModule.start(rate, (e: { heading: number }) => {
      if (lockedRef.current) return;
      setHeading(e.heading);
      setCompassAvailable(true);
    });
    return () => CompassHeadingModule?.stop();
  }, []);

  const cardinal = degreesToCardinal(heading);
  const zuoXiang = getZuoXiang(heading);
  const displayDeg = Math.round(heading);

  return (
    <SafeAreaView style={styles.wrapper}>
      {/* 顶部：升级高级版 | 智能罗盘 | 磁北/真北 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.8}>
            <Text style={styles.upgradeBtnText}>升级高级版</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>智能罗盘</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.northToggle}>
            <TouchableOpacity
              style={[styles.northToggleItem, northMode === '磁北' && styles.northToggleItemActive]}
              onPress={() => setNorthMode('磁北')}
              activeOpacity={0.8}
            >
              <Text style={[styles.northToggleText, northMode === '磁北' && styles.northToggleTextActive]}>磁北</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.northToggleItem, northMode === '真北' && styles.northToggleItemActive]}
              onPress={() => setNorthMode('真北')}
              activeOpacity={0.8}
            >
              <Text style={[styles.northToggleText, northMode === '真北' && styles.northToggleTextActive]}>真北</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 信息行：方向 | 坐标 | 坐向 */}
      <View style={styles.infoRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>方向</Text>
          <Text style={styles.infoValue}>{cardinal} {displayDeg}°</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>北纬</Text>
          <Text style={styles.infoValue}>30°33′</Text>
          <Text style={styles.infoLabel}>东经</Text>
          <Text style={styles.infoValue}>114°21′</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>坐向</Text>
          <Text style={styles.infoValue}>{zuoXiang}</Text>
        </View>
      </View>

      {/* 控制按钮：放大 5%、缩小 5%、锁定（固定当前朝向） */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8} onPress={() => setDiskScale(s => Math.min(MAX_SCALE, s + ZOOM_STEP))}>
          <Text style={styles.controlBtnText}>放大</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8} onPress={() => setDiskScale(s => Math.max(MIN_SCALE, s - ZOOM_STEP))}>
          <Text style={styles.controlBtnText}>缩小</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, locked && styles.controlBtnActive]}
          activeOpacity={0.8}
          onPress={() => setLocked(v => !v)}
        >
          <Text style={[styles.controlBtnText, locked && styles.controlBtnTextActive]}>{locked ? '已锁定' : '锁定'}</Text>
        </TouchableOpacity>
      </View>

      {/* 罗盘主体：底图可缩放，锁定后朝向不变 */}
      <View style={styles.compassWrap}>
        <CompassRose heading={heading} diskScale={diskScale} />
        {!compassAvailable && (
          <Text style={styles.compassHint}>
            请使用真机并完成「npm install」与「cd ios && pod install」后重新编译，以使用设备罗盘
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
