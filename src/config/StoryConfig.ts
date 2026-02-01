/**
 * 对话数据结构
 */
export interface DialogLine {
  speaker: 'player' | 'npc' | 'narrator';
  name?: string;
  avatar?: string;
  text: string;
  emotion?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised';
}

export interface DialogScene {
  id: string;
  trigger: 'level_complete' | 'first_build' | 'first_play' | 'achievement' | 'manual';
  triggerValue?: number | string;
  lines: DialogLine[];
  onComplete?: () => void;
}

/**
 * 游戏剧情对话
 */
export const STORY_DIALOGS: DialogScene[] = [
  // 开场剧情
  {
    id: 'intro',
    trigger: 'first_play',
    lines: [
      { speaker: 'narrator', text: '在遥远的海洋中央，有一座被遗忘的小岛...' },
      { speaker: 'narrator', text: '你乘坐的船只在暴风雨中失事，漂流到了这里。' },
      { speaker: 'player', name: '你', text: '这是...哪里？看起来是座荒岛...' },
      { speaker: 'npc', name: '???', text: '醒了？太好了！我还以为你...' },
      { speaker: 'player', name: '你', text: '你是谁？这里是什么地方？' },
      { speaker: 'npc', name: '小精灵', text: '我是这座岛的守护精灵～你可以叫我小叶！', emotion: 'happy' },
      { speaker: 'npc', name: '小叶', text: '这座岛曾经很繁荣，但很久没有人来了...', emotion: 'sad' },
      { speaker: 'npc', name: '小叶', text: '既然你来了，要不要帮忙重建这座岛呢？', emotion: 'happy' },
      { speaker: 'player', name: '你', text: '重建？我该怎么做？' },
      { speaker: 'npc', name: '小叶', text: '岛上有神奇的宝石矿，消除它们可以获得资源！' },
      { speaker: 'npc', name: '小叶', text: '用资源就可以建造建筑，让小岛恢复生机～' },
      { speaker: 'npc', name: '小叶', text: '来，我教你怎么玩！', emotion: 'happy' },
    ],
  },

  // 第一关通关
  {
    id: 'level1_complete',
    trigger: 'level_complete',
    triggerValue: 1,
    lines: [
      { speaker: 'npc', name: '小叶', text: '太棒了！你学得真快！', emotion: 'happy' },
      { speaker: 'npc', name: '小叶', text: '看，你获得了一些资源～' },
      { speaker: 'npc', name: '小叶', text: '用这些资源可以建造新的建筑哦！' },
      { speaker: 'player', name: '你', text: '感觉还挺有趣的！' },
      { speaker: 'npc', name: '小叶', text: '加油！让我们一起重建这座美丽的小岛吧～', emotion: 'happy' },
    ],
  },

  // 第5关通关
  {
    id: 'level5_complete',
    trigger: 'level_complete',
    triggerValue: 5,
    lines: [
      { speaker: 'npc', name: '小叶', text: '哇！你已经通过5关了！', emotion: 'surprised' },
      { speaker: 'npc', name: '小叶', text: '小岛开始有点生机了呢～' },
      { speaker: 'player', name: '你', text: '是啊，慢慢有家的感觉了。' },
      { speaker: 'npc', name: '小叶', text: '继续加油！后面的关卡会越来越有挑战性哦～' },
    ],
  },

  // 第10关通关
  {
    id: 'level10_complete',
    trigger: 'level_complete',
    triggerValue: 10,
    lines: [
      { speaker: 'npc', name: '小叶', text: '10关了！你真的很厉害！', emotion: 'happy' },
      { speaker: 'narrator', text: '小岛渐渐恢复了往日的生机...' },
      { speaker: 'npc', name: '小叶', text: '对了，我想起来一件事...' },
      { speaker: 'npc', name: '小叶', text: '岛的另一边好像还有些秘密等着被发现...' },
      { speaker: 'player', name: '你', text: '秘密？什么秘密？' },
      { speaker: 'npc', name: '小叶', text: '嘿嘿，继续探索就知道啦～', emotion: 'happy' },
    ],
  },

  // 第一次建造建筑
  {
    id: 'first_build',
    trigger: 'first_build',
    lines: [
      { speaker: 'npc', name: '小叶', text: '恭喜你建造了第一个建筑！', emotion: 'happy' },
      { speaker: 'npc', name: '小叶', text: '建筑不仅好看，有些还能自动产出资源哦～' },
      { speaker: 'npc', name: '小叶', text: '记得常回来看看，收取产出！' },
    ],
  },

  // 建造商店
  {
    id: 'build_shop',
    trigger: 'first_build',
    triggerValue: 'shop',
    lines: [
      { speaker: 'npc', name: '小叶', text: '商店建好了！', emotion: 'happy' },
      { speaker: 'npc', name: '小叶', text: '商店每隔一段时间会产出金币～' },
      { speaker: 'npc', name: '小叶', text: '有了稳定的收入，重建工作会更顺利的！' },
    ],
  },

  // 建造农场
  {
    id: 'build_farm',
    trigger: 'first_build',
    triggerValue: 'farm',
    lines: [
      { speaker: 'npc', name: '小叶', text: '农场建好啦！', emotion: 'happy' },
      { speaker: 'npc', name: '小叶', text: '农场可以产出木材，建造更多建筑就靠它了！' },
    ],
  },
];

/**
 * 获取触发的对话
 */
export function getTriggeredDialog(
  trigger: DialogScene['trigger'],
  value?: number | string,
  completedDialogs: string[] = []
): DialogScene | null {
  for (const dialog of STORY_DIALOGS) {
    // 跳过已完成的对话
    if (completedDialogs.includes(dialog.id)) continue;

    if (dialog.trigger === trigger) {
      // 如果有具体触发值，需要匹配
      if (dialog.triggerValue !== undefined) {
        if (dialog.triggerValue === value) {
          return dialog;
        }
      } else {
        return dialog;
      }
    }
  }
  return null;
}
