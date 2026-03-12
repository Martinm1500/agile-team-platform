import React from "react";
import styles from "./NotificationsModal.module.css";
import { useNotifications } from "../features/notifications/useNotifications";
import { useContacts } from "../features/contacts/useContacts";
import { useServer } from "../features/servers/useServers";
import { useProjectMemberMutations } from "../features/servers/useProjectMembers";
import type { Notification, User } from "../types";
import { CloseIcon } from "./Icons";
interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}
const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { acceptContact, rejectContact, loadContacts } = useContacts(
    currentUser.id,
  );
  const {
    acceptServerInvitation,
    rejectServerInvitation,
    acceptJoinRequest,
    rejectJoinRequest,
    getServers,
    getServerById,
  } = useServer();
  const { acceptProjectInvitationAction, rejectProjectInvitationAction } =
    useProjectMemberMutations();

  if (!isOpen) return null;
  const unreadCount = notifications.length;
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
  };
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Notificaciones</h3>
          {unreadCount > 0 && (
            <button className={styles.markAllReadBtn} onClick={markAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.notificationsList}>
          {notifications.length === 0 ? (
            <div className={styles.emptyNotifications}>
              No hay notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${
                  notification.isRead ? styles.read : ""
                }`}
                onClick={
                  notification.type !== "CONTACT_INVITATION" &&
                  notification.type !== "SERVER_INVITATION" &&
                  notification.type !== "PROJECT_INVITATION" &&
                  notification.type !== "REQUEST_TO_JOIN"
                    ? () => handleNotificationClick(notification)
                    : undefined
                }
              >
                <div
                  className={`${styles.notificationIcon} ${styles.info}`}
                ></div>
                <div className={styles.notificationContent}>
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  {notification.type === "CONTACT_INVITATION" && (
                    <div className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await acceptContact(notification.relatedId!);
                          await loadContacts();
                          markAsRead(notification.id);
                        }}
                      >
                        Aceptar
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await rejectContact(notification.relatedId!);
                          markAsRead(notification.id);
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  {notification.type === "SERVER_INVITATION" && (
                    <div className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await acceptServerInvitation(
                            notification.relatedServerId!,
                            notification.relatedId!,
                          );
                          markAsRead(notification.id);
                          getServers();
                        }}
                      >
                        Aceptar
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await rejectServerInvitation(
                            notification.relatedServerId!,
                            notification.relatedId!,
                          );
                          markAsRead(notification.id);
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  {notification.type === "PROJECT_INVITATION" && (
                    <div className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await acceptProjectInvitationAction(
                            notification.relatedProjectId!,
                            notification.relatedId!,
                          );
                          getServerById(notification.relatedServerId!);
                          markAsRead(notification.id);
                        }}
                      >
                        Aceptar
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await rejectProjectInvitationAction(
                            notification.relatedProjectId!,
                            notification.relatedId!,
                          );
                          markAsRead(notification.id);
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  {notification.type === "REQUEST_TO_JOIN" && (
                    <div className={styles.actions}>
                      <button
                        className={styles.acceptBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await acceptJoinRequest(
                            notification.relatedServerId!,
                            notification.relatedId!,
                          );
                          markAsRead(notification.id);
                        }}
                      >
                        Aceptar
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await rejectJoinRequest(
                            notification.relatedServerId!,
                            notification.relatedId!,
                          );
                          markAsRead(notification.id);
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsModal;
