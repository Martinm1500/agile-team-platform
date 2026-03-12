import { forwardRef, useState, useEffect } from "react";
import styles from "./UserModal.module.css";
import {
  LogoutIcon,
  EditIcon,
  UserIcon,
  CogIcon,
  CheckIcon,
  ShieldIcon,
  TrashIcon,
  CloseIcon,
} from "./Icons";
import { useUsers } from "../features/users/useUsers";

interface UserModalProps {
  onClose: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const statusToLower: { [key: string]: string } = {
  ONLINE: "online",
  IDLE: "idle",
  DND: "dnd",
  OFFLINE: "offline",
};

const lowerToStatus: { [key: string]: string } = {
  online: "ONLINE",
  idle: "IDLE",
  dnd: "DND",
  offline: "OFFLINE",
};

const UserModal = forwardRef<HTMLDivElement, UserModalProps>(
  ({ onClose, onLogout, onDeleteAccount }, ref) => {
    const {
      profile,
      settings,
      getProfile,
      getSettings,
      updateProfile,
      updateSettings,
      updatePassword,
    } = useUsers();
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    console.log(settings);

    useEffect(() => {
      getProfile();
      getSettings();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      setNewDisplayName(profile?.displayname || "");
      setNewUserEmail(profile?.email || "");
    }, [profile]);

    const handleLogout = () => {
      onLogout();
      onClose();
    };

    const handleDeleteAccount = () => {
      onDeleteAccount();
      onClose();
    };

    const handleStatusChange = (status: string) => {
      updateProfile({ status: lowerToStatus[status] });
    };

    const handleNameSave = () => {
      if (newDisplayName.trim() !== "") {
        updateProfile({ displayname: newDisplayName });
      }
      setIsEditingName(false);
    };

    const handleNameCancel = () => {
      setNewDisplayName(profile?.displayname || "");
      setIsEditingName(false);
    };

    const handleEmailSave = () => {
      if (newUserEmail.trim() !== "") {
        updateProfile({ email: newUserEmail });
      }
      setIsEditingEmail(false);
    };

    const handleEmailCancel = () => {
      setNewUserEmail(profile?.email || "");
      setIsEditingEmail(false);
    };

    const handleEmailReset = () => {
      setNewUserEmail(profile?.email || "");
    };

    const validatePassword = () => {
      if (newPassword.length < 8) {
        return "Password must be at least 8 characters long";
      }
      if (newPassword !== confirmPassword) {
        return "Passwords do not match";
      }
      return "";
    };

    const handlePasswordSave = () => {
      const error = validatePassword();
      if (error) {
        setPasswordError(error);
        return;
      }

      updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsEditingPassword(false);
    };

    const handlePasswordCancel = () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsEditingPassword(false);
    };

    const userStatus = statusToLower[profile?.status || "ONLINE"] || "online";

    return (
      <div className={styles.modalOverlay}>
        <div ref={ref} className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>User Settings</h3>
            <button className={styles.closeButton} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.sidebar}>
              <button
                className={`${styles.sidebarItem} ${
                  activeTab === "profile" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <UserIcon />
                <span>Profile</span>
              </button>
              <button
                className={`${styles.sidebarItem} ${
                  activeTab === "account" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("account")}
              >
                <CogIcon />
                <span>Account</span>
              </button>
              <button
                className={`${styles.sidebarItem} ${
                  activeTab === "privacy" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("privacy")}
              >
                <ShieldIcon />
                <span>Privacy & Security</span>
              </button>
            </div>

            <div className={styles.content}>
              {activeTab === "profile" && (
                <div className={styles.tabContent}>
                  <div className={styles.avatarSection}>
                    <div className={styles.avatarContainer}>
                      <div className={styles.bannerPreview}>
                        <div className={styles.bannerDefault}></div>
                      </div>
                      <div className={styles.avatarWrapper}>
                        <div className={styles.avatarPreview}>
                          <img
                            src={
                              profile?.avatarUrl ||
                              "https://randomuser.me/api/portraits/men/32.jpg"
                            }
                            alt="User avatar"
                            className={styles.avatarLarge}
                          />
                          <div className={styles.statusIndicatorContainer}>
                            <div
                              className={`${styles.statusIndicator} ${styles[userStatus]}`}
                            ></div>
                          </div>
                        </div>
                        <div className={styles.userNameContainer}>
                          <h4 className={styles.userName}>
                            {profile?.displayname}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.nameSection}>
                    <h5 className={styles.subsectionTitle}>Display Name</h5>
                    {isEditingName ? (
                      <div className={styles.nameEditContainer}>
                        <input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          className={styles.nameInput}
                          autoFocus
                        />
                        <button
                          className={styles.nameSaveButton}
                          onClick={handleNameSave}
                        >
                          <CheckIcon />
                        </button>
                        <button
                          className={styles.nameCancelButton}
                          onClick={handleNameCancel}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className={styles.nameDisplayContainer}>
                        <span>{profile?.displayname}</span>
                        <button
                          className={styles.nameEditButton}
                          onClick={() => setIsEditingName(true)}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.statusSection}>
                    <h4>Status</h4>
                    <div className={styles.statusOptions}>
                      <button
                        className={`${styles.statusOption} ${
                          userStatus === "online" ? styles.active : ""
                        }`}
                        onClick={() => handleStatusChange("online")}
                      >
                        <span
                          className={`${styles.statusIndicator} ${styles.online}`}
                        ></span>
                        Online
                      </button>
                      <button
                        className={`${styles.statusOption} ${
                          userStatus === "idle" ? styles.active : ""
                        }`}
                        onClick={() => handleStatusChange("idle")}
                      >
                        <span
                          className={`${styles.statusIndicator} ${styles.idle}`}
                        ></span>
                        Idle
                      </button>
                      <button
                        className={`${styles.statusOption} ${
                          userStatus === "dnd" ? styles.active : ""
                        }`}
                        onClick={() => handleStatusChange("dnd")}
                      >
                        <span
                          className={`${styles.statusIndicator} ${styles.dnd}`}
                        ></span>
                        Do Not Disturb
                      </button>
                      <button
                        className={`${styles.statusOption} ${
                          userStatus === "offline" ? styles.active : ""
                        }`}
                        onClick={() => handleStatusChange("offline")}
                      >
                        <span
                          className={`${styles.statusIndicator} ${styles.offline}`}
                        ></span>
                        Invisible
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className={styles.tabContent}>
                  <div className={styles.accountSection}>
                    <h4 className={styles.sectionTitle}>Account Settings</h4>

                    <div className={styles.emailSection}>
                      <h5 className={styles.subsectionTitle}>Email Address</h5>
                      {isEditingEmail ? (
                        <div className={styles.emailEditContainer}>
                          <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className={styles.emailInput}
                            autoFocus
                          />
                          <div className={styles.emailButtonGroup}>
                            <button
                              className={styles.emailSaveButton}
                              onClick={handleEmailSave}
                            >
                              Save
                            </button>
                            <button
                              className={styles.emailResetButton}
                              onClick={handleEmailReset}
                            >
                              Reset
                            </button>
                            <button
                              className={styles.emailCancelButton}
                              onClick={handleEmailCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.emailDisplayContainer}>
                          <span>{profile?.email}</span>
                          <button
                            className={styles.emailEditButton}
                            onClick={() => setIsEditingEmail(true)}
                          >
                            <EditIcon />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={styles.passwordSection}>
                      <h5 className={styles.subsectionTitle}>Password</h5>
                      {isEditingPassword ? (
                        <div className={styles.passwordEditContainer}>
                          <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={styles.passwordInput}
                            autoFocus
                          />
                          <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.passwordInput}
                          />
                          <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.passwordInput}
                          />
                          {passwordError && (
                            <div className={styles.passwordError}>
                              {passwordError}
                            </div>
                          )}
                          <div className={styles.passwordButtonGroup}>
                            <button
                              className={styles.passwordSaveButton}
                              onClick={handlePasswordSave}
                            >
                              Save
                            </button>
                            <button
                              className={styles.passwordCancelButton}
                              onClick={handlePasswordCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.passwordDisplayContainer}>
                          <span>••••••••</span>
                          <button
                            className={styles.passwordEditButton}
                            onClick={() => setIsEditingPassword(true)}
                          >
                            <EditIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.logoutSection}>
                    <button
                      className={styles.logoutButton}
                      onClick={handleLogout}
                    >
                      <LogoutIcon />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className={styles.tabContent}>
                  <div className={styles.privacySection}>
                    <h4 className={styles.sectionTitle}>Privacy & Security</h4>

                    <div className={styles.privacyOptions}>
                      <div className={styles.privacyOption}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings?.allowDmsFromContacts ?? true}
                            onChange={(e) =>
                              updateSettings({
                                ...settings,
                                allowDmsFromContacts: e.target.checked,
                              })
                            }
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <div className={styles.privacyOptionInfo}>
                          <h5>Allow direct messages from friends</h5>
                          <p>
                            Your friends will be able to send you direct
                            messages.
                          </p>
                        </div>
                      </div>

                      <div className={styles.privacyOption}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={settings?.showCurrentActivity ?? true}
                            onChange={(e) =>
                              updateSettings({
                                ...settings,
                                showCurrentActivity: e.target.checked,
                              })
                            }
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <div className={styles.privacyOptionInfo}>
                          <h5>Show current activity as a status message</h5>
                          <p>
                            Display what game or app you're currently using as
                            your status.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.dangerZone}>
                      {showDeleteConfirm ? (
                        <div className={styles.deleteConfirm}>
                          <p>
                            Are you sure you want to delete your account? This
                            action cannot be undone.
                          </p>
                          <div className={styles.deleteButtonGroup}>
                            <button
                              className={styles.deleteConfirmButton}
                              onClick={handleDeleteAccount}
                            >
                              Yes, Delete Account
                            </button>
                            <button
                              className={styles.deleteCancelButton}
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={styles.deleteAccountButton}
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <TrashIcon />
                          <span>Delete Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

UserModal.displayName = "UserModal";

export default UserModal;
