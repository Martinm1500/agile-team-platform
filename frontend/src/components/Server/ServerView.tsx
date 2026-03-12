import React, { useState, useCallback, useEffect, useMemo } from "react";
import TextChannel from "./TextChannel";
import ProjectMembersView from "./ProjectMembersView";
import SidebarActivity from "./SidebarActivity";
import CreateProjectModal from "./CreateProjectModal";
import CreateChannelModal from "./CreateChannelModal";
import InvitePeopleModal from "./InvitePeopleModal";
import ServerSettingsModal from "./ServerSettingsModal";
import ManageRolesModal from "./ManageRolesModal";
import IsComingSoonModal from "./IsComingSoonModal";
import ChannelSettingsModal from "./ChannelSettingsModal";
import TaskDetails from "../tools/kanban/TaskDetails";
import VoiceChannelConfirmModal from "./VoiceChannelConfirmModal";
import ChannelSection from "./ChannelSection";
import ProjectSection from "./ProjectSection";
import {
  saveSmartNotesWorkspace,
  initializeWorkspaces,
} from "../workspaceHelpers";
import type {
  ProjectOptions,
  ServerViewProps,
  SidePanelView,
  MainView,
} from "../../types";
import {
  ChevronDownIcon,
  CalendarIcon,
  ThreadsIcon,
  LogoutIcon,
  ManageRolesIcon,
  CogIcon,
  InvitePeopleIcon,
} from "../Icons";
import styles from "./ServerView.module.css";
import MemberDetails from "./MemberDetails";
import { useMembers } from "../../features/members/useMembers";
import { useRoles } from "../../features/servers/useRoles";
import { useServer } from "../../features/servers/useServers";
import { useProject } from "../../features/servers/useProject";
import type {
  Channel,
  Member,
  ProjectBase,
  ProjectMember,
} from "../../features/servers/serverTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { setConversations } from "../../features/messages/conversationSlice";
import type { Conversation } from "../../features/messages/conversationTypes";
import { useConversation } from "../../features/messages/useConversation";
import {
  getServerConversations,
  getConversationByChannelId,
} from "../../features/messages/messageService";
import {
  useChannelMutations,
  useServerTextChannels,
  useServerVoiceChannels,
} from "../../features/servers/useChannels";
import { selectProjectMembersByProjectId } from "../../features/servers/projectMemberSlice";
import { useVoiceChannel } from "../../features/voice/useVoiceChannel";
import { useServerPresence } from "../../features/voice/useServerPresence";
import type { Task } from "../tools/kanban/TaskCard";

