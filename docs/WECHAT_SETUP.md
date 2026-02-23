# 微信登录「AppId参数错误」排查说明

出现 **AppId参数错误** 时，通常是微信开放平台上的应用配置与客户端不一致，请按下面逐项核对。

## 1. 应用与 AppId 对应关系

- 当前代码使用的 **AppId**：`wx72d5dff4cdd29534`（来自 `src/config/wechat.js`）。
- 该 AppId 必须在 [微信开放平台](https://open.weixin.qq.com/) 对应**同一个移动应用**，且该应用已通过审核。

---

## 2. iOS：Bundle ID 必须一致

- 微信开放平台该应用里填写的 **iOS Bundle ID** 必须与 Xcode 中的 **Product Bundle Identifier** 完全一致（区分大小写）。
- 当前工程 Bundle ID 为：`org.reactjs.native.example.XingYuanShuiJingNativeProject`（以 Xcode → Target → General → Bundle Identifier 为准）。

若不一致，在开放平台修改为当前工程的 Bundle ID 并保存，或把工程改成开放平台里填写的 Bundle ID。

---

## 3. iOS：Universal Link 必须一致

- `registerApp` 的第二个参数（Universal Link）必须与微信开放平台该应用里配置的 **iOS Universal Link** 完全一致。
- 当前代码使用的 Universal Link：`https://gaocanyixue.com/pay/callback/`（见 `src/config/wechat.js` 的 `WECHAT_UNIVERSAL_LINK`）。

请确认：

1. 开放平台中该应用的「iOS 应用」里填写的 **Universal Link 与上面完全一致**（含末尾斜杠 `/`），一个字符都不能差。
2. 该域名下已正确配置 **apple-app-site-association（AASA）** 文件：
   - 能通过 `https://gaocanyixue.com/.well-known/apple-app-site-association` 或 `https://gaocanyixue.com/apple-app-site-association` 访问；
   - 内容中需包含本应用的 **appID**（格式：`TeamID.org.reactjs.native.example.XingYuanShuiJingNativeProject`），且 **paths** 包含 `/pay/callback/*`（与 Universal Link 路径一致）。
   - 若 AASA 未配置或路径不匹配，iOS 会认为 Universal Link 无效，微信 SDK 可能报「AppID参数错误」。

---

## 4. Android：包名与签名

- 开放平台该应用里填写的 **Android 包名** 必须与 `android/app/build.gradle` 中的 `applicationId` 一致。
- 当前为：`com.xingyuanshuijingnativeproject`。
- **签名**：开放平台填写的应用签名（如 MD5）需与打包/调试用的 keystore 一致，否则也会导致校验失败。

---

## 5. 小结检查清单

| 项目           | 当前值 / 位置 |
|----------------|----------------|
| AppId          | `wx72d5dff4cdd29534`（`src/config/wechat.js`） |
| Universal Link | `https://gaocanyixue.com/pay/callback/` |
| iOS Bundle ID  | `org.reactjs.native.example.XingYuanShuiJingNativeProject`（Xcode 中查看） |
| Android 包名    | `com.xingyuanshuijingnativeproject`（`android/app/build.gradle`） |

在微信开放平台该应用下确认：**AppId、iOS Bundle ID、Universal Link、Android 包名与签名** 均与上表及实际工程一致后，再重新安装 App 测试微信登录。若仍报 AppId 错误，可在开放平台查看该应用审核状态及是否有「参数错误」类提示。
