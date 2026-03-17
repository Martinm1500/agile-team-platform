import React, { useState, useRef, useEffect } from "react";
import styles from "./UserControls.module.css";
import { BellIcon, ChevronDownIcon } from "./Icons";
import UserModal from "./UserModal";
import NotificationsModal from "./NotificationsModal";
import { useUsers } from "../features/users/useUsers";
import { useNotifications } from "../features/notifications/useNotifications";
import type { User } from "../types";

interface UserControlsProps {
  onLogout: () => void;
  currentUser: User;
}

const UserControls: React.FC<UserControlsProps> = ({
  onLogout,
  currentUser,
}) => {
  const { profile, getProfile } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, loadNotifications } = useNotifications();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfile();
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleDeleteAcount = () => {
    console.log("Delete acount");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const getStatusClass = () => {
    switch (profile?.status) {
      case "ONLINE":
        return styles.online;
      case "IDLE":
        return styles.idle;
      case "DND":
        return styles.dnd;
      case "OFFLINE":
        return styles.offline;
      default:
        return styles.online;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.avatarBellContainer}>
        <div className={styles.avatar} onClick={toggleModal}>
          <img
            src={profile?.avatarUrl}
            alt="User avatar"
            className={styles.avatarImage}
          />
          <span
            className={`${styles.statusIndicator} ${getStatusClass()}`}
          ></span>
        </div>
        <span className={styles.userName} onClick={toggleModal}>
          {profile?.displayname}
        </span>
        <button
          className={styles.dropdownBtn}
          onClick={toggleModal}
          aria-label="Dropdown menu"
        >
          <ChevronDownIcon />
          <span className={styles.srOnly}>Dropdown menu</span>
        </button>
        <div className={styles.notificationsWrapper}>
          <button
            className={styles.bellBtn}
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
            <span className={styles.srOnly}>Notifications</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <UserModal
          ref={modalRef}
          onClose={() => setIsModalOpen(false)}
          onLogout={onLogout}
          onDeleteAccount={handleDeleteAcount}
        />
      )}

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default UserControls;
