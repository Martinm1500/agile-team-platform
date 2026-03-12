import React, { useRef } from "react";
import UserItem from "./UserItem";
import styles from "./VoiceChannel.module.css";
import { ChevronLeftIcon, ChevronRightIcon, SignalIcon } from "../Icons";
import {
  selectChannelPresence,
  selectCurrentChannelName,
  selectCurrentServerId,
} from "../../features/voice/voiceSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface VoiceChannelProps {
  currentUserId: number;
  channelId: number;
}

const VoiceChannel: React.FC<VoiceChannelProps> = ({
  currentUserId,
  channelId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const serverId = useSelector((state: RootState) =>
    selectCurrentServerId(state),
  );

  const channelName = useSelector((state: RootState) =>
    selectCurrentChannelName(state),
  );

  const channelUsers = useSelector(selectChannelPresence(serverId!, channelId));

  return (
    <div className={styles.voiceChannel}>
      <div className={styles.voiceChannelWrapper}>
        <div className={styles.voiceChannelNav}>
          <button
            className={styles.voiceChannelNavBtn}
            id="voiceChannelPrevBtn"
            aria-label="Previous User"
          >
            <ChevronLeftIcon />
          </button>
        </div>
        <div className={styles.voiceChannelContainer} ref={containerRef}>
          <div className={styles.signal}>
            <SignalIcon className={styles.signalIcon} />
          </div>
          <div className={styles.voiceChannelInfo}>
            <div className={styles.voiceChannelName}>{channelName}</div>
            <div className={styles.voiceChannelMeta}>
              {channelUsers.length}{" "}
              {channelUsers.length === 1 ? "user" : "users"} connected
            </div>
          </div>
          <div className={styles.voiceChannelInner}>
            {channelUsers.map((user) => (
              <UserItem
                key={`${channelId}-${user.id}`}
                user={user}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
        <div className={styles.voiceChannelNav}>
          <button
            className={styles.voiceChannelNavBtn}
            id="voiceChannelNextBtn"
            aria-label="Next User"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannel;
