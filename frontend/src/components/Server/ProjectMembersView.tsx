import React, { useState, useMemo, useEffect } from "react";
import styles from "./ProjectMembersView.module.css";
import { SearchIcon, PlusIcon, ProjectIcon } from "../Icons";
import type { Member, ProjectMember } from "../../features/servers/serverTypes";
import ProjectMemberCard from "./ProjectMemberCard";
import ProjectMemberDetails from "./ProjectMemberDetails";
import type { User } from "../../types";
import { useAppSelector } from "../../hooks/redux";
import { selectSpecialtiesByProjectId } from "../../features/servers/specialtiesSlice";
import {
  useProjectMemberMutations,
  useProjectMembersByProjectId,
  useProjectMember,
} from "../../features/servers/useProjectMembers";

interface ProjectMembersViewProps {
  projectName: string | undefined;
  projectId: number;
  currentUser: User;
  serverMembers: Member[];
}

const ProjectMembersView: React.FC<ProjectMembersViewProps> = ({
  projectName,
  projectId,
  currentUser,
  serverMembers,
}) => {
  const {
    updateProjectMemberSpecialty,
    sendProjectInvitationAction,
    removeProjectMemberAction,
    fetchProjectMembers,
  } = useProjectMemberMutations();

  const projectMembers = useProjectMembersByProjectId(projectId);

  const specialties = useAppSelector((state) =>
    selectSpecialtiesByProjectId(state, projectId),
  );

  const current = useProjectMember(projectId, currentUser.id);

  const currentMember = useProjectMember(projectId, currentUser.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    null,
  );
  const [showOptionsForMember, setShowOptionsForMember] = useState<
    number | null
  >(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");

  const defaultAvatar = "/default-avatar.png";

  const filteredMembers = useMemo(() => {
    return projectMembers.filter((member) =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [projectMembers, searchTerm]);

  const isLead = useMemo(() => {
    return specialties.find(
      (s) => s.id === current?.specialtyId && s.name === "PROJECT_LEAD",
    );
  }, [specialties, current]);

  const filteredServerMembers = useMemo(() => {
    if (!inviteSearchQuery) return serverMembers;
    const lowerQuery = inviteSearchQuery.toLowerCase();
    return serverMembers.filter((member) =>
      member.username.toLowerCase().includes(lowerQuery),
    );
  }, [serverMembers, inviteSearchQuery]);

  const availableServerMembers = useMemo(() => {
    const currentMemberIds = new Set(projectMembers.map((m) => m.userId));
    return filteredServerMembers.filter(
      (sm) => !currentMemberIds.has(sm.userId),
    );
  }, [filteredServerMembers, projectMembers]);

  const getSpecialtyName = useMemo(
    () => (id: number | undefined) =>
      specialties.find((s) => s.id === id)?.name || "",
    [specialties],
  );

  useEffect(() => {
    console.log("useEffect EJECUTADO");
    if (projectMembers.length === 0) {
      fetchProjectMembers(projectId);
    }
  }, [projectMembers.length, projectId, fetchProjectMembers]);

  const handleKick = async (projectId: number, memberId: number) => {
    try {
      await removeProjectMemberAction(projectId, memberId);
    } catch (err) {
      console.error("Error removing projectMember:", err);
    }
    setSelectedMember(null);
    setShowOptionsForMember(null);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  const toggleOptions = (memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAnyOpen = showOptionsForMember === memberId;
    if (isAnyOpen) {
      setShowOptionsForMember(null);
    } else {
      setShowOptionsForMember(memberId);
    }
  };

  const handleInviteMember = async (memberId: number) => {
    await sendProjectInvitationAction(projectId, { userId: memberId });
    setIsInviteModalOpen(false);
    setInviteSearchQuery("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.projectInfo}>
          <ProjectIcon />
          <span>{projectName}</span>
        </div>
        {isLead && (
          <button
            className={styles.addMemberBtn}
            onClick={() => setIsInviteModalOpen(true)}
          >
            <PlusIcon />
            Add member
          </button>
        )}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <SearchIcon className={styles.searchIcon} />
        </div>
      </div>
      <div className={styles.content}>
        <div className="content-wrapper">
          <div className={styles.gridView}>
            {filteredMembers.map((member) => (
              <ProjectMemberCard
                key={member.userId}
                projectMember={member}
                specialtyName={getSpecialtyName(member.specialtyId) || "Member"}
                isLead={!!isLead}
                currentUserId={currentUser.id}
                isSelected={selectedMember?.userId === member.userId}
                onSelect={() => setSelectedMember(member)}
                onOptionsClick={(e) => toggleOptions(member.userId, e)}
                showOptions={showOptionsForMember === member.userId}
                onKick={() => handleKick(projectId, member.userId)}
                onCloseOptions={() => setShowOptionsForMember(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className={styles.inviteModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            <h2 className={styles.inviteTitle} id="invite-modal-title">
              Invite Member to Project
            </h2>
            <p className={styles.inviteSubtitle}>
              Select a server member to invite to the project
            </p>
            <div className={styles.inviteSearchContainer}>
              <input
                type="text"
                placeholder="Search members"
                value={inviteSearchQuery}
                onChange={(e) => setInviteSearchQuery(e.target.value)}
                className={styles.inviteSearchInput}
              />
            </div>
            <div className={styles.inviteMembersList}>
              {availableServerMembers.length > 0 ? (
                availableServerMembers.map((member) => (
                  <div key={member.userId} className={styles.inviteMemberItem}>
                    <div className={styles.inviteMemberInfo}>
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl ?? defaultAvatar}
                          alt={member.username}
                          className={styles.inviteAvatar}
                        />
                      ) : (
                        <div className={styles.inviteAvatarPlaceholder}>
                          {member.username[0].toUpperCase()}
                        </div>
                      )}
                      <span>{member.username}</span>
                    </div>
                    <button
                      className={styles.inviteButton}
                      onClick={() => handleInviteMember(member.userId)}
                    >
                      Invite
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noMembers}>No available members found.</p>
              )}
            </div>
            <div className={styles.inviteFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMember && currentMember && (
        <ProjectMemberDetails
          currentUser={currentUser}
          currentMember={currentMember}
          projectMember={selectedMember}
          isOpen={true}
          onClose={handleCloseModal}
          onAssignSpecialty={(projectMember, specialtyId) => {
            updateProjectMemberSpecialty(
              projectMember.projectId,
              projectMember.userId,
              specialtyId,
            );

            setSelectedMember((prev) =>
              prev && prev.userId === projectMember.userId
                ? { ...prev, specialtyId }
                : prev,
            );
          }}
          specialties={specialties}
        />
      )}
    </div>
  );
};

export default ProjectMembersView;
