import React, { useRef, useEffect } from "react";
import styles from "./ProjectMemberCard.module.css";
import { OptionsIcon, KickIcon } from "../Icons";
import type { ProjectMember } from "../../features/servers/serverTypes";

interface ProjectMemberCardProps {
  projectMember: ProjectMember;
  specialtyName: string;
  isLead: boolean;
  currentUserId: number;
  isSelected: boolean;
  onSelect: () => void;
  onOptionsClick: (e: React.MouseEvent) => void;
  showOptions: boolean;
  onKick: () => void;
  onCloseOptions: () => void;
}

const ProjectMemberCard: React.FC<ProjectMemberCardProps> = ({
  projectMember,
  specialtyName,
  isLead,
  currentUserId,
  isSelected,
  onSelect,
  onOptionsClick,
  showOptions,
  onKick,
  onCloseOptions,
}) => {
  const optionsDropdownRef = useRef<HTMLDivElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutsideOptions = (event: MouseEvent) => {
      if (
        optionsDropdownRef.current &&
        !optionsDropdownRef.current.contains(event.target as Node) &&
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(event.target as Node)
      ) {
        onCloseOptions();
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutsideOptions);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideOptions);
    };
  }, [showOptions, onCloseOptions]);

  return (
    <div
      className={`${styles.gridItem} ${isSelected ? styles.itemSelected : ""}`}
      onClick={onSelect}
    >
      <div className={styles.avatarWrapper}>
        <img
          src={projectMember.avatarUrl!}
          alt={projectMember.username}
          className={styles.avatar}
        />
        {projectMember && <span className={styles.onlineBadge}></span>}
      </div>
      <div className={styles.info}>
        <div className={styles.nameWrapper}>
          <span className={styles.name}>{projectMember.username}</span>
        </div>
        <div className={styles.details}>
          <span className={styles.specialty}>{specialtyName}</span>
        </div>
      </div>
      {isLead && projectMember.userId !== currentUserId && (
        <div className={styles.itemOptions}>
          <button
            className={styles.optionsBtn}
            ref={optionsButtonRef}
            onClick={onOptionsClick}
          >
            <OptionsIcon />
          </button>
          {showOptions && (
            <div className={styles.optionsDropdown} ref={optionsDropdownRef}>
              <button
                className={styles.optionItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onKick();
                }}
              >
                Kick
                <KickIcon className={styles.icon} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectMemberCard;
