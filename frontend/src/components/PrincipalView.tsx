import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import ServerView from "./Server/ServerView";
import CreateServerModal from "./CreateServerModal";
import DiscoverServers from "./DiscoverServers";
import Home from "./Home/Home";
import "./PrincipalView.css";
import VoiceChannel from "./TopNav/VoiceChannel";
import KanbanDashboard from "./tools/kanban/KanbanDashboard";
import type { User } from "../types";
import {
  PlusIcon,
  HouseUserIcon,
  GlobeIcon,
  KanbanIcon,
  SmartNoteIcon,
  MicrophoneIcon,
  MutedMicrophoneIcon,
  HeadphonesIcon,
  DeafenedHeadphonesIcon,
  PhoneIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "./Icons";
import SmartNotesDashboard from "./tools/SmartNotes/SmartNotesDashboard";
import brand1 from "../assets/brand1.png";
import UserControls from "./UserControls";
import { useServer } from "../features/servers/useServers";
import { useUsers } from "../features/users/useUsers";
import { useVoiceChannel } from "../features/voice/useVoiceChannel";

export type ViewType = "home" | "server" | "kanban" | "smartnotes" | "discover";

interface PrincipalViewProps {
  onLogout: () => void;
  currentUser: User;
}

const PrincipalView: React.FC<PrincipalViewProps> = React.memo(
  ({ onLogout, currentUser }) => {
    const {
      channelId,
      isMuted,
      isDeafened,
      leaveChannel,
      setMute,
      toggleDeafen,
    } = useVoiceChannel();

    const { getProfile } = useUsers();
    const { getServers, allServers, createServer } = useServer();

    // ========== ESTADOS ==========
    const [currentView, setCurrentView] = useState<ViewType>("home");
    const [selectedServerId, setSelectedServerId] = useState<number>(1);
    const [showCreateServer, setShowCreateServer] = useState(false);
    const [isActivitySidebarVisible, setIsActivitySidebarVisible] =
      useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCreatingServer, setIsCreatingServer] = useState(false);

    const [isLeavingOptimistic, setIsLeavingOptimistic] = useState(false);

    // ========== REFS PARA CARGA ÚNICA ==========
    const profileLoadedRef = useRef(false);
    const serversLoadedRef = useRef(false);
    const servers = allServers;

    // ========== FUNCIONES MEMOIZADAS ==========
    const tools = useMemo(
      () => [
        { id: "kanban", icon: <KanbanIcon /> },
        { id: "smartnotes", icon: <SmartNoteIcon /> },
      ],
      [],
    );

    const confirmLogout = useCallback(() => {
      if (isLoggingOut) return;
      setIsLoggingOut(true);
      setSelectedServerId(1);
      setShowCreateServer(false);
      setIsActivitySidebarVisible(true);
      setShowLogoutConfirm(false);
      onLogout();
    }, [isLoggingOut, onLogout]);

    const cancelLogout = useCallback(() => setShowLogoutConfirm(false), []);
    const initiateLogout = useCallback(() => setShowLogoutConfirm(true), []);
    const handleSelectView = useCallback(
      (view: ViewType) => setCurrentView(view),
      [],
    );

    const handleSelectServer = useCallback((serverId: number) => {
      setSelectedServerId(serverId);
      setCurrentView("server");
    }, []);

    const handleDiscoverClick = useCallback(
      () => setCurrentView("discover"),
      [],
    );

    const handleDisconnect = useCallback(() => {
      if (channelId !== null) {
        setIsLeavingOptimistic(true);
        leaveChannel();
      }
    }, [channelId, leaveChannel]);

    const handleCreateServer = useCallback(
      async (newServer: { name: string }) => {
        if (isCreatingServer) return;
        setIsCreatingServer(true);
        try {
          const serverWithId = await createServer(newServer);
          if (!serverWithId) return;
          setShowCreateServer(false);
          setSelectedServerId(serverWithId.id);
          setCurrentView("server");
        } catch (e) {
          console.error("Failed to create server:", e);
        } finally {
          setIsCreatingServer(false);
        }
      },
      [isCreatingServer, createServer],
    );

    // ========== EFECTOS ==========
    useEffect(() => {
      if (!profileLoadedRef.current) {
        getProfile();
        profileLoadedRef.current = true;
      }
    }, [getProfile]);

    useEffect(() => {
      if (!serversLoadedRef.current) {
        getServers();
        serversLoadedRef.current = true;
      }
    }, [getServers]);

    useEffect(() => {
      if (
        currentView === "server" &&
        !servers.find((s) => s.id === selectedServerId)
      ) {
        setCurrentView("home");
      }
    }, [servers, selectedServerId, currentView]);

    useEffect(() => {
      if (channelId === null) {
        setIsLeavingOptimistic(false);
      }
    }, [channelId]);

    // ========== RENDER ==========
    const activeServerObj = servers.find((s) => s.id === selectedServerId);

    const isInChannel = channelId !== null && !isLeavingOptimistic;

    const shouldMountServerView = currentView === "server" || isInChannel;

    return (
      <div className="app-view">
        <div className="sidebar">
          <div className="brand-logo">
            <img src={brand1} alt="App Logo" />
          </div>

          <button
            className={`home-card ${currentView === "home" ? "active" : ""}`}
            onClick={() => handleSelectView("home")}
          >
            <div className="home-icon">
              <HouseUserIcon />
            </div>
          </button>

          <button
            className={`discover-card ${currentView === "discover" ? "active" : ""}`}
            onClick={handleDiscoverClick}
            aria-label="Discover servers"
          >
            <div className="discover-icon">
              <GlobeIcon />
            </div>
          </button>

          <button
            className="new-server-btn"
            onClick={() => setShowCreateServer(true)}
          >
            <PlusIcon />
          </button>

          <div className="separator"></div>

          <div className="servers">
            {servers.map((server) => (
              <div
                key={server.id}
                className={`server-card ${
                  currentView === "server" && selectedServerId === server.id
                    ? "active"
                    : ""
                }`}
                onClick={() => handleSelectServer(server.id)}
              >
                <div className="image-container">
                  <img
                    src={server.avatarUrl}
                    alt={server.name}
                    className="card-image"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="spacer"></div>

          <div className="voice-controls">
            {isInChannel && (
              <button
                onClick={handleDisconnect}
                title="Desconectar"
                className="phone"
              >
                <PhoneIcon className="icon hangup" />
              </button>
            )}
            <button
              onClick={() => setMute(!isMuted)}
              title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            >
              {isMuted ? (
                <MutedMicrophoneIcon className="icon muted" />
              ) : (
                <MicrophoneIcon className="icon" />
              )}
            </button>
            <button
              onClick={() => toggleDeafen(!isDeafened)}
              title={isDeafened ? "Activar audio" : "Desactivar audio"}
            >
              {isDeafened ? (
                <DeafenedHeadphonesIcon className="icon muted" />
              ) : (
                <HeadphonesIcon className="icon" />
              )}
            </button>
          </div>
        </div>

        <div className="principal-view">
          {!isInChannel && <div className="voice-channel" />}

          {isInChannel && (
            <VoiceChannel
              currentUserId={currentUser.id}
              channelId={channelId}
            />
          )}

          <div className="main-area">

            {currentView === "home" && (
              <Home
                currentUser={currentUser}
                isOpen={true}
                onClose={() => handleSelectServer(selectedServerId)}
                isActivitySidebarVisible={isActivitySidebarVisible}
              />
            )}
            {currentView === "discover" && (
              <DiscoverServers
                onClose={() => handleSelectServer(selectedServerId)}
              />
            )}
            {currentView === "kanban" && (
              <KanbanDashboard currentUser={currentUser} />
            )}
            {currentView === "smartnotes" && <SmartNotesDashboard />}

            {shouldMountServerView && activeServerObj && (
              <div
                style={
                  currentView !== "server"
                    ? { display: "none" }
                    : { display: "contents" }
                }
              >
                <ServerView
                  currentUser={currentUser}
                  isActivitySidebarVisible={isActivitySidebarVisible}
                  server={activeServerObj}
                />
              </div>
            )}

            <div className="sidebar-tools">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`tools-card ${currentView === tool.id ? "active" : ""}`}
                  onClick={() => handleSelectView(tool.id as ViewType)}
                >
                  <div className="tools-icon">{tool.icon}</div>
                </div>
              ))}

              {(currentView === "home" || currentView === "server") && (
                <button
                  className="toggle-sidebar-btn"
                  onClick={() =>
                    setIsActivitySidebarVisible(!isActivitySidebarVisible)
                  }
                >
                  {isActivitySidebarVisible ? (
                    <ChevronDoubleRightIcon />
                  ) : (
                    <ChevronDoubleLeftIcon />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="logout-confirm-modal">
            <div className="logout-confirm-content">
              <h3>Are you sure you want to logout?</h3>
              <div className="logout-confirm-buttons">
                <button onClick={cancelLogout}>Cancel</button>
                <button onClick={confirmLogout} disabled={isLoggingOut}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateServer && (
          <CreateServerModal
            onClose={() => setShowCreateServer(false)}
            onCreateServer={handleCreateServer}
            isCreating={isCreatingServer}
          />
        )}

        <UserControls onLogout={initiateLogout} currentUser={currentUser} />
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.currentUser.id === nextProps.currentUser.id,
);

PrincipalView.displayName = "PrincipalView";

export default PrincipalView;