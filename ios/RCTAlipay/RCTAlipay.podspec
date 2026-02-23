# 本地 podspec，引用 node_modules 中的 @0x5e/react-native-alipay
# 路径相对于本 pod 根目录 ios/RCTAlipay/，必须为相对路径（CocoaPods 校验要求）
ROOT = '../../node_modules/@0x5e/react-native-alipay/ios'

Pod::Spec.new do |s|
  s.name         = 'RCTAlipay'
  s.version      = '0.2.7'
  s.summary      = 'Alipay SDK for React Native'
  s.description  = 'Alipay SDK for React Native. APP pay, auth, etc.'
  s.homepage     = 'https://github.com/0x5e/react-native-alipay'
  s.license      = 'MIT'
  s.author       = { 'gaosen' => '0x5e@sina.cn' }
  s.platform     = :ios, '11.0'
  s.source       = { :http => 'file://' }
  s.source_files = "#{ROOT}/**/*.{h,m}"
  s.requires_arc = true
  s.dependency 'React-Core'
  s.resource = "#{ROOT}/AlipaySDK.bundle"
  s.vendored_libraries = "#{ROOT}/libAlipaySDK.a"
  s.frameworks = 'SystemConfiguration', 'CoreTelephony', 'QuartzCore', 'CoreText', 'CoreGraphics', 'UIKit', 'Foundation', 'CFNetwork', 'CoreMotion'
  s.libraries = 'c++', 'z'
end
