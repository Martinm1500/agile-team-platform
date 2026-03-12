import React from "react";
import { PlusIcon } from "../Icons";
import styles from "./ServerView.module.css";
import ChannelItem from "./ChannelItem";
import ConnectedUsersList from "./ConnectedUsersList";
import type { MainView } from "../../types";
import type { Channel } from "../../features/servers/serverTypes";
import { useSelector } from "react-redux";
import { selectServerPresence } from "../../features/voice/voiceSlice";

interface ChannelSectionProps {
  title: string;
  channels: Channel[];
  currentUserId: number;
  serverId: number;
  isVoice: boolean;
  activeChannelId: number | null;
  currentChannelId?: number | null;
  canManageChannels: boolean;
  mainView: MainView;
  onChannelSelect: (channelId: number) => void;
  onVoiceChannelSelect: (channelId: number, projectId: number | null) => void;
  onToggleOptions: (channelId: number) => void;
  onAddChannel: () => void;
}

const ChannelSection: React.FC<ChannelSectionProps> = ({
  title,
  channels,
  currentUserId,
  serverId,
  isVoice,
  activeChannelId,
  currentChannelId,
  canManageChannels,
  mainView,
  onChannelSelect,
  onVoiceChannelSelect,
  onToggleOptions,
  onAddChannel,
}) => {
  const serverPresence = useSelector(selectServerPresence(serverId));

  return (
    <div className={styles.channelsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>{title}</div>
        {canManageChannels && (
          <button className={styles.addChannelBtn} onClick={onAddChannel}>
            <PlusIcon />
          </button>
        )}
      </div>
      <div className={styles.channelList}>
        {channels.map((channel) => {
          const isActive = isVoice
            ? currentChannelId === channel.id
            : activeChannelId === channel.id && mainView === "text";
          const onClick = isVoice
            ? () => onVoiceChannelSelect(channel.id, null)
            : () => onChannelSelect(channel.id);
          const channelUsers = serverPresence[channel.id] ?? [];

          return (
            <React.Fragment key={channel.id}>
              <ChannelItem
                channel={channel}
                canManageChannels={canManageChannels}
                isActive={isActive}
                onClick={onClick}
                onOptionsClick={(e) => {
                  e.stopPropagation();
                  onToggleOptions(channel.id);
                }}
              />
              {isVoice && channelUsers.length > 0 && (
                <ConnectedUsersList
                  users={channelUsers}
                  currentUserId={currentUserId}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelSection;
