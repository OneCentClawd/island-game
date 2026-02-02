/**
 * 微信小游戏构建脚本 (跨平台)
 * 运行: node build-wx.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏝️ 构建小岛物语微信小游戏版本...\n');

// 创建目录
const dirs = ['dist-wx', 'dist-wx/js', 'dist-wx/libs'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 先构建 Web 版本
console.log('📦 构建游戏代码...');
try {
  execSync('npx tsc && npx vite build', { stdio: 'inherit', shell: true });
} catch (e) {
  console.error('构建失败！');
  process.exit(1);
}

// 复制配置文件
console.log('\n📋 复制配置文件...');
fs.copyFileSync('wx-template/game.json', 'dist-wx/game.json');
fs.copyFileSync('wx-template/project.config.json', 'dist-wx/project.config.json');
fs.copyFileSync('wx-template/project.private.config.json', 'dist-wx/project.private.config.json');

// 复制 Phaser 库
console.log('📚 复制 Phaser 库...');
const phaserPath = 'node_modules/phaser/dist/phaser.min.js';
if (fs.existsSync(phaserPath)) {
  fs.copyFileSync(phaserPath, 'dist-wx/libs/phaser.min.js');
} else {
  console.error('找不到 Phaser 库！请先运行 npm install');
  process.exit(1);
}

// 复制官方 weapp-adapter
console.log('🔧 复制官方 weapp-adapter...');
const adapterPath = 'node_modules/weapp-adapter/weapp-adapter.js';
if (fs.existsSync(adapterPath)) {
  fs.copyFileSync(adapterPath, 'dist-wx/libs/weapp-adapter.js');
} else {
  console.error('找不到 weapp-adapter！请运行 npm install weapp-adapter');
  process.exit(1);
}

// 复制构建好的 JS
console.log('🔗 复制游戏代码...');
const distDir = 'dist/assets';
if (fs.existsSync(distDir)) {
  const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
  if (jsFiles.length > 0) {
    const jsContent = jsFiles.map(f => fs.readFileSync(path.join(distDir, f), 'utf-8')).join('\n');
    fs.writeFileSync('dist-wx/js/bundle.js', jsContent);
  }
}

// 创建入口文件
console.log('📝 创建入口文件...');
fs.writeFileSync('dist-wx/game.js', `// 微信小游戏入口 - 先设置全局环境
(function() {
  // GameGlobal 是微信小游戏的全局对象
  var global = GameGlobal;
  
  // 设置 window
  if (!global.window) {
    global.window = global;
  }
  var window = global.window;
  
  // 设置 self
  if (!global.self) {
    global.self = global;
  }
  
  // Phaser 需要的触摸检测
  window.ontouchstart = function() {};
  window.ontouchmove = function() {};
  window.ontouchend = function() {};
  
  // 基础 document
  if (!window.document) {
    window.document = {
      readyState: 'complete',
      visibilityState: 'visible',
      hidden: false,
      head: { appendChild: function(){} },
      body: { appendChild: function(){} },
      createElement: function() { return {}; },
      getElementById: function() { return null; },
      addEventListener: function() {}
    };
  }
})();

require('./libs/weapp-adapter.js');
require('./libs/phaser.min.js');
require('./js/bundle.js');
`);

console.log('\n✅ 构建完成！\n');
console.log('下一步：');
console.log('1. 用微信开发者工具打开 dist-wx 目录');
console.log('2. 选择测试号或填入小游戏 AppID');
console.log('3. 预览或上传');
