import type { FriendProfile, SocialActivity } from "../../types/toy";

export const mockActivities: SocialActivity[] = [
  {
    id: "activity_001",
    userName: "Mia",
    userInitial: "M",
    action: "刚刚抽到了",
    toyId: "toy_005",
    timeLabel: "8 分钟前",
    reward: 1
  },
  {
    id: "activity_002",
    userName: "阿澈",
    userInitial: "澈",
    action: "完成了材质初铸 4/8",
    toyId: "toy_002",
    timeLabel: "32 分钟前",
    reward: 1
  },
  {
    id: "activity_003",
    userName: "Luna",
    userInitial: "L",
    action: "把今日最爱设为了",
    toyId: "toy_003",
    timeLabel: "1 小时前",
    reward: 1
  }
];

export const mockFriends: FriendProfile[] = [
  {
    id: "friend_mia",
    name: "Mia",
    handle: "@mintmia",
    initial: "M",
    collectionCount: 18,
    featuredToyId: "toy_005"
  },
  {
    id: "friend_chen",
    name: "阿澈",
    handle: "@jadechen",
    initial: "澈",
    collectionCount: 12,
    featuredToyId: "toy_002"
  },
  {
    id: "friend_luna",
    name: "Luna",
    handle: "@lunabox",
    initial: "L",
    collectionCount: 21,
    featuredToyId: "toy_003"
  },
  {
    id: "friend_nori",
    name: "Nori",
    handle: "@nori_collects",
    initial: "N",
    collectionCount: 9,
    featuredToyId: "toy_006"
  }
];

export const initialFriendIds = ["friend_mia", "friend_chen"];

export const initialPendingFriendIds = ["friend_luna"];