const ServerView: React.FC<ServerViewProps> = ({
  currentUser,
  isActivitySidebarVisible,
  server,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations,
  );
  const channels = useSelector((state: RootState) => state.servers.channels);
  const { updateConversationMessages, addMessageToConversation } =
    useConversation(currentUser);
  const {
    getServerById,
    updateServer,
    deleteServer,
    isLoadingServers,
    serversError,
  } = useServer();
  const { roles: serverRoles } = useRoles(server.id);

  const {
    channelId: currentVoiceChannelId,
    joinChannel,
    leaveChannel,
  } = useVoiceChannel();

  useServerPresence(server.id);

  const {
    getMembersByServerId,
    getMembersForServerFromState,
    getMemberForServerByUserIdFromState,
  } = useMembers();
  const { createProject, getProjectsByServerId, deleteProject, updateProject } =
    useProject();
  const { createNewChannel, removeChannel, updateExistingChannel } =
    useChannelMutations();
  const [activeView, setActiveView] = useState<SidePanelView>("server-members");
  const [mainView, setMainView] = useState<MainView>("text");
  const [activeChannelId, setActiveChannelId] = useState<number>(1);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set(),
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] =
    useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isServerOptionsOpen, setIsServerOptionsOpen] = useState(false);
  const [isInvitePeopleModalOpen, setIsInvitePeopleModalOpen] = useState(false);
  const [isServerSettingsModalOpen, setIsServerSettingsModalOpen] =
    useState(false);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
  const [isChannelOptionsModalOpen, setIsChannelOptionsModalOpen] = useState<
    number | null
  >(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberDetailsOpen, setIsMemberDetailsOpen] = useState(false);
  const [isVoiceChannelConfirmModalOpen, setIsVoiceChannelConfirmModalOpen] =
    useState(false);
  const [pendingVoiceChannelChange, setPendingVoiceChannelChange] = useState<{
    channelId: number;
    projectId: number | null;
  } | null>(null);
  const serverMembers = useMemo(
    () => getMembersForServerFromState(server.id),
    [getMembersForServerFromState, server.id],
  );
  const currentMember = useMemo(
    () => getMemberForServerByUserIdFromState(server.id, currentUser.id),
    [getMemberForServerByUserIdFromState, server.id, currentUser.id],
  );
  const memberRole = currentMember
    ? serverRoles.find((r) => r.id === currentMember.roleId)
    : undefined;
  const projects = getProjectsByServerId(server.id);

  // Queries optimizadas
  const serverTextChannels = useServerTextChannels(server.id);
  const serverVoiceChannels = useServerVoiceChannels(server.id);

  // Nueva función memoizada para obtener channel por ID (sin hooks internos)
  const getChannel = useCallback(
    (id: number | null | undefined): Channel | undefined =>
      id != null ? channels[id] : undefined,
    [channels],
  );

  const emptyProjectMembers: ProjectMember[] = [];

  const projectMembers = useSelector((state: RootState) =>
    selectedProjectId
      ? selectProjectMembersByProjectId(state, selectedProjectId)
      : emptyProjectMembers,
  );

  useEffect(() => {
    initializeWorkspaces(projects);
  }, [projects]);
  useEffect(() => {
    const loadServerConversations = async () => {
      try {
        const dtos = await getServerConversations(server.id);
        const newConvs: Conversation[] = [];
        dtos.forEach((dto) => {
          if (conversations.find((c) => c.id === dto.id)) return;
          const channel = getChannel(dto.channelId!);
          if (!channel) return;
          newConvs.push({
            id: dto.id,
            channelId: dto.channelId,
            contactId: null,
            name: channel.name,
            avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(
              Math.random() * 70,
            )}`,
            type: "channel",
            participants: [],
            messages: [],
            initialized: true,
          });
        });
        const existingChannelIds = dtos.map((d) => d.channelId);
        const missingChannels = serverTextChannels.filter(
          (ch) => !existingChannelIds.includes(ch.id),
        );
        const missingConvs: Conversation[] = [];
        for (const ch of missingChannels) {
          const dto = await getConversationByChannelId(ch.id);
          missingConvs.push({
            id: dto.id,
            channelId: dto.channelId,
            contactId: null,
            name: ch.name,
            avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(
              Math.random() * 70,
            )}`,
            type: "channel",
            participants: [],
            messages: [],
            initialized: true,
          });
        }
        if (newConvs.length > 0 || missingConvs.length > 0) {
          dispatch(
            setConversations([...conversations, ...newConvs, ...missingConvs]),
          );
        }
      } catch (err) {
        console.error("Error loading server conversations:", err);
      }
    };
    loadServerConversations();
  }, [server.id, serverTextChannels, conversations, dispatch, getChannel]);
  useEffect(() => {
    getMembersByServerId(server.id);
    getServerById(server.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);
  const getRegularTextChannels = useCallback((): Channel[] => {
    return serverTextChannels.filter((ch) => ch.projectId === null);
  }, [serverTextChannels]);
  const getRegularVoiceChannels = useCallback((): Channel[] => {
    return serverVoiceChannels.filter((ch) => ch.projectId === null);
  }, [serverVoiceChannels]);

  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };
  const handleChannelSelect = (channelId: number) => {
    setActiveChannelId(channelId);
    setMainView("text");
    setSelectedProjectId(null);
    setIsChannelOptionsModalOpen(null);
  };
  const handleVoiceChannelSelect = (
    channelId: number,
    projectId: number | null = null,
  ) => {
    if (currentVoiceChannelId === channelId) return;
    if (currentVoiceChannelId !== null) {
      const currentChannel = getChannel(currentVoiceChannelId);
      const newChannel = getChannel(channelId);
      if (currentChannel && newChannel) {
        setPendingVoiceChannelChange({ channelId, projectId });
        setIsVoiceChannelConfirmModalOpen(true);
        return;
      }
    }
    proceedWithVoiceChannelChange(channelId, projectId);
  };

  const proceedWithVoiceChannelChange = (
    channelId: number,
    projectId: number | null = null,
  ) => {
    setSelectedProjectId(projectId);
    setIsChannelOptionsModalOpen(null);
    if (projectId) {
      setExpandedProjects((prev) => {
        const newSet = new Set(prev);
        newSet.add(projectId);
        return newSet;
      });
    }
    joinChannel(channelId, server.id);
  };
  const confirmVoiceChannelChange = () => {
    if (pendingVoiceChannelChange) {
      proceedWithVoiceChannelChange(
        pendingVoiceChannelChange.channelId,
        pendingVoiceChannelChange.projectId,
      );
      setIsVoiceChannelConfirmModalOpen(false);
      setPendingVoiceChannelChange(null);
    }
  };
  const cancelVoiceChannelChange = () => {
    setIsVoiceChannelConfirmModalOpen(false);
    setPendingVoiceChannelChange(null);
  };
  const handleOptionClick = (view: MainView, projectId?: number) => {
    if (view === "events" || view === "threads") {
      setIsComingSoonModalOpen(true);
    } else {
      setMainView(view);
      setSelectedProjectId(projectId || null);
      setIsChannelOptionsModalOpen(null);
    }
  };
  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
    setIsChannelOptionsModalOpen(null);
  };
  // ==================== CREACIÓN DE PROYECTO ====================
  const handleCreateProject = async (name: string, options: ProjectOptions) => {
    if (memberRole?.manageProjects) {
      try {
        const project = await createProject(server.id, {
          name,
          hasKanban: options.kanban,
          hasNotes: options.smartNotes,
        });
        const projectId = project.id;
        if (options.smartNotes) {
          saveSmartNotesWorkspace(project);
        }
        // ---------- Default Text Channel ---------
        if (project.textChannelId) {
          const channel = getChannel(project.textChannelId);
          if (channel) {
            const dto = await getConversationByChannelId(channel.id);
            dispatch(
              setConversations([
                ...conversations,
                {
                  id: dto.id,
                  channelId: channel.id,
                  contactId: null,
                  name: channel.name,
                  avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(
                    Math.random() * 70,
                  )}`,
                  type: "channel",
                  participants: [],
                  messages: [],
                  initialized: true,
                },
              ]),
            );
          }
        }
        setExpandedProjects((prev) => new Set(prev).add(projectId));
      } catch (err) {
        console.error("Error creating project:", err);
      } finally {
        setIsCreateProjectModalOpen(false);
      }
    }
  };
  // ==================== CREACIÓN DE CANAL ====================
  const handleCreateChannel = async (name: string, type: "TEXT" | "VOICE") => {
    if (memberRole?.manageChannels) {
      try {
        const channel = await createNewChannel({
          serverId: server.id,
          name: name,
          type: type,
        });
        if (type === "TEXT") {
          const dto = await getConversationByChannelId(channel.id);
          dispatch(
            setConversations([
              ...conversations,
              {
                id: dto.id,
                channelId: channel.id,
                contactId: null,
                name: channel.name,
                avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(
                  Math.random() * 70,
                )}`,
                type: "channel",
                participants: [],
                messages: [],
                initialized: true,
              },
            ]),
          );
        }
      } catch (err) {
        console.error("Error creating channel:", err);
      } finally {
        setIsCreateChannelModalOpen(false);
        setIsChannelOptionsModalOpen(null);
      }
    }
  };
  const openCreateChannelModal = () => {
    setIsCreateChannelModalOpen(true);
    setIsChannelOptionsModalOpen(null);
  };
  const handleServerOptionsClick = () => {
    setIsServerOptionsOpen(!isServerOptionsOpen);
    setIsChannelOptionsModalOpen(null);
  };
  const handleSaveServerSettings = (settings: {
    id: number;
    name: string;
    avatarUrl: string;
    bannerUrl: string;
    description: string;
    privacy: string;
  }) => {
    const updatedServer = {
      id: server.id,
      name: settings.name,
      avatarUrl: settings.avatarUrl,
      bannerUrl: settings.bannerUrl,
      description: settings.description,
      privacy: settings.privacy,
    };
    updateServer(updatedServer);
    setIsServerSettingsModalOpen(false);
  };
  const handleDeleteServer = () => {
    deleteServer(server.id);
    console.log(server.id);
    setIsServerSettingsModalOpen(false);
  };
  const toggleChannelOptions = (channelId: number) => {
    setIsChannelOptionsModalOpen((prev) =>
      prev === channelId ? null : channelId,
    );
  };
  const handleUpdateChannel = async (channelId: number, name: string) => {
    if (memberRole?.manageChannels) {
      const channel = getChannel(channelId);
      if (channel) {
        try {
          await updateExistingChannel(channelId, { ...channel, name });
        } catch (err) {
          console.error("Error updating channel:", err);
        }
      }
    }
    setIsChannelOptionsModalOpen(null);
  };
  // ==================== ELIMINACIÓN DE CANAL ====================
  const handleChannelDelete = async (channelId: number) => {
    if (memberRole?.manageChannels) {
      setIsChannelOptionsModalOpen(null);
      try {
        await removeChannel(channelId);
        // Remove related conversation
        const conv = conversations.find((c) => c.channelId === channelId);
        if (conv) {
          dispatch(
            setConversations(
              conversations.filter((c) => c.channelId !== channelId),
            ),
          );
        }
      } catch (err) {
        console.error("Error removing channel:", err);
      }
    }
  };
  const handleUpdateProject = async (projectId: number, name: string) => {
    if (memberRole?.manageProjects) {
      try {
        await updateProject(projectId, { name });
      } catch (err) {
        console.error("Error updating project:", err);
      }
    }
  };
  // ==================== ELIMINACIÓN DE PROYECTO ====================
  const handleProjectDelete = (projectId: number) => {
    const project = getProjectByIdLocal(projectId);
    if (
      !project ||
      project.ownerId !== currentUser.id ||
      !memberRole?.manageProjects
    )
      return;
    deleteProject(projectId);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setMainView("text");
    }
    if (
      currentVoiceChannelId &&
      serverVoiceChannels.find(
        (ch) => ch.id === currentVoiceChannelId && ch.projectId === projectId,
      )
    ) {
      leaveChannel();
    }
    if (
      activeChannelId &&
      serverTextChannels.find(
        (ch) => ch.id === activeChannelId && ch.projectId === projectId,
      )
    ) {
      const firstChannel = getRegularTextChannels()[0];
      setActiveChannelId(firstChannel?.id || 0);
    }
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      newSet.delete(projectId);
      return newSet;
    });
    // Remove related conversations
    const projectChannels = serverTextChannels.filter(
      (ch) => ch.projectId === projectId,
    );
    projectChannels.forEach((ch) => {
      dispatch(
        setConversations(conversations.filter((c) => c.channelId !== ch.id)),
      );
    });
  };
  const handleOpenMemberDetails = (member: Member) => {
    setSelectedMember(member);
    setIsMemberDetailsOpen(true);
  };
  const activeConversation = conversations.find(
    (c) => c.channelId === activeChannelId,
  );
  useEffect(() => {
    setMainView("text");
    setSelectedProjectId(null);
    const firstChannel = getRegularTextChannels()[0];
    setActiveChannelId(firstChannel?.id || 0);
    setExpandedProjects(new Set());
  }, [server.id, getRegularTextChannels]);
  useEffect(() => {
    if (mainView === "project-members" && selectedProjectId) {
      const isMember = projectMembers.some(
        (pm) => pm.userId === currentUser.id,
      );
      if (!isMember) {
        setMainView("text");
        setSelectedProjectId(null);
        const firstChannel = getRegularTextChannels()[0];
        if (firstChannel) {
          setActiveChannelId(firstChannel.id);
          handleChannelSelect(firstChannel.id);
        }
      }
    }
  }, [
    mainView,
    selectedProjectId,
    projectMembers,
    currentUser.id,
    getRegularTextChannels,
  ]);

  // Funciones locales para channels
  const getProjectByIdLocal = useCallback(
    (id: number): ProjectBase | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects],
  );

  return (
    <div className={styles.serverView}>
      <div className={styles.principalContainer}>
        <div className={styles.sidebarChannels}>
          <div
            className={styles.serverHeader}
            onClick={handleServerOptionsClick}
          >
            <div className={styles.serverName}>{server.name}</div>
            <ChevronDownIcon
              className={`${styles.displayServerOptions} ${
                isServerOptionsOpen ? styles.expanded : ""
              }`}
            />
          </div>
          <div className={styles.contentWrapper}>
            {isServerOptionsOpen && (
              <div className={styles.serverOptionsSection}>
                <button
                  className={styles.serverOptionsSectionOption}
                  onClick={() => setIsInvitePeopleModalOpen(true)}
                >
                  <InvitePeopleIcon
                    className={styles.serverOptionsSectionOptionIcon}
                  />
                  Invite People
                </button>
                <button
                  className={styles.serverOptionsSectionOption}
                  onClick={() => setIsServerSettingsModalOpen(true)}
                >
                  <CogIcon className={styles.serverOptionsSectionOptionIcon} />
                  Server Settings
                </button>
                <button
                  className={styles.serverOptionsSectionOption}
                  onClick={() => setIsManageRolesModalOpen(true)}
                >
                  <ManageRolesIcon
                    className={styles.serverOptionsSectionOptionIcon}
                  />
                  Manage Roles
                </button>
                <button
                  className={`${styles.serverOptionsSectionOption} ${styles.serverOptionsSectionOptionDanger}`}
                >
                  <LogoutIcon
                    className={styles.serverOptionsSectionOptionIcon}
                  />
                  Leave Server
                </button>
              </div>
            )}
            <div className={styles.serverOptions}>
              <div
                className={`${styles.optionItem} ${
                  mainView === "events" && !selectedProjectId
                    ? styles.active
                    : ""
                } ${styles.disabled}`}
                onClick={() => handleOptionClick("events")}
              >
                <CalendarIcon />
                <span>Events</span>
              </div>
              <div
                className={`${styles.optionItem} ${
                  mainView === "threads" && !selectedProjectId
                    ? styles.active
                    : ""
                } ${styles.disabled}`}
                onClick={() => handleOptionClick("threads")}
              >
                <ThreadsIcon />
                <span>Threads</span>
              </div>
            </div>
            {(memberRole?.manageProjects ||
              (!memberRole?.manageChannels && projects.length > 0)) && (
              <ProjectSection
                projects={projects}
                currentMember={currentMember}
                currentUserId={currentUser.id}
                serverId={server.id}
                expandedProjects={expandedProjects}
                activeChannelId={activeChannelId}
                currentChannelId={currentVoiceChannelId}
                canManageProjects={memberRole?.manageProjects || false}
                mainView={mainView}
                selectedProjectId={selectedProjectId}
                getChannelById={getChannel}
                toggleProject={toggleProject}
                handleOptionClick={handleOptionClick}
                handleChannelSelect={handleChannelSelect}
                handleVoiceChannelSelect={handleVoiceChannelSelect}
                toggleChannelOptions={toggleChannelOptions}
                handleUpdateProject={handleUpdateProject}
                handleProjectDelete={handleProjectDelete}
                onAddProject={() => setIsCreateProjectModalOpen(true)}
              />
            )}
            <ChannelSection
              title="TEXT CHANNELS"
              channels={getRegularTextChannels()}
              currentUserId={currentUser.id}
              serverId={server.id}
              isVoice={false}
              activeChannelId={activeChannelId}
              canManageChannels={memberRole?.manageChannels || false}
              mainView={mainView}
              onChannelSelect={handleChannelSelect}
              onVoiceChannelSelect={handleVoiceChannelSelect}
              onToggleOptions={toggleChannelOptions}
              onAddChannel={openCreateChannelModal}
            />
            <ChannelSection
              title="VOICE CHANNELS"
              channels={getRegularVoiceChannels()}
              currentUserId={currentUser.id}
              serverId={server.id}
              isVoice={true}
              activeChannelId={activeChannelId}
              currentChannelId={currentVoiceChannelId}
              canManageChannels={memberRole?.manageChannels || false}
              mainView={mainView}
              onChannelSelect={handleChannelSelect}
              onVoiceChannelSelect={handleVoiceChannelSelect}
              onToggleOptions={toggleChannelOptions}
              onAddChannel={openCreateChannelModal}
            />
          </div>
        </div>
        {mainView === "project-members" && selectedProjectId ? (
          <ProjectMembersView
            projectName={projects.find((p) => p.id === selectedProjectId)?.name}
            projectId={selectedProjectId}
            currentUser={currentUser}
            serverMembers={serverMembers}
          />
        ) : mainView === "threads" ? (
          <div className={styles.threadsView}>
            <h1>Threads</h1>
          </div>
        ) : (
          activeConversation && (
            <TextChannel
              conversationData={activeConversation}
              currentUser={currentUser}
              members={serverMembers}
              updateConversationMessages={updateConversationMessages}
              addMessageToConversation={addMessageToConversation}
            />
          )
        )}
      </div>
      <SidebarActivity
        members={serverMembers}
        activeView={activeView}
        setActiveView={setActiveView}
        tasks={[
          { id: 3, kanbanId: 1, title: "Documentación inicial", description: "README.md", columnId: 101, assigneeId: 2, status: "TODO" },
          { id: 9, kanbanId: 1, title: "Fix formulario", description: "Validaciones", columnId: 103, assigneeId: 2, status: "REVIEW" },
          { id: 1, kanbanId: 1, title: "Diseñar landing page", description: "Crear diseño responsive", columnId: 101, assigneeId: 2, status: "TODO" },
          { id: 7, kanbanId: 1, title: "Refactor dashboard", description: "Mejorar estructura", columnId: 103, assigneeId: 2, status: "REVIEW" },
          { id: 12, kanbanId: 1, title: "CI/CD setup", description: "GitHub Actions", columnId: 104, assigneeId: 2, status: "DONE" },
          { id: 5, kanbanId: 1, title: "Componentes UI", description: "Botones y modales", columnId: 102, assigneeId: 2, status: "IN_PROGRESS" },
          { id: 2, kanbanId: 1, title: "Configurar entorno dev", description: "Node.js y Docker", columnId: 101, assigneeId: 2, status: "TODO" },
          { id: 4, kanbanId: 1, title: "Implementar JWT", description: "Login y registro", columnId: 102, assigneeId: 2, status: "IN_PROGRESS" },
          { id: 8, kanbanId: 1, title: "Optimizar queries", description: "Índices en DB", columnId: 103, assigneeId: 2, status: "REVIEW" },
          { id: 6, kanbanId: 1, title: "API usuarios", description: "Redux services", columnId: 102, assigneeId: 2, status: "IN_PROGRESS" }
          ]
        }
        isVisible={isActivitySidebarVisible}
        onOpenTaskModal={handleOpenTaskModal}
        onOpenMemberDetails={handleOpenMemberDetails}
      />
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
      <IsComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />
      <InvitePeopleModal
        currentUser={currentUser}
        serverId={server.id}
        isOpen={isInvitePeopleModalOpen}
        onClose={() => setIsInvitePeopleModalOpen(false)}
      />
      <ServerSettingsModal
        isOpen={isServerSettingsModalOpen}
        onClose={() => setIsServerSettingsModalOpen(false)}
        onSave={handleSaveServerSettings}
        onDelete={handleDeleteServer}
        server={server}
        isLoading={isLoadingServers}
        error={serversError}
      />
      <ManageRolesModal
        isOpen={isManageRolesModalOpen}
        onClose={() => setIsManageRolesModalOpen(false)}
        roles={serverRoles}
      />
      <ChannelSettingsModal
        isOpen={!!isChannelOptionsModalOpen}
        onClose={() => setIsChannelOptionsModalOpen(null)}
        onSave={handleUpdateChannel}
        onDelete={handleChannelDelete}
        channel={getChannel(isChannelOptionsModalOpen) || null}
        canManageChannels={memberRole?.manageChannels || false}
      />
      {isTaskModalOpen && selectedTask && (
        <TaskDetails
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
      {isMemberDetailsOpen && selectedMember && (
        <MemberDetails
          currentUser={currentMember}
          member={selectedMember}
          isOpen={isMemberDetailsOpen}
          onClose={() => setIsMemberDetailsOpen(false)}
          roles={serverRoles}
        />
      )}
      <VoiceChannelConfirmModal
        isOpen={isVoiceChannelConfirmModalOpen}
        onClose={cancelVoiceChannelChange}
        onConfirm={confirmVoiceChannelChange}
        currentChannelName={
          currentVoiceChannelId
            ? getChannel(currentVoiceChannelId)?.name || ""
            : ""
        }
        newChannelName={
          pendingVoiceChannelChange
            ? getChannel(pendingVoiceChannelChange.channelId)?.name || ""
            : ""
        }
      />
    </div>
  );
};
export default React.memo(ServerView);
