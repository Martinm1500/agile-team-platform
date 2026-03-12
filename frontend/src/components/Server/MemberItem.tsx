import React from "react";
import styles from "./MemberItem.module.css";
import type { Member } from "../../features/servers/serverTypes";

interface MemberItemProps {
  member: Member;
  onClick?: () => void;
}

const defaultAvatar = "/default-avatar.png";

const MemberItem: React.FC<MemberItemProps> = ({ member, onClick }) => {
  return (
    <div className={styles.memberItem} onClick={onClick}>
      <div className={styles.avatarContainer}>
        <img src={member.avatarUrl ?? defaultAvatar} alt={member.username} />
        <span
          className={`${styles.statusIndicator} ${
            member.status === "ONLINE" ? styles.active : styles.inactive
          }`}
        ></span>
      </div>
      <div>
        <span className={styles.username}>{member.username}</span>
      </div>
    </div>
  );
};

export default React.memo(MemberItem);
