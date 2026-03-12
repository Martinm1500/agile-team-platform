import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Specialty, User } from "../../types";
import { AssignRoleIcon, AddFriendIcon, KickIcon, CloseIcon } from "../Icons";
import styles from "./ProjectMemberDetails.module.css";
import type { ProjectMember } from "../../features/servers/serverTypes";
import { useContacts } from "../../features/contacts/useContacts";

interface ProjectMemberDetailsProps {
  currentUser: User;
  projectMember: ProjectMember;
  currentMember: ProjectMember;
  isOpen: boolean;
  onClose: () => void;
  onAssignSpecialty: (
    projectMember: ProjectMember,
    specialtyId: number
  ) => void;
  specialties: Specialty[];
}

const ProjectMemberDetails: React.FC<ProjectMemberDetailsProps> = ({
  currentUser,
  currentMember,
  projectMember,
  isOpen,
  onClose,
  onAssignSpecialty,
  specialties,
}) => {
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSpecialtyName = (id: number) =>
    specialties.find((s) => s.id === id)?.name || "";

  const { contacts, requestContact, acceptContact, rejectContact } =
    useContacts(currentUser.id);

  const relation = contacts.find(
    (contact) =>
      (contact.requester.id === currentMember.userId &&
        contact.target.id === projectMember?.userId) ||
      (contact.requester.id === projectMember?.userId &&
        contact.target.id === currentMember.userId)
  );

  const isProjectLead = useMemo(() => {
    return specialties.find(
      (s) => s.name === "PROJECT_LEAD" && s.id === currentMember?.specialtyId
    );
  }, [currentMember?.specialtyId, specialties]);

  const isSelf = useMemo(() => {
    return currentMember.userId === projectMember.userId;
  }, [currentMember.userId, projectMember.userId]);

  const handleAssignSpecialty = (member: ProjectMember, selected: string) => {
    const spec = specialties.find((s) => s.name === selected);
    if (!spec) return;
    const assignedId = spec.id;
    onAssignSpecialty(member, assignedId);
    setShowSpecialtyDropdown(false);
  };

  // Close modal with Escape key and prevent body scroll
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowSpecialtyDropdown(false);
      }
    };

    if (showSpecialtyDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSpecialtyDropdown]);

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
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Cerrar detalles del miembro"
        >
          <CloseIcon />
        </button>

        <div className={styles.detailsHeader}>
          <div className={styles.avatarContainer}>
            <div className={styles.bannerPreview}>
              <div className={styles.bannerDefault}></div>
            </div>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarPreview}>
                <img
                  src={projectMember.avatarUrl!}
                  alt={`Avatar de ${projectMember.username}`}
                  className={styles.avatarLarge}
                />
                {projectMember && (
                  <div className={styles.statusIndicatorContainer}>
                    <div
                      className={`${styles.statusIndicator} ${styles.online}`}
                    ></div>
                  </div>
                )}
              </div>
              <div className={styles.userNameContainer}>
                <h2 id="member-details-title" className={styles.userName}>
                  {projectMember.username}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailsScrollContainer}>
          <div className={styles.detailsContent}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailsGridItem}>
                <span className={styles.detailsLabel}>Specialty</span>
                <span className={styles.detailsValue}>
                  {getSpecialtyName(projectMember.specialtyId) ||
                    "Ninguna asignada"}
                </span>
              </div>
              <div className={styles.detailsGridItem}>
                <span className={styles.detailsLabel}>Joined</span>
                <span className={styles.detailsValue}>
                  {new Date().toLocaleDateString()}
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
                onClick={() => requestContact(projectMember.userId)}
              >
                <AddFriendIcon className={styles.icon} />
                Add Contact
              </button>
            )}

            {!isSelf &&
              relation?.status === "PENDING" &&
              relation.requester.id === currentMember.userId && (
                <button className={styles.actionBtn} disabled>
                  <AddFriendIcon className={styles.icon} />
                  Request Sent
                </button>
              )}

            {!isSelf &&
              relation?.status === "PENDING" &&
              relation.requester.id === projectMember.userId && (
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

            {isProjectLead && !isSelf && (
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <button
                  className={styles.actionBtn}
                  onClick={() =>
                    setShowSpecialtyDropdown(!showSpecialtyDropdown)
                  }
                  aria-expanded={showSpecialtyDropdown}
                  aria-haspopup="true"
                >
                  <AssignRoleIcon className={styles.icon} />
                  Add Specialty
                </button>
                {showSpecialtyDropdown && (
                  <div className={styles.specialtyDropdown}>
                    {specialties.map(
                      (specialty) =>
                        specialty.name !== "PROJECT_LEAD" && (
                          <button
                            key={specialty.id}
                            className={styles.specialtyDropdownItem}
                            onClick={() => {
                              handleAssignSpecialty(
                                projectMember,
                                specialty.name
                              );
                            }}
                          >
                            {specialty.name}
                          </button>
                        )
                    )}
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

export default ProjectMemberDetails;
