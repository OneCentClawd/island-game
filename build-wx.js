/**
 * 微信小游戏构建脚本 (跨平台)
 * 运行: node build-wx.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏝️ 构建小岛物语微信小游戏版本...\n');

// 创建目录
const dirs = ['dist-wx', 'dist-wx/js', 'dist-wx/libs', 'dist-wx/open-data-context'];
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
fs.copyFileSync('wx-template/app.json', 'dist-wx/app.json');
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

// 创建微信适配器
console.log('🔧 创建微信适配器...');
const adapterCode = `// 微信小游戏适配器
var window = typeof window !== 'undefined' ? window : {};
var document = typeof document !== 'undefined' ? document : {};

if (typeof wx !== 'undefined') {
  var _canvas = wx.createCanvas();
  
  window.canvas = _canvas;
  window.innerWidth = _canvas.width;
  window.innerHeight = _canvas.height;
  window.devicePixelRatio = 1;

  document.createElement = function(tagName) {
    if (tagName === 'canvas') return wx.createCanvas();
    if (tagName === 'img' || tagName === 'image') return wx.createImage();
    return { style: {} };
  };
  document.getElementById = function() { return _canvas; };
  document.body = { appendChild: function() {} };
  document.documentElement = { style: {} };

  window.Image = function() { return wx.createImage(); };
  
  window.addEventListener = function(type, listener) {
    var eventMap = { touchstart: 'onTouchStart', touchmove: 'onTouchMove', touchend: 'onTouchEnd' };
    if (eventMap[type]) wx[eventMap[type]](listener);
  };

  window.Audio = function() { return wx.createInnerAudioContext(); };

  window.localStorage = {
    getItem: function(key) { return wx.getStorageSync(key) || null; },
    setItem: function(key, value) { wx.setStorageSync(key, value); },
    removeItem: function(key) { wx.removeStorageSync(key); },
    clear: function() { wx.clearStorageSync(); }
  };

  window.requestAnimationFrame = _canvas.requestAnimationFrame.bind(_canvas);
  window.cancelAnimationFrame = _canvas.cancelAnimationFrame.bind(_canvas);
  window.focus = function() {};
  window.scrollTo = function() {};
  navigator.userAgent = 'wxgame';
}
`;
fs.writeFileSync('dist-wx/libs/weapp-adapter.js', adapterCode);

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
fs.writeFileSync('dist-wx/game.js', `require('./libs/weapp-adapter.js');
require('./libs/phaser.min.js');
require('./js/bundle.js');
`);

// 创建开放数据域
console.log('🏆 创建排行榜...');
fs.writeFileSync('dist-wx/open-data-context/index.js', `var sharedCanvas = wx.getSharedCanvas();
var ctx = sharedCanvas.getContext('2d');

wx.onMessage(function(data) {
  if (data.type === 'showRank') {
    wx.getFriendCloudStorage({
      keyList: ['score'],
      success: function(res) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);
        ctx.fillStyle = '#333333';
        ctx.font = '20px Arial';
        ctx.fillText('好友排行榜', 20, 40);
        
        res.data.sort(function(a, b) {
          var sa = a.KVDataList.find(function(kv) { return kv.key === 'score'; });
          var sb = b.KVDataList.find(function(kv) { return kv.key === 'score'; });
          return (sb ? parseInt(sb.value) : 0) - (sa ? parseInt(sa.value) : 0);
        });
        
        res.data.slice(0, 10).forEach(function(item, index) {
          var score = item.KVDataList.find(function(kv) { return kv.key === 'score'; });
          ctx.fillText((index + 1) + '. ' + item.nickname + ': ' + (score ? score.value : 0), 20, 80 + index * 30);
        });
      }
    });
  }
});
`);
fs.writeFileSync('dist-wx/open-data-context/game.json', '{}');

console.log('\n✅ 构建完成！\n');
console.log('下一步：');
console.log('1. 用微信开发者工具打开 dist-wx 目录');
console.log('2. 在 project.config.json 中把 YOUR_APPID_HERE 改成您的 AppID');
console.log('3. 预览或上传');
