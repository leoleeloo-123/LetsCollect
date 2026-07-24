import { Check, UserPlus } from "lucide-react";
import { toyById } from "../../data/mock/toys";
import type { FriendProfile } from "../../types/toy";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";

type FriendRowProps = {
  friend: FriendProfile;
  status: "friend" | "pending" | "suggested";
  onAction?: (friendId: string) => void;
};

export function FriendRow({ friend, status, onAction }: FriendRowProps) {
  const toy = toyById.get(friend.featuredToyId);

  return (
    <article className="friend-row">
      <div className="friend-row__avatar" aria-hidden="true">{friend.initial}</div>
      <div className="friend-row__identity">
        <strong>{friend.name}</strong>
        <span>{friend.handle} · {friend.collectionCount} 件藏品</span>
      </div>
      {toy ? <ToyThumbnail toy={toy} size="small" /> : null}
      {status === "friend" ? (
        <span className="friend-row__status"><Check size={15} /> 好友</span>
      ) : (
        <button className="icon-text-button" type="button" onClick={() => onAction?.(friend.id)}>
          <UserPlus size={17} />
          {status === "pending" ? "接受" : "添加"}
        </button>
      )}
    </article>
  );
}
