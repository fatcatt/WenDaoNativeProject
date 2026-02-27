/** 二十四山名（从北顺时针每 15° 一山） */
const SHAN_24 = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙', '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];

/** 度数(0-360) 转二十四山名 */
export function degreesToShan(deg) {
  const d = ((deg % 360) + 360) % 360;
  const index = Math.round(d / 15) % 24;
  return SHAN_24[index];
}

/** 坐向文案：向 = heading，坐 = heading + 180 */
export function getZuoXiang(heading) {
  const xiang = degreesToShan(heading);
  const zuo = degreesToShan(heading + 180);
  return `坐${zuo}向${xiang}`;
}

/** 度数转方位简写（西 256° 这种）：八方位每 45° */
const CARDINALS = [
  { name: '北', start: 337.5, end: 22.5 },
  { name: '东北', start: 22.5, end: 67.5 },
  { name: '东', start: 67.5, end: 112.5 },
  { name: '东南', start: 112.5, end: 157.5 },
  { name: '南', start: 157.5, end: 202.5 },
  { name: '西南', start: 202.5, end: 247.5 },
  { name: '西', start: 247.5, end: 292.5 },
  { name: '西北', start: 292.5, end: 337.5 },
];

export function degreesToCardinal(deg) {
  const d = ((deg % 360) + 360) % 360;
  const found = CARDINALS.find(({ start, end }) => {
    if (start > end) return d >= start || d < end; // 北
    return d >= start && d < end;
  });
  return found ? found.name : '北';
}
