import { BoltIcon, KanbanIcon, UsersIcon } from "../Icons";
import ActiveMemberItem from "./ActiveMemberItem";
import TaskCard, { type Task } from "../tools/kanban/TaskCard";
import MemberItem from "./MemberItem";
import styles from "./SidebarActivity.module.css";

import React from "react";
import type { Member } from "../../features/servers/serverTypes";

interface SidebarActivityProps {
  members: Member[];
  activeView: "active-members" | "tasks" | "server-members";
  setActiveView: (view: "active-members" | "tasks" | "server-members") => void;
  tasks: Task[];
  isVisible: boolean;
  showServerMembers?: boolean;
  onOpenTaskModal?: (task: Task) => void;
  onOpenMemberDetails?: (member: Member) => void;
}

const SidebarActivity: React.FC<SidebarActivityProps> = ({
  members,
  activeView,
  setActiveView,
  tasks,
  isVisible,
  showServerMembers = true,
  onOpenTaskModal,
  onOpenMemberDetails,
}) => {
  const renderView = () => {
    switch (activeView) {
      case "active-members":
        return (
          <div className={styles.activityFeed}>
            <h1>Activity</h1>
            <div className={styles.activeNowList}>
              {members.length > 0 ? (
                members.map((member) => (
                  <ActiveMemberItem key={member.userId} member={member} />
                ))
              ) : (
                <p className={styles.emptyMessage}>No hay actividad reciente</p>
              )}
            </div>
          </div>
        );
      case "tasks": {
        const userTasks = tasks.filter((t) => t.assigneeId ===2);
        return (
          <div className={styles.pendingTasks}>
            <h1>My Tasks ({userTasks.length})</h1>
            {userTasks.length > 0 ? (
              userTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={{
                    ...task,
                    description: task.description ,
                  }}
                  onClick={() => onOpenTaskModal?.(task)}
                  onDragStart={() => {}}
                  openModal={true}
                  onOpenTaskModal={() => onOpenTaskModal?.(task)}
                />
              ))
            ) : (
              <p className={styles.emptyMessage}>No tienes tareas asignadas</p>
            )}
          </div>
        );
      }
      case "server-members": {
        const onlineMembers = members.filter(
          (member) => member.status === "ONLINE"
        );
        const offlineMembers = members.filter(
          (member) => member.status === "OFFLINE"
        );

        return (
          <div className={styles.serverMembers}>
            <h1>Online ({onlineMembers.length})</h1>
            <div className={styles.membersList}>
              {onlineMembers.length > 0 ? (
                onlineMembers.map((member) => (
                  <MemberItem
                    key={member.userId}
                    member={member}
                    onClick={() => onOpenMemberDetails?.(member)}
                  />
                ))
              ) : (
                <p className={styles.emptyMessage}>
                  No hay miembros conectados
                </p>
              )}
            </div>

            {offlineMembers.length > 0 && (
              <>
                <h1>Offline ({offlineMembers.length})</h1>
                <div className={styles.membersList}>
                  {offlineMembers.map((member) => (
                    <MemberItem
                      key={member.userId}
                      member={member}
                      onClick={() => onOpenMemberDetails?.(member)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.sidebarActivity}>
      <div className={styles.viewSelector}>
        <button
          className={`${styles.viewButton} ${
            activeView === "active-members" ? styles.active : ""
          }`}
          onClick={() => setActiveView("active-members")}
        >
          <BoltIcon />
        </button>
        <button
          className={`${styles.viewButton} ${
            activeView === "tasks" ? styles.active : ""
          }`}
          onClick={() => setActiveView("tasks")}
        >
          <KanbanIcon />
        </button>
        {showServerMembers && (
          <button
            className={`${styles.viewButton} ${
              activeView === "server-members" ? styles.active : ""
            }`}
            onClick={() => setActiveView("server-members")}
          >
            <UsersIcon />
          </button>
        )}
      </div>
      <div className={styles.contentWrapper}>{renderView()}</div>
    </div>
  );
};

export default React.memo(SidebarActivity);
