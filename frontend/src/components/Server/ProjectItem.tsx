import React, { useState } from "react";
import { ProjectIcon, DotsHorizontalIcon, UsersIcon } from "../Icons";
import ChannelItem from "./ChannelItem";
import ProjectSettingsModal from "./ProjectSettingsModal";
import ManageSpecialtiesModal from "./ManageSpecialtiesModal";
import styles from "./ServerView.module.css";
import ConnectedUsersList from "./ConnectedUsersList";
import type { Project, Specialty } from "../../types";
import type {
  Channel,
  ProjectMember,
} from "../../features/servers/serverTypes";
import { useSelector } from "react-redux";
import { selectServerPresence } from "../../features/voice/voiceSlice";

interface ProjectItemProps {
  project: Project;
  currentProjectMember: ProjectMember;
  currentUserId: number;
  serverId: number;
  textChannel: Channel | undefined;
  voiceChannel: Channel | undefined;
  isExpanded: boolean;
  isTextActive: boolean;
  isVoiceActive: boolean;
  isTeamActive: boolean;
  onToggle: (projectId: number) => void;
  onSelectTeam: (projectId: number) => void;
  onSelectTextChannel: (channelId: number) => void;
  onSelectVoiceChannel: (channelId: number, projectId: number) => void;
  onToggleChannelOptions: (channelId: number) => void;
  onSaveProject: (projectId: number, name: string) => void;
  onDeleteProject: (projectId: number) => void;
  specialtiesForProject: Specialty[];
  onUpdateSpecialties: (updated: Specialty[]) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  currentProjectMember,
  currentUserId,
  serverId,
  textChannel,
  voiceChannel,
  isExpanded,
  isTextActive,
  isVoiceActive,
  isTeamActive,
  onToggle,
  onSelectTeam,
  onSelectTextChannel,
  onSelectVoiceChannel,
  onToggleChannelOptions,
  onSaveProject,
  onDeleteProject,
  specialtiesForProject,
  onUpdateSpecialties,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManageSpecialtiesOpen, setIsManageSpecialtiesOpen] = useState(false);

  const serverPresence = useSelector(selectServerPresence(serverId));
  const voiceUsers = project.voiceChannelId
    ? (serverPresence[project.voiceChannelId] ?? [])
    : [];
  const hasVoiceConnected = voiceUsers.length > 0;

  const isLead = specialtiesForProject.find(
    (p) =>
      p.id === currentProjectMember?.specialtyId && p?.name === "PROJECT_LEAD",
  );
  const showTeam = isExpanded || isTeamActive;
  const showText =
    (isExpanded || isTextActive) &&
    project.textChannelId !== undefined &&
    project.textChannelId > 0 &&
    textChannel;
  const showVoice =
    (isExpanded || isVoiceActive) &&
    project.voiceChannelId !== undefined &&
    project.voiceChannelId > 0 &&
    voiceChannel;
  const showSubitems = showTeam || showText || showVoice;

  return (
    <React.Fragment>
      <div
        className={`${styles.channelItem} ${styles.projectHeader}`}
        onClick={() => onToggle(project.id)}
      >
        <ProjectIcon />
        <span>{project.name}</span>
        {isLead && (
          <button
            className={styles.projectOptionsBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true);
            }}
          >
            <DotsHorizontalIcon className={styles.iconLg} />
          </button>
        )}
      </div>
      {showSubitems && (
        <div className={styles.projectSubitems}>
          {showTeam && (
            <div
              className={`${styles.channelItem} ${isTeamActive ? styles.active : ""}`}
              onClick={() => onSelectTeam(project.id)}
            >
              <UsersIcon />
              <span>Team</span>
            </div>
          )}
          {showText && textChannel && (
            <ChannelItem
              channel={textChannel}
              canManageChannels={false}
              isActive={isTextActive}
              onClick={() => onSelectTextChannel(project.textChannelId!)}
              onOptionsClick={(e) => {
                e.stopPropagation();
                onToggleChannelOptions(project.textChannelId!);
              }}
            />
          )}
          {showVoice && voiceChannel && (
            <>
              <ChannelItem
                channel={voiceChannel}
                canManageChannels={false}
                isActive={isVoiceActive}
                onClick={() =>
                  onSelectVoiceChannel(project.voiceChannelId!, project.id)
                }
                onOptionsClick={(e) => {
                  e.stopPropagation();
                  onToggleChannelOptions(project.voiceChannelId!);
                }}
              />
              {hasVoiceConnected && (
                <ConnectedUsersList
                  users={voiceUsers}
                  currentUserId={currentUserId}
                />
              )}
            </>
          )}
        </div>
      )}
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onSaveProject}
        onDelete={onDeleteProject}
        project={project}
        canManageProjects={true}
        onOpenManageSpecialties={() => setIsManageSpecialtiesOpen(true)}
      />
      {isManageSpecialtiesOpen && (
        <ManageSpecialtiesModal
          isOpen={isManageSpecialtiesOpen}
          onClose={() => setIsManageSpecialtiesOpen(false)}
          onSave={onUpdateSpecialties}
          onDelete={(name) =>
            onUpdateSpecialties(
              specialtiesForProject.filter((s) => s.name !== name),
            )
          }
          specialties={specialtiesForProject}
          projectId={project.id}
        />
      )}
    </React.Fragment>
  );
};

export default ProjectItem;
