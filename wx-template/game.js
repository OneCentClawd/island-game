/**
 * 微信小游戏入口文件
 * 将此文件复制到微信小游戏项目作为 game.js
 */

// 微信适配器（提供 canvas、Image 等全局对象）
import './libs/weapp-adapter';

// 修复 Phaser 在微信环境的兼容性
if (typeof window !== 'undefined') {
  // Phaser 需要的一些全局对象
  window.focus = function() {};
  
  // 修复 XMLHttpRequest
  if (!window.XMLHttpRequest) {
    window.XMLHttpRequest = function() {
      return wx.request;
    };
  }
}

// 加载 Phaser
import './libs/phaser.min';

// 加载游戏代码
import './js/bundle';
