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
  reactionLabel: "欧气" | "好闪" | "想要" | "同款";
  reactionCount: number;
  reward: number;
};

export const communityEvents: CommunityEvent[] = [
  {
    id: "activity_001",
    kind: "set_completed",
    userName: "Mia",
    userInitial: "M",
    eventLabel: "图鉴完成",
    action: "点亮了最后一只水晶动物",
    detail: "六种造型已经全部到齐，这是她完成的第一套材质图鉴。",
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
    action: "获得了「材质研究员」徽章",
    detail: "他的展柜里已经出现八种不同材质。",
    toyId: "toy_002",
    timeLabel: "32 分钟前",
    reactionLabel: "好闪",
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
    detail: "她把这只小兔记作自己的第一件传说收藏。",
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
  bio: "正在完成每一种动物的材质图鉴。",
  favoriteMaterialLabel: "水晶动物收藏家"
};
