import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import ConversationChannel from "./ConversationChannel";
import ContactsView from "./ContactsView";
import CalendarView from "./CalendarView";
import ShortcutItem from "./ShortcutItem";
import type { Task, Contact } from "../../types/index";
import { UsersIcon2, CalendarIcon } from "../Icons";
import styles from "./Home.module.css";
import SidebarActivity from "../Server/SidebarActivity";
import TaskDetails from "../tools/kanban/TaskDetails";
import { useConversation } from "../../features/messages/useConversation";
import type { Member } from "../../features/servers/serverTypes";
import {
  setConversations,
  setSelectedConversationId,
} from "../../features/messages/conversationSlice";
import { useContacts } from "../../features/contacts/useContacts";
import type {
  Conversation,
  Shortcut,
  User,
} from "../../features/messages/conversationTypes";
interface HomeProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  isActivitySidebarVisible: boolean;
}
const Home: React.FC<HomeProps> = ({
  currentUser,
  isOpen,
  isActivitySidebarVisible,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    conversations,
    visibleShortcuts,
    hideConversation,
    showConversation,
    getOrCreateConversation,
    getShortcutFromConversation,
  } = useConversation(currentUser);
  const { findContactByUserId } = useContacts(currentUser.id);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [activeView, setActiveView] = useState<"active-members" | "tasks">(
    "active-members"
  );
  const [sidebarView, setSidebarView] = useState<
    "friends" | "conversation" | "calendar"
  >("friends");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const teamMembers: Member[] = [];
  const tasks: Task[] = [];
  const handleOpenTaskModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);
  const handleHideConversation = useCallback(
    (conversationId: number) => {
      hideConversation(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        dispatch(setSelectedConversationId(null));
        setSidebarView("friends");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hideConversation, selectedConversation]
  );
  const orderedShortcuts = visibleShortcuts;
  const renderRecentConversations = () => (
    <div className={styles.recentConversations}>
      <div className={styles.directMessagesHeader}>
        <h3 className={styles.sectionTitle}>Messages</h3>
      </div>

      <div className={styles.recentConversationsContent}>
        {orderedShortcuts.length > 0 ? (
          orderedShortcuts.map((shortcut) => (
            <ShortcutItem
              key={shortcut.id}
              shortcut={shortcut}
              onClick={() => handleConversationSelect(shortcut)}
              onHide={handleHideConversation}
              isSelected={selectedConversation?.id === shortcut.id}
            />
          ))
        ) : (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.conversationSkeleton}>
                <div className={styles.conversationAvatarSkeleton}></div>
                <div className={styles.conversationInfoSkeleton}>
                  <div className={styles.conversationNameSkeleton}></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
  const handleContactSelect = useCallback(
    async (contact: Contact) => {
      if (!contact || contact.status !== "ACCEPTED") {
        setSelectedConversation(null);
        dispatch(setSelectedConversationId(null));
        setSidebarView("friends");
        return;
      }
      try {
        const conversation = await getOrCreateConversation(contact);
        const shortcut = getShortcutFromConversation(conversation);
        showConversation(shortcut);
        setSelectedConversation(conversation);
        dispatch(setSelectedConversationId(conversation.id));
        setSidebarView("conversation");
      } catch (error) {
        console.error("Error selecting contact:", error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getOrCreateConversation, showConversation, getShortcutFromConversation]
  );
  const handleConversationSelect = useCallback(
    async (param: Conversation | Shortcut) => {
      let conv: Conversation | undefined;
      let shortcut: Shortcut;
      if ("otherUserId" in param) {
        shortcut = param;
        conv = conversations.find((c) => c.id === param.id);
        if (!conv) {
          try {
            const contact = await findContactByUserId(param.otherUserId);
            conv = await getOrCreateConversation(contact);
            dispatch(setConversations([...conversations, conv]));
          } catch (error) {
            console.error("Error creating conversation from shortcut:", error);
            return;
          }
        }
      } else {
        conv = param;
        shortcut = getShortcutFromConversation(conv);
      }
      showConversation(shortcut);
      setSelectedConversation(conv);
      dispatch(setSelectedConversationId(conv.id));
      setSidebarView("conversation");
    },
    [
      showConversation,
      conversations,
      findContactByUserId,
      getOrCreateConversation,
      dispatch,
      getShortcutFromConversation,
    ]
  );
  const handleShowFriends = useCallback(() => {
    setSidebarView("friends");
    setSelectedConversation(null);
    dispatch(setSelectedConversationId(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleShowCalendar = useCallback(() => {
    setSidebarView("calendar");
    setSelectedConversation(null);
    dispatch(setSelectedConversationId(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!isOpen) return null;
  return (
    <div className={styles.home}>
      <div className={styles.contactsSection}>
        <div className={styles.sidebarHome}>
          <div className={styles.sidebarHomeHeader}>
            <button className={styles.startSession}>
              <div className={styles.description}>Server home</div>
            </button>
          </div>

          <div className={styles.wrapper}>
            <div className={styles.principalActions}>
              <button
                className={`${styles.showViewFriends} ${
                  sidebarView === "friends" ? styles.active : ""
                }`}
                onClick={handleShowFriends}
              >
                <UsersIcon2 />
                <div className={styles.description}>Contacts</div>
              </button>
              <button
                className={`${styles.showViewCalendar} ${
                  sidebarView === "calendar" ? styles.active : ""
                }`}
                onClick={handleShowCalendar}
              >
                <CalendarIcon />
                <div className={styles.description}>Calendar</div>
              </button>
            </div>
            {renderRecentConversations()}
          </div>
        </div>
        {sidebarView === "friends" ? (
          <ContactsView
            currentUser={currentUser}
            onContactSelect={handleContactSelect}
            hideConversation={hideConversation}
          />
        ) : sidebarView === "conversation" ? (
          selectedConversation && (
            <ConversationChannel
              key={selectedConversation.id}
              conversation={selectedConversation}
              onBack={handleShowFriends}
              currentUser={currentUser}
            />
          )
        ) : (
          <CalendarView />
        )}
      </div>
      <SidebarActivity
        activeView={activeView}
        setActiveView={(view: "active-members" | "tasks" | "server-members") =>
          setActiveView(view as "active-members" | "tasks")
        }
        tasks={tasks}
        members={teamMembers}
        isVisible={isActivitySidebarVisible}
        showServerMembers={false}
        onOpenTaskModal={handleOpenTaskModal}
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
    </div>
  );
};
export default Home;
