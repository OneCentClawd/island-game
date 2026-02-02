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

// 创建微信适配器
console.log('🔧 创建微信适配器...');
const adapterCode = `// 微信小游戏适配器
(function() {
  var _wx = typeof wx !== 'undefined' ? wx : null;
  if (!_wx) return;

  var _canvas = _wx.createCanvas();
  var _sysInfo = _wx.getSystemInfoSync();

  var screenWidth = _sysInfo.windowWidth;
  var screenHeight = _sysInfo.windowHeight;
  var devicePixelRatio = _sysInfo.pixelRatio || 1;

  // 触摸支持
  window.ontouchstart = true;
  window.ontouchmove = true;
  window.ontouchend = true;

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

  // 伪造元素
  var fakeBody = { 
    appendChild: function(){}, 
    removeChild: function(){}, 
    insertBefore: function(){},
    style: {},
    clientWidth: screenWidth,
    clientHeight: screenHeight
  };
  var fakeDocElement = { 
    style: {},
    clientWidth: screenWidth,
    clientHeight: screenHeight
  };
  var fakeHead = { appendChild: function(){}, removeChild: function(){} };

  // 创建元素函数
  function createElement(tagName) {
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
  }

  // document 对象完全重写
  var fakeDocument = {
    createElement: createElement,
    createElementNS: function(ns, tag) { return createElement(tag); },
    getElementById: function(id) { return _canvas; },
    getElementsByTagName: function(tag) { 
      if (tag === 'canvas') return [_canvas];
      if (tag === 'head') return [fakeHead];
      if (tag === 'body') return [fakeBody];
      return []; 
    },
    getElementsByClassName: function() { return []; },
    querySelector: function(sel) { 
      if (sel === 'canvas' || sel.indexOf('game') >= 0) return _canvas;
      return null; 
    },
    querySelectorAll: function() { return []; },
    body: fakeBody,
    documentElement: fakeDocElement,
    head: fakeHead,
    readyState: 'complete',
    visibilityState: 'visible',
    hidden: false,
    addEventListener: function(type, cb) {
      if (type === 'DOMContentLoaded' || type === 'readystatechange') {
        setTimeout(cb, 0);
      }
    },
    removeEventListener: function() {},
    createEvent: function() { 
      return { initEvent: function(){} }; 
    }
  };

  // 覆盖全局 document
  window.document = fakeDocument;

  // window 属性
  window.location = { href: 'game.js', protocol: 'https:', host: '', pathname: '/game.js', search: '', hash: '' };
  window.Image = function() { return createElement('img'); };
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
  window.alert = function(msg) { _wx.showToast({ title: String(msg), icon: 'none' }); };
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

  // MutationObserver 模拟
  window.MutationObserver = function() {
    this.observe = function() {};
    this.disconnect = function() {};
    this.takeRecords = function() { return []; };
  };

  // ResizeObserver 模拟
  window.ResizeObserver = function() {
    this.observe = function() {};
    this.disconnect = function() {};
    this.unobserve = function() {};
  };

  // IntersectionObserver 模拟
  window.IntersectionObserver = function() {
    this.observe = function() {};
    this.disconnect = function() {};
    this.unobserve = function() {};
  };

  // 覆盖全局 document（确保生效）
  if (typeof document !== 'undefined') {
    for (var key in fakeDocument) {
      try {
        document[key] = fakeDocument[key];
      } catch(e) {}
    }
  }
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

console.log('\n✅ 构建完成！\n');
console.log('下一步：');
console.log('1. 用微信开发者工具打开 dist-wx 目录');
console.log('2. 选择测试号或填入小游戏 AppID');
console.log('3. 预览或上传');
