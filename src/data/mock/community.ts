import { mockToys } from "./toys";

export type CommunityEventKind =
  | "draw_revealed"
  | "set_completed"
  | "achievement_unlocked"
  | "showcase_updated";

export type CommunityEvent = {
  id: string;
  kind: CommunityEventKind;
  userName: string;
  userInitial: string;
  eventLabel: string;
  action: string;
  detail: string;
  toyId: string;
  timeLabel: string;
  reactionLabel: "欧气" | "好萌" | "想要" | "同款";
  reactionCount: number;
  reward: number;
};

export const communityEvents: CommunityEvent[] = [
  {
    id: "activity_001",
    kind: "set_completed",
    userName: "Mia",
    userInitial: "M",
    eventLabel: "色卡进度",
    action: "遇见了第四种棒棒糖配色",
    detail: "玫瑰、薄荷、晴空和葡萄都进入展柜，她离完整色卡又近了一步。",
    toyId: "toy_001",
    timeLabel: "8 分钟前",
    reactionLabel: "欧气",
    reactionCount: 24,
    reward: 1
  },
  {
    id: "activity_002",
    kind: "achievement_unlocked",
    userName: "阿澈",
    userInitial: "澈",
    eventLabel: "成就解锁",
    action: "获得了「配色收藏家」徽章",
    detail: "他的展柜里已经出现四种柔和、干净的身体配色。",
    toyId: "toy_002",
    timeLabel: "32 分钟前",
    reactionLabel: "好萌",
    reactionCount: 18,
    reward: 1
  },
  {
    id: "activity_003",
    kind: "showcase_updated",
    userName: "Luna",
    userInitial: "L",
    eventLabel: "展柜更新",
    action: "换上了新的代表藏品",
    detail: "她把这只蜂蜜杏水獭记作今天最温暖的一次相遇。",
    toyId: "toy_003",
    timeLabel: "1 小时前",
    reactionLabel: "想要",
    reactionCount: 12,
    reward: 1
  }
];

export const communityToyById = new Map(mockToys.map((toy) => [toy.id, toy]));

export const collectorProfile = {
  name: "Leo",
  handle: "@leocollects",
  initial: "L",
  joinedLabel: "2026 年 7 月加入",
  bio: "正在收集每一种柔和又独特的小动物配色。",
  title: "软萌小动物收藏家"
};