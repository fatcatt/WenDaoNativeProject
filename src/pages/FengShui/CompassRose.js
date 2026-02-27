/**
 * 罗盘：底图为罗盘图片（旋转），天心十字与指针固定
 * heading: 0-360，来自设备磁力计；底图旋转 -heading，使当前朝向对准顶部
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SIZES = { rose: 280, crosshair: 1 };

// 罗盘底图：使用本地图请把罗盘图放到 FengShui/assets/luopan.png 并改为 require('./assets/luopan.png')
const LUOPAN_SOURCE = require('./assets/luopan.png');

const colors = {
  crosshair: '#c0392b',
  needle: '#c0392b',
  needleNorth: '#c9a227', // 十字线尖端北指针：偏黄色
  needleTail: '#5c4a3a',
  centerArrow: '#c0392b',
};

export default function CompassRose({ heading = 0, diskScale = 1, size = SIZES.rose }) {
  const scale = size / SIZES.rose;
  const ch = SIZES.crosshair * scale;
  const chHalf = ch / 2;
  const center = size / 2;

  return (
    <View style={[styles.outer, { width: size, height: size }]}>
      {/* 罗盘底图：随设备朝向旋转，支持放大缩小 */}
      <View
        style={[
          styles.diskWrap,
          {
            width: size,
            height: size,
            transform: [{ rotate: `${-heading}deg` }, { scale: diskScale }],
          },
        ]}
      >
        <Image
          source={LUOPAN_SOURCE}
          style={[styles.diskImage, { width: size, height: size }]}
          resizeMode="contain"
        />
        {/* 中心指南针箭头：随底图旋转，对称南北指针、稍瘦，固定指向盘面子午方向 */}
        <View style={[styles.centerArrowWrap, { left: center - 6, top: center - 16 }]}>
          <View style={styles.centerArrowUp} />
          <View style={styles.centerArrowDown} />
        </View>
      </View>
      {/* 天心十字：固定，细线 */}
      <View
        style={[styles.crosshairV, { width: ch, left: center - chHalf }]}
      />
      <View
        style={[styles.crosshairH, { height: ch, top: center - chHalf }]}
      />
      {/* 十字线尖端：仅保留北指针（红端指北） */}
      <View style={[styles.needleWrap, { width: size, height: size }]}>
        <View style={[styles.needleNorth, { top: -18, left: center - 6 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  diskWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diskImage: {
    backgroundColor: 'transparent',
  },
  crosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.crosshair,
  },
  crosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.crosshair,
  },
  centerArrowWrap: {
    position: 'absolute',
    width: 12,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.centerArrow,
    marginBottom: -1,
  },
  centerArrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.needleTail,
  },
  needleWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  needleNorth: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.needleNorth,
  },
});
