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
(function() {
  var _wx = typeof wx !== 'undefined' ? wx : null;
  if (!_wx) return;

  var _canvas = _wx.createCanvas();
  var _sysInfo = _wx.getSystemInfoSync();

  // 屏幕信息
  var screenWidth = _sysInfo.windowWidth;
  var screenHeight = _sysInfo.windowHeight;
  var devicePixelRatio = _sysInfo.pixelRatio || 1;

  // window 属性
  window.canvas = _canvas;
  window.innerWidth = screenWidth;
  window.innerHeight = screenHeight;
  window.devicePixelRatio = devicePixelRatio;
  window.screen = {
    width: screenWidth,
    height: screenHeight,
    availWidth: screenWidth,
    availHeight: screenHeight
  };

  // 触摸支持检测 - Phaser 需要这个
  window.ontouchstart = true;
  window.ontouchmove = true;
  window.ontouchend = true;

  // 伪造 body
  var fakeBody = { 
    appendChild: function(){}, 
    removeChild: function(){}, 
    insertBefore: function(){},
    style: {},
    clientWidth: screenWidth,
    clientHeight: screenHeight
  };

  // 伪造 documentElement
  var fakeDocElement = { 
    style: {},
    clientWidth: screenWidth,
    clientHeight: screenHeight
  };

  // 伪造 head
  var fakeHead = { appendChild: function(){}, removeChild: function(){} };

  // 重写 document 方法
  var origCreateElement = document.createElement;
  document.createElement = function(tagName) {
    tagName = (tagName || '').toLowerCase();
    if (tagName === 'canvas') {
      var c = _wx.createCanvas();
      c.style = c.style || {};
      c.addEventListener = function() {};
      c.removeEventListener = function() {};
      c.getBoundingClientRect = function() {
        return { top: 0, left: 0, width: screenWidth, height: screenHeight };
      };
      return c;
    }
    if (tagName === 'img' || tagName === 'image') {
      var img = _wx.createImage();
      img.addEventListener = function(type, cb) {
        if (type === 'load') img.onload = cb;
        if (type === 'error') img.onerror = cb;
      };
      img.removeEventListener = function() {};
      return img;
    }
    if (tagName === 'audio') {
      return _wx.createInnerAudioContext();
    }
    return { 
      style: {}, 
      appendChild: function(){}, 
      removeChild: function(){},
      addEventListener: function(){},
      removeEventListener: function(){},
      classList: { add: function(){}, remove: function(){} },
      getBoundingClientRect: function() { return { top: 0, left: 0, width: 0, height: 0 }; }
    };
  };
  
  document.getElementById = function() { return _canvas; };
  document.getElementsByTagName = function(tag) { 
    if (tag === 'canvas') return [_canvas];
    if (tag === 'head') return [fakeHead];
    if (tag === 'body') return [fakeBody];
    return []; 
  };
  document.getElementsByClassName = function() { return []; };
  document.querySelector = function(sel) { 
    if (sel === 'canvas' || sel === '#game-container') return _canvas;
    return null; 
  };
  document.querySelectorAll = function() { return []; };
  document.createElementNS = function(ns, tag) { return document.createElement(tag); };

  // 用 defineProperty 设置只读属性
  try {
    Object.defineProperty(document, 'body', { get: function() { return fakeBody; }, configurable: true });
    Object.defineProperty(document, 'documentElement', { get: function() { return fakeDocElement; }, configurable: true });
    Object.defineProperty(document, 'head', { get: function() { return fakeHead; }, configurable: true });
    Object.defineProperty(document, 'readyState', { get: function() { return 'complete'; }, configurable: true });
  } catch(e) {
    // 如果失败就忽略
  }

  // window 属性
  window.document = document;
  window.location = { href: 'game.js', protocol: 'https:', host: '', pathname: '/game.js', search: '', hash: '' };
  window.Image = function() { return document.createElement('img'); };
  window.Audio = function() { return _wx.createInnerAudioContext(); };
  window.HTMLElement = function() {};
  window.HTMLCanvasElement = function() {};
  window.HTMLImageElement = function() {};
  window.HTMLVideoElement = function() {};
  window.FileReader = function() { this.readAsDataURL = function(){}; this.readAsArrayBuffer = function(){}; };
  window.FontFace = function() {};
  window.URL = { createObjectURL: function(){ return ''; }, revokeObjectURL: function(){} };
  window.Blob = function() {};
  
  // 事件
  window.addEventListener = function(type, listener, options) {
    if (type === 'touchstart') _wx.onTouchStart(function(e) { listener(wrapTouchEvent(e)); });
    else if (type === 'touchmove') _wx.onTouchMove(function(e) { listener(wrapTouchEvent(e)); });
    else if (type === 'touchend') _wx.onTouchEnd(function(e) { listener(wrapTouchEvent(e)); });
    else if (type === 'touchcancel') _wx.onTouchCancel(function(e) { listener(wrapTouchEvent(e)); });
    else if (type === 'load' || type === 'DOMContentLoaded') {
      setTimeout(listener, 0);
    }
  };
  window.removeEventListener = function() {};
  
  function wrapTouchEvent(e) {
    return {
      changedTouches: e.changedTouches,
      touches: e.touches,
      timeStamp: e.timeStamp,
      target: _canvas,
      currentTarget: _canvas,
      preventDefault: function() {},
      stopPropagation: function() {}
    };
  }

  // localStorage
  window.localStorage = {
    getItem: function(key) { try { return _wx.getStorageSync(key) || null; } catch(e) { return null; } },
    setItem: function(key, value) { try { _wx.setStorageSync(key, String(value)); } catch(e) {} },
    removeItem: function(key) { try { _wx.removeStorageSync(key); } catch(e) {} },
    clear: function() { try { _wx.clearStorageSync(); } catch(e) {} },
    key: function() { return null; },
    length: 0
  };

  // requestAnimationFrame
  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;
  
  // 其他方法
  window.focus = function() {};
  window.blur = function() {};
  window.close = function() {};
  window.scrollTo = function() {};
  window.scroll = function() {};
  window.alert = function(msg) { _wx.showToast({ title: msg, icon: 'none' }); };
  window.open = function() { return null; };
  window.getComputedStyle = function(el) { 
    return { 
      getPropertyValue: function() { return ''; },
      width: (el && el.width ? el.width : screenWidth) + 'px',
      height: (el && el.height ? el.height : screenHeight) + 'px'
    }; 
  };
  window.matchMedia = function() { return { matches: false, addListener: function(){}, removeListener: function(){} }; };
  window.navigator = { 
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) wxgame',
    language: 'zh-CN',
    platform: 'iPhone',
    appVersion: '5.0',
    maxTouchPoints: 10,
    onLine: true
  };
  
  // Performance
  window.performance = window.performance || {
    now: function() { return Date.now(); },
    mark: function() {},
    measure: function() {},
    getEntriesByName: function() { return []; }
  };

  // 主 canvas 设置
  _canvas.getBoundingClientRect = function() {
    return { top: 0, left: 0, width: screenWidth, height: screenHeight, x: 0, y: 0 };
  };
})();
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
