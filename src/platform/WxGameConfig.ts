/**
 * 微信小游戏项目配置
 * 复制此文件到微信小游戏项目根目录作为 game.json
 */
export const WxGameConfig = {
  // 设备方向：portrait(竖屏) / landscape(横屏)
  deviceOrientation: 'portrait',
  
  // 是否显示状态栏
  showStatusBar: false,
  
  // 网络超时
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000,
  },
  
  // 开放数据域代码目录
  openDataContext: 'open-data-context',
  
  // 分包配置（如果需要）
  subpackages: [],
  
  // 插件配置
  plugins: {},
};

/**
 * 微信小游戏项目结构说明
 * 
 * /island-game-wx/
 * ├── game.js          # 入口文件
 * ├── game.json        # 配置文件
 * ├── project.config.json  # 项目配置
 * ├── libs/
 * │   ├── phaser.min.js    # Phaser 库
 * │   └── weapp-adapter.js # 微信适配器
 * ├── js/
 * │   └── bundle.js        # 打包后的游戏代码
 * ├── assets/              # 游戏资源
 * └── open-data-context/   # 开放数据域（排行榜）
 *     ├── index.js
 *     └── game.json
 */

/**
 * 构建微信小游戏的步骤：
 * 
 * 1. 运行 npm run build:wx 生成微信小游戏版本
 * 2. 使用微信开发者工具打开 dist-wx 目录
 * 3. 在 project.config.json 填入 AppID
 * 4. 预览/上传
 */
