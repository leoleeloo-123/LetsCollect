export const avatarOptions = [
  { key: "mint-unicorn", label: "薄荷", palette: "mint" },
  { key: "rose-unicorn", label: "樱粉", palette: "rose" },
  { key: "honey-unicorn", label: "蜜糖", palette: "honey" },
  { key: "ice-unicorn", label: "冰川", palette: "ice" },
  { key: "emerald-unicorn", label: "森绿", palette: "emerald" },
  { key: "lavender-unicorn", label: "紫雾", palette: "lavender" }
] as const;

export type AvatarKey = (typeof avatarOptions)[number]["key"];

export type Profile = {
  id: string;
  display_name: string;
  public_code: string;
  avatar_key: AvatarKey;
  created_at: string;
  updated_at: string;
};

const blockedFragments = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "asshole",
  "傻逼",
  "操你",
  "妈的",
  "草泥马",
  "管理员",
  "官方",
  "系统账号",
  "客服"
];

export function normalizeDisplayName(value: string) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

export function validateDisplayName(value: string) {
  const normalized = normalizeDisplayName(value);
  const length = Array.from(normalized).length;

  if (length < 2 || length > 16) {
    return { value: normalized, error: "昵称需要 2-16 个字符。" };
  }

  if (!/^[A-Za-z0-9 _\-\u4E00-\u9FFF]+$/u.test(normalized)) {
    return { value: normalized, error: "仅支持中文、英文字母、数字、空格、下划线和短横线。" };
  }

  const comparable = normalized.toLocaleLowerCase();
  if (blockedFragments.some((fragment) => comparable.includes(fragment))) {
    return { value: normalized, error: "这个昵称包含不适合展示的词，请换一个。" };
  }

  return { value: normalized, error: "" };
}

export function isAvatarKey(value: string): value is AvatarKey {
  return avatarOptions.some((option) => option.key === value);
}
