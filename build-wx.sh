#!/bin/bash
# 构建微信小游戏版本

echo "🏝️ 构建小岛物语微信小游戏版本..."

# 创建输出目录
rm -rf dist-wx
mkdir -p dist-wx/js
mkdir -p dist-wx/libs
mkdir -p dist-wx/open-data-context

# 构建游戏代码
echo "📦 构建游戏代码..."
npm run build

# 复制模板文件
echo "📋 复制配置文件..."
cp wx-template/game.json dist-wx/
cp wx-template/project.config.json dist-wx/

# 复制 Phaser 库
echo "📚 复制 Phaser 库..."
cp node_modules/phaser/dist/phaser.min.js dist-wx/libs/

# 下载微信适配器
echo "🔧 准备微信适配器..."
cat > dist-wx/libs/weapp-adapter.js << 'EOF'
// 简化版微信适配器
// 完整版请从 https://github.com/nicholasqiu/nicholasqiu.github.io 获取

var window = typeof window !== 'undefined' ? window : {};
var document = typeof document !== 'undefined' ? document : {};

if (typeof wx !== 'undefined') {
  var _canvas = wx.createCanvas();
  var _ctx = _canvas.getContext('2d');

  // Canvas 适配
  window.canvas = _canvas;
  window.innerWidth = _canvas.width;
  window.innerHeight = _canvas.height;
  window.devicePixelRatio = 1;

  // document 适配
  document.createElement = function(tagName) {
    if (tagName === 'canvas') {
      return wx.createCanvas();
    }
    if (tagName === 'img' || tagName === 'image') {
      return wx.createImage();
    }
    return { style: {} };
  };

  document.getElementById = function() { return _canvas; };
  document.body = { appendChild: function() {} };
  document.documentElement = { style: {} };

  // Image 适配
  window.Image = function() {
    return wx.createImage();
  };

  // 事件适配
  window.addEventListener = function(type, listener) {
    if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
      wx['on' + type.charAt(0).toUpperCase() + type.slice(1)](listener);
    }
  };

  // 音频适配
  window.Audio = function() {
    return wx.createInnerAudioContext();
  };

  // localStorage 适配
  window.localStorage = {
    getItem: function(key) { return wx.getStorageSync(key) || null; },
    setItem: function(key, value) { wx.setStorageSync(key, value); },
    removeItem: function(key) { wx.removeStorageSync(key); },
    clear: function() { wx.clearStorageSync(); }
  };

  // RAF 适配
  window.requestAnimationFrame = _canvas.requestAnimationFrame.bind(_canvas);
  window.cancelAnimationFrame = _canvas.cancelAnimationFrame.bind(_canvas);

  // 其他
  window.focus = function() {};
  window.scrollTo = function() {};
  navigator.userAgent = 'wxgame';

  // 导出
  if (typeof module !== 'undefined') {
    module.exports = { window, document, canvas: _canvas };
  }
}
EOF

# 合并游戏代码
echo "🔗 合并游戏代码..."
cat dist/assets/*.js > dist-wx/js/bundle.js

# 创建入口文件
cat > dist-wx/game.js << 'EOF'
require('./libs/weapp-adapter.js');
require('./libs/phaser.min.js');
require('./js/bundle.js');
EOF

# 创建开放数据域
cat > dist-wx/open-data-context/index.js << 'EOF'
// 排行榜开放数据域
const sharedCanvas = wx.getSharedCanvas();
const ctx = sharedCanvas.getContext('2d');

wx.onMessage((data) => {
  if (data.type === 'showRank') {
    drawRankList();
  }
});

function drawRankList() {
  wx.getFriendCloudStorage({
    keyList: ['score'],
    success: (res) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);
      
      ctx.fillStyle = '#333333';
      ctx.font = '20px Arial';
      ctx.fillText('好友排行榜', 20, 40);
      
      res.data.sort((a, b) => {
        const scoreA = a.KVDataList.find(kv => kv.key === 'score');
        const scoreB = b.KVDataList.find(kv => kv.key === 'score');
        return (scoreB ? parseInt(scoreB.value) : 0) - (scoreA ? parseInt(scoreA.value) : 0);
      });
      
      res.data.slice(0, 10).forEach((item, index) => {
        const score = item.KVDataList.find(kv => kv.key === 'score');
        ctx.fillText(
          `${index + 1}. ${item.nickname}: ${score ? score.value : 0}`,
          20,
          80 + index * 30
        );
      });
    }
  });
}
EOF

cat > dist-wx/open-data-context/game.json << 'EOF'
{}
EOF

echo "✅ 构建完成！"
echo ""
echo "下一步："
echo "1. 用微信开发者工具打开 dist-wx 目录"
echo "2. 在 project.config.json 中填入你的 AppID"
echo "3. 预览或上传"
