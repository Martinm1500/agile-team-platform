import React from "react";
import styles from "./ActiveMemberItem.module.css";
import { CodeIcon, KanbanIcon } from "../Icons";
import type { Member } from "../../features/servers/serverTypes";

interface ActiveMemberItemProps {
  member: Member;
}

const ActiveMemberItem: React.FC<ActiveMemberItemProps> = ({ member }) => {
  const defaultAvatar = "/default-avatar.png";

  return (
    <div className={styles.activeMemberItem}>
      <div className={styles.avatarContainer}>
        <img src={member.avatarUrl ?? defaultAvatar} alt={member.username} />
        <span
          className={`${styles.statusIndicator} ${
            member.status === "ONLINE" ? styles.active : styles.inactive
          }`}
        ></span>
      </div>
      <div>
        <div className={styles.memberActivity}>
          {member.username === "Alex" ? (
            <KanbanIcon className={styles.activityIcon} />
          ) : (
            <CodeIcon className={styles.activityIcon} />
          )}
          {member.username === "Alex"
            ? "Updating Backlog"
            : "Editing dashboard.jsx"}
        </div>
      </div>
    </div>
  );
};

export default ActiveMemberItem;
