/**
 * 支付宝 APP 支付封装
 * 依赖：@0x5e/react-native-alipay
 * 文档：https://docs.open.alipay.com/204/105465/
 */
import Alipay from '@0x5e/react-native-alipay';

/** 支付结果状态码（resultStatus） */
export const AlipayResultStatus = {
  /** 操作成功 */
  SUCCESS: '9000',
  /** 正在处理中 */
  PROCESSING: '8000',
  /** 操作失败 */
  FAILED: '4000',
  /** 重复请求 */
  REPEAT: '5000',
  /** 用户中途取消 */
  USER_CANCEL: '6001',
  /** 网络连接出错 */
  NETWORK_ERROR: '6002',
} as const;

/** 支付结果 */
export interface AlipayPayResult {
  resultStatus: string;
  result: string;
  memo: string;
}

/** 解析后的 result 字段（JSON） */
export interface AlipayPayResultData {
  code?: string;
  msg?: string;
  out_trade_no?: string;
  trade_no?: string;
  total_amount?: string;
  [key: string]: unknown;
}

/**
 * 是否使用支付宝沙箱环境（仅开发/测试时使用）
 * 正式环境请设为 false，并在调用 pay 前设置一次即可
 */
export function setAlipaySandbox(isSandbox: boolean): void {
  Alipay.setAlipaySandbox(isSandbox);
}

/**
 * 调起支付宝 APP 支付
 * @param orderStr 由服务端签名后的订单参数字符串（query string 格式），见 https://docs.open.alipay.com/204/105465/
 * @returns 支付结果，含 resultStatus、result（JSON 字符串）、memo
 */
export async function pay(orderStr: string): Promise<AlipayPayResult> {
  const res = await Alipay.pay(orderStr);
  return res as AlipayPayResult;
}

/**
 * 解析支付结果并判断是否成功
 */
export function isPaySuccess(result: AlipayPayResult): boolean {
  return result.resultStatus === AlipayResultStatus.SUCCESS;
}

/**
 * 获取支付结果的人类可读描述
 */
export function getPayResultMessage(result: AlipayPayResult): string {
  const status = result.resultStatus;
  const messages: Record<string, string> = {
    [AlipayResultStatus.SUCCESS]: '支付成功',
    [AlipayResultStatus.PROCESSING]: '支付处理中',
    [AlipayResultStatus.FAILED]: '支付失败',
    [AlipayResultStatus.REPEAT]: '重复请求',
    [AlipayResultStatus.USER_CANCEL]: '用户取消支付',
    [AlipayResultStatus.NETWORK_ERROR]: '网络错误',
  };
  return messages[status] ?? `未知状态: ${status}`;
}
