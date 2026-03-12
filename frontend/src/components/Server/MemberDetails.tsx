import React, { useState, useRef, useEffect } from "react";
import { AssignRoleIcon, KickIcon, AddFriendIcon, BanIcon } from "../Icons";
import styles from "./MemberDetails.module.css";
import type { Role } from "../../types";
import { useServer } from "../../features/servers/useServers";
import { useAppSelector } from "../../hooks/redux";
import { selectMemberById } from "../../features/servers/serverSlice";
import type { Member } from "../../features/servers/serverTypes";
import { useContacts } from "../../features/contacts/useContacts";
import { useMembers } from "../../features/members/useMembers";

interface MemberDetailsProps {
  member: Member;
  currentUser: Member;
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
}

const MemberDetails: React.FC<MemberDetailsProps> = ({
  member,
  currentUser,
  isOpen,
  onClose,
  roles,
}) => {
  const { updateServerMemberRole } = useServer();
  const { kickMember, banMember } = useMembers();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const defaultAvatar = "/default-avatar.png";

  const latestMember =
    useAppSelector((state) => selectMemberById(state, member.userId)) || member;

  const { contacts, requestContact, acceptContact, rejectContact } =
    useContacts(currentUser.userId);

  const isSelf = member.userId === currentUser.userId;
  const adminRole = roles.find((r) => r.name === "Admin");
  const isCurrentAdmin = currentUser.roleId === adminRole?.id;
  const isMemberAdmin = latestMember.roleId === adminRole?.id;
  const canAssignRole = !isSelf && isCurrentAdmin && !isMemberAdmin;
  const canManageMember = !isSelf && isCurrentAdmin && !isMemberAdmin;

  const relation = contacts.find(
    (contact) =>
      (contact.requester.id === currentUser.userId &&
        contact.target.id === member.userId) ||
      (contact.requester.id === member.userId &&
        contact.target.id === currentUser.userId)
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
    };

    if (showRoleDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(e.target as Node)
      ) {
        setShowAdminMenu(false);
      }
    };

    if (showAdminMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAdminMenu]);

  const handleAssignRole = async (roleId: number) => {
    try {
      await updateServerMemberRole(
        member.serverId,
        member.userId,
        roleId
      ).unwrap();
      setShowRoleDropdown(false);
    } catch (error) {
      console.error("Error updating member role:", error);
    }
  };

  const handleKick = async () => {
    setShowAdminMenu(false);
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar a ${member.username} del servidor?`
      )
    ) {
      return;
    }
    try {
      await kickMember(member.serverId, member.userId);
      onClose();
    } catch (error) {
      console.error("Error kicking member:", error);
    }
  };

  const handleBan = async () => {
    setShowAdminMenu(false);
    if (
      !window.confirm(
        `¿Estás seguro de que quieres banear a ${member.username}?`
      )
    ) {
      return;
    }
    try {
      await banMember(member.serverId, member.userId);
      onClose();
    } catch (error) {
      console.error("Error banning member:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.detailsModal}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-labelledby="member-details-title"
      >
        {canManageMember && (
          <div className={styles.menuContainer} ref={adminMenuRef}>
            <button
              className={styles.modalClose}
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              aria-label="Opciones de administración"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="5" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="19" r="2" fill="currentColor" />
              </svg>
            </button>
            {showAdminMenu && (
              <div className={styles.adminDropdown}>
                <button
                  className={`${styles.roleDropdownItem} ${styles.actionDanger}`}
                  onClick={handleKick}
                >
                  Kick
                  <KickIcon className={styles.icon} />
                </button>
                <button
                  className={`${styles.roleDropdownItem} ${styles.actionDanger}`}
                  onClick={handleBan}
                >
                  Ban
                  <BanIcon className={styles.icon} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.detailsHeader}>
          <div className={styles.avatarContainer}>
            <div className={styles.bannerPreview}>
              <div className={styles.bannerDefault}></div>
            </div>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarPreview}>
                <img
                  src={member.avatarUrl ?? defaultAvatar}
                  alt={`Avatar de ${member.username}`}
                  className={styles.avatarLarge}
                />
                {member.status === "ONLINE" && (
                  <div className={styles.statusIndicatorContainer}>
                    <div
                      className={`${styles.statusIndicator} ${styles.online}`}
                    ></div>
                  </div>
                )}
              </div>
              <div className={styles.userNameContainer}>
                <h2 id="member-details-title" className={styles.userName}>
                  {member.username}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailsScrollContainer}>
          <div className={styles.detailsContent}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailsGridItem}>
                <span className={styles.detailsLabel}>Unido</span>
                <span className={styles.detailsValue}>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className={styles.detailsGridItem}>
                <span className={styles.detailsLabel}>Rol</span>
                <span className={styles.detailsValue}>
                  {roles.find((r) => r.id === latestMember.roleId)?.name ||
                    "Ninguno"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailsActions}>
          <div className={styles.actionsMain}>
            {!isSelf && !relation && (
              <button
                className={styles.actionBtn}
                onClick={() => requestContact(member.userId)}
              >
                <AddFriendIcon className={styles.icon} />
                Add Contact
              </button>
            )}

            {!isSelf &&
              relation?.status === "PENDING" &&
              relation.requester.id === currentUser.userId && (
                <button className={styles.actionBtn} disabled>
                  <AddFriendIcon className={styles.icon} />
                  Request Sent
                </button>
              )}

            {!isSelf &&
              relation?.status === "PENDING" &&
              relation.requester.id === member.userId && (
                <>
                  <button
                    className={styles.actionBtn}
                    onClick={async () => {
                      await acceptContact(relation.id);
                      onClose();
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionDanger}`}
                    onClick={async () => {
                      await rejectContact(relation.id);
                      onClose();
                    }}
                  >
                    <KickIcon className={styles.icon} />
                    Reject
                  </button>
                </>
              )}

            {canAssignRole && (
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <button
                  className={styles.actionBtn}
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  aria-expanded={showRoleDropdown}
                  aria-haspopup="true"
                >
                  <AssignRoleIcon className={styles.icon} />
                  Assign Role
                </button>
                {showRoleDropdown && (
                  <div className={styles.roleDropdown}>
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        className={styles.roleDropdownItem}
                        onClick={() => handleAssignRole(role.id)}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
