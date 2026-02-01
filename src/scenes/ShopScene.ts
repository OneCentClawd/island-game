import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { SHOP_ITEMS, FREE_DAILY_REWARDS, ShopItem } from '../config/ShopConfig';
import { saveManager } from '../managers/SaveManager';
import { AudioManager } from '../managers/AudioManager';

/**
 * 商店场景
 */
export class ShopScene extends Phaser.Scene {
  private audioManager!: AudioManager;
  private currentTab: string = 'energy';
  private listContainer!: Phaser.GameObjects.Container;
  private tabButtons: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);

    // 背景
    this.add.graphics()
      .fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
      .fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    // 标题
    this.add.text(GameConfig.WIDTH / 2, 50, '🛒 商店', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 资源显示
    this.createResourceBar();

    // 返回按钮
    this.createBackButton();

    // 每日签到
    this.createDailyLogin();

    // 标签页
    this.createTabs();

    // 商品列表容器
    this.listContainer = this.add.container(0, 320);
    this.showTab('energy');
  }

  private createResourceBar(): void {
    const resources = saveManager.getResources();
    const y = 90;

    this.add.text(GameConfig.WIDTH / 2 - 100, y, `💰 ${resources.coin}`, {
      fontSize: '20px',
      color: '#ffe66d',
    }).setOrigin(0.5);

    this.add.text(GameConfig.WIDTH / 2 + 100, y, `💎 ${resources.diamond}`, {
      fontSize: '20px',
      color: '#9b59b6',
    }).setOrigin(0.5);
  }

  private createDailyLogin(): void {
    const y = 140;
    const loginData = saveManager.getLoginStreak();
    const today = new Date().toDateString();
    const canClaim = loginData.lastLogin !== today;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.8);
    bg.fillRoundedRect(20, y, GameConfig.WIDTH - 40, 100, 12);

    this.add.text(GameConfig.WIDTH / 2, y + 20, `🎁 每日签到 (连续${loginData.streak}天)`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 7天奖励预览
    const startX = 45;
    const spacing = (GameConfig.WIDTH - 90) / 7;

    FREE_DAILY_REWARDS.forEach((reward, index) => {
      const x = startX + index * spacing;
      const isCurrent = (loginData.streak % 7) === index;
      const isPast = index < (loginData.streak % 7);

      // 奖励图标
      const rewardText = this.add.text(x, y + 55, reward.icon, {
        fontSize: '24px',
      }).setOrigin(0.5);

      if (isPast) {
        rewardText.setAlpha(0.5);
        this.add.text(x, y + 80, '✓', {
          fontSize: '16px',
          color: '#27ae60',
        }).setOrigin(0.5);
      } else if (isCurrent && canClaim) {
        // 可领取状态 - 闪烁
        this.tweens.add({
          targets: rewardText,
          scale: 1.2,
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      }
    });

    // 领取按钮
    if (canClaim) {
      const claimBtn = this.add.text(GameConfig.WIDTH - 80, y + 50, '签到', {
        fontSize: '18px',
        color: '#2c3e50',
        fontStyle: 'bold',
        backgroundColor: '#f1c40f',
        padding: { x: 15, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      claimBtn.on('pointerup', () => {
        this.claimDailyLogin();
      });
    } else {
      this.add.text(GameConfig.WIDTH - 80, y + 50, '已签', {
        fontSize: '18px',
        color: '#27ae60',
      }).setOrigin(0.5);
    }
  }

  private claimDailyLogin(): void {
    this.audioManager.playClick();
    
    const streak = saveManager.claimDailyLogin();
    const rewardIndex = (streak - 1) % 7;
    const reward = FREE_DAILY_REWARDS[rewardIndex];

    // 发放奖励
    if (reward.type === 'energy') {
      const current = saveManager.getEnergy();
      // 直接加体力（可超过上限）
      saveManager.addEnergy(reward.amount);
    } else {
      saveManager.updateResources({ [reward.type]: reward.amount });
    }

    // 显示奖励弹窗
    this.showRewardPopup(reward);
  }

  private showRewardPopup(reward: typeof FREE_DAILY_REWARDS[0]): void {
    const centerX = GameConfig.WIDTH / 2;
    const centerY = GameConfig.HEIGHT / 2;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT), Phaser.Geom.Rectangle.Contains);

    const panel = this.add.image(centerX, centerY, 'panel').setScale(2, 1.8);

    this.add.text(centerX, centerY - 60, '🎉 签到成功！', {
      fontSize: '28px',
      color: '#f1c40f',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY, reward.icon, {
      fontSize: '64px',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 50, `+${reward.amount}`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    overlay.once('pointerup', () => {
      overlay.destroy();
      panel.destroy();
      this.scene.restart();
    });
  }

  private createTabs(): void {
    const tabs = [
      { id: 'energy', name: '⚡ 体力' },
      { id: 'powerup', name: '🎯 道具' },
      { id: 'resource', name: '📦 资源' },
    ];

    const tabWidth = (GameConfig.WIDTH - 40) / tabs.length;
    const y = 270;

    tabs.forEach((tab, index) => {
      const x = 20 + index * tabWidth;
      const container = this.add.container(x + tabWidth / 2, y);

      const bg = this.add.graphics();
      container.add(bg);

      const text = this.add.text(0, 0, tab.name, {
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5);
      container.add(text);

      bg.setInteractive(new Phaser.Geom.Rectangle(-tabWidth / 2, -20, tabWidth, 40), Phaser.Geom.Rectangle.Contains);
      bg.on('pointerup', () => {
        this.audioManager.playClick();
        this.showTab(tab.id);
      });

      this.tabButtons.set(tab.id, container);
    });

    this.updateTabStyle();
  }

  private updateTabStyle(): void {
    const tabWidth = (GameConfig.WIDTH - 40) / 3;

    this.tabButtons.forEach((container, id) => {
      const bg = container.getAt(0) as Phaser.GameObjects.Graphics;
      const text = container.getAt(1) as Phaser.GameObjects.Text;

      bg.clear();
      if (id === this.currentTab) {
        bg.fillStyle(0x3498db, 1);
        bg.fillRoundedRect(-tabWidth / 2, -20, tabWidth, 40, { tl: 10, tr: 10, bl: 0, br: 0 });
        text.setColor('#ffffff');
      } else {
        bg.fillStyle(0x2c3e50, 1);
        bg.fillRoundedRect(-tabWidth / 2, -20, tabWidth, 40, { tl: 10, tr: 10, bl: 0, br: 0 });
        text.setColor('#888888');
      }
    });
  }

  private showTab(tabId: string): void {
    this.currentTab = tabId;
    this.updateTabStyle();
    this.listContainer.removeAll(true);

    const items = SHOP_ITEMS.filter(item => item.category === tabId);
    const itemHeight = 90;
    const padding = 10;

    items.forEach((item, index) => {
      this.createShopItem(item, index * (itemHeight + padding));
    });
  }

  private createShopItem(item: ShopItem, y: number): void {
    const width = GameConfig.WIDTH - 40;
    const height = 90;
    const x = 20;

    const resources = saveManager.getResources();
    const canAfford = item.price.type === 'coin' 
      ? resources.coin >= item.price.amount
      : resources.diamond >= item.price.amount;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 0.8);
    bg.fillRoundedRect(x, y, width, height, 10);
    this.listContainer.add(bg);

    // 图标
    const icon = this.add.text(x + 45, y + height / 2, item.icon, {
      fontSize: '36px',
    }).setOrigin(0.5);
    this.listContainer.add(icon);

    // 名称
    const name = this.add.text(x + 90, y + 18, item.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.listContainer.add(name);

    // 描述
    const desc = this.add.text(x + 90, y + 45, item.description, {
      fontSize: '14px',
      color: '#aaaaaa',
    });
    this.listContainer.add(desc);

    // 限购
    if (item.limit) {
      const purchased = saveManager.getItemPurchaseCount(item.id);
      const limitText = this.add.text(x + 90, y + 68, `今日: ${purchased}/${item.limit}`, {
        fontSize: '12px',
        color: purchased >= item.limit ? '#e74c3c' : '#888888',
      });
      this.listContainer.add(limitText);
    }

    // 购买按钮
    const priceIcon = item.price.type === 'coin' ? '💰' : '💎';
    const btnColor = canAfford ? 0x27ae60 : 0x555555;

    const btn = this.add.graphics();
    btn.fillStyle(btnColor, 1);
    btn.fillRoundedRect(width - 80, y + height / 2 - 18, 80, 36, 8);
    this.listContainer.add(btn);

    const btnText = this.add.text(width - 40, y + height / 2, `${priceIcon}${item.price.amount}`, {
      fontSize: '16px',
      color: canAfford ? '#ffffff' : '#888888',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.listContainer.add(btnText);

    if (canAfford) {
      btn.setInteractive(new Phaser.Geom.Rectangle(width - 80, y + height / 2 - 18, 80, 36), Phaser.Geom.Rectangle.Contains);
      btn.on('pointerup', () => {
        this.purchaseItem(item);
      });
    }
  }

  private purchaseItem(item: ShopItem): void {
    // 检查限购
    if (item.limit) {
      const purchased = saveManager.getItemPurchaseCount(item.id);
      if (purchased >= item.limit) {
        this.showMessage('今日已达购买上限');
        return;
      }
    }

    this.audioManager.playClick();

    // 扣除费用
    if (item.price.type === 'coin') {
      saveManager.updateResources({ coin: -item.price.amount });
    } else {
      saveManager.updateResources({ diamond: -item.price.amount });
    }

    // 发放物品
    this.giveItem(item);

    // 记录购买
    if (item.limit) {
      saveManager.recordItemPurchase(item.id);
    }

    this.showMessage(`购买成功: ${item.name}`);
    this.scene.restart();
  }

  private giveItem(item: ShopItem): void {
    switch (item.give.type) {
      case 'energy':
        saveManager.addEnergy(item.give.amount);
        break;
      case 'coin':
        saveManager.updateResources({ coin: item.give.amount });
        break;
      case 'resource_pack':
        saveManager.updateResources({ wood: 100, stone: 50 });
        break;
      case 'unlimited_energy':
        saveManager.setUnlimitedEnergy(item.give.amount);
        break;
      default:
        // 道具存入背包
        saveManager.addInventoryItem(item.give.type, item.give.amount);
        break;
    }
  }

  private showMessage(text: string): void {
    const msg = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 100, text, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#2c3e50',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: msg,
      y: msg.y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => msg.destroy(),
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.text(50, 50, '← 返回', {
      fontSize: '24px',
      color: '#ffffff',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      this.audioManager.playClick();
      this.scene.start('MainMenuScene');
    });
  }
}
