import React from "react";
import { HashtagIcon, VolumeUpIcon, DotsHorizontalIcon } from "../Icons";
import styles from "./ServerView.module.css";
import type { Channel } from "../../features/servers/serverTypes";

interface ChannelItemProps {
  channel: Channel;
  canManageChannels: boolean;
  isActive: boolean;
  onClick: () => void;
  onOptionsClick?: (e: React.MouseEvent) => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  canManageChannels,
  isActive,
  onClick,
  onOptionsClick,
}) => {
  return (
    <div
      className={`${styles.channelItem} ${
        channel.type === "VOICE" ? styles.voice : ""
      } ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      {channel.type === "TEXT" ? <HashtagIcon /> : <VolumeUpIcon />}
      <span>{channel.name}</span>
      {onOptionsClick && !channel.projectId && canManageChannels && (
        <button className={styles.channelOptionsBtn} onClick={onOptionsClick}>
          <DotsHorizontalIcon className={styles.iconLg} />
        </button>
      )}
    </div>
  );
};

export default ChannelItem;
