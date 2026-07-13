import { RotateCcw, Search, UserRoundPlus, UsersRound } from "lucide-react";
import { useRef, useState } from "react";
import { useMvpState } from "../../app/MvpState";
import { PageHeader } from "../../components/ui/PageHeader";
import { mockFriends } from "../../data/mock/social";
import { FriendRow } from "../../features/friends/FriendRow";

export function FriendsPage() {
  const { friendIds, pendingFriendIds, addFriend, acceptFriend, resetDemo } = useMvpState();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesQuery = (name: string, handle: string) =>
    !normalizedQuery || `${name} ${handle}`.toLocaleLowerCase().includes(normalizedQuery);
  const friends = mockFriends.filter(
    (friend) => friendIds.includes(friend.id) && matchesQuery(friend.name, friend.handle)
  );
  const pending = mockFriends.filter(
    (friend) => pendingFriendIds.includes(friend.id) && matchesQuery(friend.name, friend.handle)
  );
  const suggestions = mockFriends.filter(
    (friend) =>
      !friendIds.includes(friend.id) &&
      !pendingFriendIds.includes(friend.id) &&
      matchesQuery(friend.name, friend.handle)
  );

  return (
    <div className="page-stack friends-page">
      <PageHeader eyebrow="好友" title="一起收藏的人" description="看看朋友最近遇见了谁，也邀请新的收藏伙伴加入。" />

      <div className="friend-tools">
        <label className="search-field">
          <Search size={18} />
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索昵称或账号"
            aria-label="搜索好友"
          />
        </label>
        <button
          className="icon-button"
          type="button"
          aria-label="查找并添加好友"
          onClick={() => searchInputRef.current?.focus()}
        >
          <UserRoundPlus size={20} />
        </button>
      </div>

      {pending.length > 0 ? (
        <section className="content-section">
          <div className="section-heading section-heading--inline">
            <div><p className="eyebrow">新的连接</p><h2>好友申请</h2></div>
            <span className="count-badge">{pending.length}</span>
          </div>
          <div className="friend-list">
            {pending.map((friend) => <FriendRow key={friend.id} friend={friend} status="pending" onAction={acceptFriend} />)}
          </div>
        </section>
      ) : null}

      <section className="content-section">
        <div className="section-heading section-heading--inline">
          <div><p className="eyebrow">我的好友</p><h2>{friends.length} 位收藏伙伴</h2></div>
          <UsersRound size={22} />
        </div>
        <div className="friend-list">
          {friends.map((friend) => <FriendRow key={friend.id} friend={friend} status="friend" />)}
        </div>
      </section>

      {suggestions.length > 0 ? (
        <section className="content-section">
          <div className="section-heading"><p className="eyebrow">可能认识</p><h2>发现新伙伴</h2></div>
          <div className="friend-list">
            {suggestions.map((friend) => <FriendRow key={friend.id} friend={friend} status="suggested" onAction={addFriend} />)}
          </div>
        </section>
      ) : null}

      <button className="reset-demo-button" type="button" onClick={resetDemo}>
        <RotateCcw size={16} /> 重置本地演示数据
      </button>
    </div>
  );
}
