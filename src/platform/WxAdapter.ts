/**
 * 微信小游戏适配层
 * 检测运行环境，提供统一的API接口
 */

declare const wx: any;
declare const canvas: any;

/**
 * 是否在微信小游戏环境
 */
export const isWxGame = typeof wx !== 'undefined' && typeof canvas !== 'undefined';

/**
 * 存储适配器
 */
export const Storage = {
  get(key: string): string | null {
    if (isWxGame) {
      return wx.getStorageSync(key) || null;
    }
    return localStorage.getItem(key);
  },

  set(key: string, value: string): void {
    if (isWxGame) {
      wx.setStorageSync(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },

  remove(key: string): void {
    if (isWxGame) {
      wx.removeStorageSync(key);
    } else {
      localStorage.removeItem(key);
    }
  },

  clear(): void {
    if (isWxGame) {
      wx.clearStorageSync();
    } else {
      localStorage.clear();
    }
  },
};

/**
 * 系统信息
 */
export const SystemInfo = {
  get(): { windowWidth: number; windowHeight: number; pixelRatio: number } {
    if (isWxGame) {
      const info = wx.getSystemInfoSync();
      return {
        windowWidth: info.windowWidth,
        windowHeight: info.windowHeight,
        pixelRatio: info.pixelRatio,
      };
    }
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
    };
  },
};

/**
 * 分享功能
 */
export const Share = {
  /**
   * 设置分享信息
   */
  setup(title: string, imageUrl?: string): void {
    if (isWxGame) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline'],
      });

      wx.onShareAppMessage(() => ({
        title,
        imageUrl: imageUrl || '',
      }));

      wx.onShareTimeline(() => ({
        title,
        imageUrl: imageUrl || '',
      }));
    }
  },

  /**
   * 主动触发分享
   */
  show(title: string, imageUrl?: string): void {
    if (isWxGame) {
      wx.shareAppMessage({
        title,
        imageUrl: imageUrl || '',
      });
    } else {
      // Web 端使用 Web Share API（如果支持）
      if (navigator.share) {
        navigator.share({ title, text: title });
      }
    }
  },
};

/**
 * 用户信息
 */
export const UserInfo = {
  /**
   * 获取用户信息（需要用户授权）
   */
  async get(): Promise<{ nickName: string; avatarUrl: string } | null> {
    if (isWxGame) {
      return new Promise((resolve) => {
        wx.getUserInfo({
          success: (res: any) => {
            resolve({
              nickName: res.userInfo.nickName,
              avatarUrl: res.userInfo.avatarUrl,
            });
          },
          fail: () => resolve(null),
        });
      });
    }
    return null;
  },

  /**
   * 创建授权按钮
   */
  createAuthButton(x: number, y: number, width: number, height: number, callback: (info: any) => void): any {
    if (isWxGame) {
      const button = wx.createUserInfoButton({
        type: 'text',
        text: '授权登录',
        style: {
          left: x,
          top: y,
          width,
          height,
          backgroundColor: '#4ecdc4',
          color: '#ffffff',
          fontSize: 18,
          borderRadius: 10,
          textAlign: 'center',
          lineHeight: height,
        },
      });

      button.onTap((res: any) => {
        if (res.userInfo) {
          callback(res.userInfo);
          button.destroy();
        }
      });

      return button;
    }
    return null;
  },
};

/**
 * 广告
 */
export const Ads = {
  rewardedAd: null as any,
  bannerAd: null as any,

  /**
   * 初始化激励视频广告
   */
  initRewardedAd(adUnitId: string): void {
    if (isWxGame && wx.createRewardedVideoAd) {
      this.rewardedAd = wx.createRewardedVideoAd({ adUnitId });
      this.rewardedAd.load();
    }
  },

  /**
   * 显示激励视频广告
   */
  showRewardedAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.rewardedAd) {
        this.rewardedAd.onClose((res: any) => {
          resolve(res && res.isEnded);
        });
        this.rewardedAd.show().catch(() => {
          this.rewardedAd.load().then(() => this.rewardedAd.show());
        });
      } else {
        resolve(false);
      }
    });
  },

  /**
   * 初始化 Banner 广告
   */
  initBannerAd(adUnitId: string, _bottom: number = 0): void {
    if (isWxGame && wx.createBannerAd) {
      const info = wx.getSystemInfoSync();
      this.bannerAd = wx.createBannerAd({
        adUnitId,
        style: {
          left: 0,
          top: info.windowHeight - 100,
          width: info.windowWidth,
        },
      });
    }
  },

  /**
   * 显示 Banner 广告
   */
  showBanner(): void {
    if (this.bannerAd) {
      this.bannerAd.show();
    }
  },

  /**
   * 隐藏 Banner 广告
   */
  hideBanner(): void {
    if (this.bannerAd) {
      this.bannerAd.hide();
    }
  },
};

/**
 * 排行榜（开放数据域）
 */
export const Leaderboard = {
  /**
   * 上传分数
   */
  uploadScore(key: string, score: number): void {
    if (isWxGame) {
      wx.setUserCloudStorage({
        KVDataList: [{ key, value: score.toString() }],
      });
    }
  },

  /**
   * 显示排行榜（需要子域配合）
   */
  show(): void {
    if (isWxGame) {
      // 发送消息给开放数据域
      wx.getOpenDataContext().postMessage({
        type: 'showRank',
      });
    }
  },
};

/**
 * 震动反馈
 */
export const Vibrate = {
  short(): void {
    if (isWxGame) {
      wx.vibrateShort({ type: 'medium' });
    } else if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  },

  long(): void {
    if (isWxGame) {
      wx.vibrateLong();
    } else if (navigator.vibrate) {
      navigator.vibrate(400);
    }
  },
};

/**
 * 平台初始化
 */
export function initPlatform(): void {
  if (isWxGame) {
    // 显示转发按钮
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });

    // 监听小游戏回到前台
    wx.onShow(() => {
      console.log('Game resumed');
    });

    // 监听小游戏隐藏到后台
    wx.onHide(() => {
      console.log('Game paused');
    });
  }
}
