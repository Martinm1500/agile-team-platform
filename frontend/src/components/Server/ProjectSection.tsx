import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { PlusIcon } from "../Icons";
import styles from "./ServerView.module.css";
import ProjectItem from "./ProjectItem";
import type { Project, MainView } from "../../types";
import type {
  Channel,
  Member,
  ProjectMember,
} from "../../features/servers/serverTypes";
import { useProjectMemberMutations } from "../../features/servers/useProjectMembers";
import { useSpecialties } from "../../features/servers/useSpecialties";
import { selectSpecialties } from "../../features/servers/specialtiesSlice";
import { useAppSelector } from "../../hooks/redux";
import { selectProjectMembers } from "../../features/servers/projectMemberSlice";

interface ProjectSectionProps {
  projects: Project[];
  currentMember: Member;
  currentUserId: number;
  serverId: number;
  expandedProjects: Set<number>;
  activeChannelId: number;
  currentChannelId: number | null;
  canManageProjects: boolean;
  mainView: MainView;
  selectedProjectId: number | null;
  getChannelById: (id: number) => Channel | undefined;
  toggleProject: (projectId: number) => void;
  handleOptionClick: (view: MainView, projectId?: number) => void;
  handleChannelSelect: (channelId: number) => void;
  handleVoiceChannelSelect: (
    channelId: number,
    projectId: number | null,
  ) => void;
  toggleChannelOptions: (channelId: number) => void;
  handleUpdateProject: (projectId: number, name: string) => void;
  handleProjectDelete: (projectId: number) => void;
  onAddProject: () => void;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  currentMember,
  currentUserId,
  serverId,
  expandedProjects,
  activeChannelId,
  currentChannelId,
  canManageProjects,
  mainView,
  selectedProjectId,
  getChannelById,
  toggleProject,
  handleOptionClick,
  handleChannelSelect,
  handleVoiceChannelSelect,
  toggleChannelOptions,
  handleUpdateProject,
  handleProjectDelete,
  onAddProject,
}) => {
  const { fetchProjectMembers } = useProjectMemberMutations();
  const { fetchSpecialties } = useSpecialties();
  const allSpecialties = useAppSelector(selectSpecialties);
  const [fetchedProjects, setFetchedProjects] = useState<Set<number>>(
    new Set(),
  );

  const allProjectMembers = useSelector(selectProjectMembers);

  const projectMembersMap = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc[project.id] = Object.values(allProjectMembers).filter(
          (pm) => pm.projectId === project.id,
        );
        return acc;
      },
      {} as { [key: number]: ProjectMember[] },
    );
  }, [allProjectMembers, projects]);

  useEffect(() => {
    projects.forEach((project) => {
      if (!fetchedProjects.has(project.id)) {
        fetchProjectMembers(project.id);
        const specialties = Object.values(allSpecialties).filter(
          (spec) => spec.projectId === project.id,
        );
        if (specialties.length === 0) {
          fetchSpecialties(project.id);
        }
        setFetchedProjects((prev) => new Set([...prev, project.id]));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, allSpecialties, fetchedProjects]);

  return (
    <div className={styles.channelsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>PROJECTS</div>
        {canManageProjects && (
          <button className={styles.addChannelBtn} onClick={onAddProject}>
            <PlusIcon />
          </button>
        )}
      </div>
      <div className={styles.channelList}>
        {projects.map((project) => {
          const isExpanded = expandedProjects.has(project.id);
          let isTextActive = false;
          const textChannel = getChannelById(project.textChannelId!);
          const voiceChannel = getChannelById(project.voiceChannelId!);
          if (project.textChannelId && textChannel) {
            isTextActive =
              project.textChannelId > 0 &&
              activeChannelId === project.textChannelId &&
              mainView === "text";
          }
          let isVoiceActive = false;
          if (project.voiceChannelId && voiceChannel) {
            isVoiceActive =
              project.voiceChannelId > 0 &&
              currentChannelId === project.voiceChannelId;
          }
          const isTeamActive =
            mainView === "project-members" && selectedProjectId === project.id;
          const projectMembers = projectMembersMap[project.id];
          const currentProjectMember = projectMembers.find(
            (pm) => pm.userId === currentMember?.userId,
          );
          const specialties = Object.values(allSpecialties).filter(
            (spec) => spec.projectId === project.id!,
          );
          return (
            <ProjectItem
              key={project.id}
              project={project}
              currentProjectMember={currentProjectMember!}
              currentUserId={currentUserId}
              serverId={serverId}
              textChannel={textChannel}
              voiceChannel={voiceChannel}
              isExpanded={isExpanded}
              isTextActive={isTextActive}
              isVoiceActive={isVoiceActive}
              isTeamActive={isTeamActive}
              onToggle={toggleProject}
              onSelectTeam={() =>
                handleOptionClick("project-members", project.id)
              }
              onSelectTextChannel={handleChannelSelect}
              onSelectVoiceChannel={handleVoiceChannelSelect}
              onToggleChannelOptions={toggleChannelOptions}
              onSaveProject={handleUpdateProject}
              onDeleteProject={handleProjectDelete}
              specialtiesForProject={specialties}
              onUpdateSpecialties={(updated) => console.log(updated)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProjectSection;
