# QRConnectWeb
> 暂时无法实现扫码跳转网页后自动连接WiFi
> 
QRConnectWeb 不依赖数据库存储信息，通过特殊编码将 WiFi 信息编码到 URL 中，生成对应的二维码，扫描二维码后即可在连接页面中解码获取 WiFi 信息，然后一键自动连接该 WiFi。

- 项目使用 Next.js 框架开发

## 功能介绍
直接访问网站，即可进入二维码生成页面；如果带参数访问，则进入连接页面。

1. 二维码生成：
    - 输入连接的 Wi-Fi 名称和密码
    - 通过特殊编码将 WiFi 信息编码到 URL 中，得到含有 WiFi 信息的地址
    - 点击“生成二维码”按钮，可生成该地址对应的Connect二维码

2. 连接：
    - 扫描Connect二维码，即可跳转连接页面
    - 此时将自动解码URL中的WiFi信息，生成标准的WiFi二维码
    - 点击“连接”按钮，调用相机扫描网页上的WIFI二维码
    - 扫描成功后，跳出WIFI连接页面，点击连接即可

## WIFI二维码连接原理

本项目使用标准的 WIFI 连接协议格式：

```
WIFI:T:<加密类型>;S:<SSID>;P:<密码>;H:<是否隐藏>;;
```

参数说明：
- T: 加密类型（如 WPA、WEP 等，大多数情况下为 WPA）
- S: SSID（WiFi 名称）
- P: 密码
- H: 是否隐藏（可选参数，苹果设备暂不支持）

示例：
```
WIFI:T:WPA;S:MyHomeWiFi;P:mypassword123;;
```

工作流程：
1. 用户输入 WiFi 信息
2. 工具根据输入生成符合协议的字符串
3. 将字符串编码到 URL 中并生成二维码
4. 用户扫描二维码后，设备解析 URL 中的 WiFi 信息
5. 设备自动执行 WiFi 连接操作

注意：具体连接过程可能因设备和操作系统而异。


## 测试步骤
1. npm install
2. 为了使用HTTPS测试，需要生成证书:
- 安装 mkcert：
```bash
# macOS
brew install mkcert

# Windows (使用管理员权限的 PowerShell)
choco install mkcert
```
- 安装本地 CA：
```bash
mkcert -install
```
  - 在项目根目录生成证书
```bash
mkcert localhost
```
   - 如果你需要在局域网设备上测试：
- 使用 mkcert 生成包含IP的证书（IP为局域网内作为服务器的设备的IP）：
```bash
mkcert localhost 192.168.1.100
```
3. 运行开发服务器：
```bash
npm run dev
```



