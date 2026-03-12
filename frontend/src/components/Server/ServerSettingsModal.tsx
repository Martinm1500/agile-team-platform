import React, { useState, useCallback, useRef, useEffect } from "react";
import styles from "./ServerSettingsModal.module.css";
import { CogIcon, CameraIcon, TrashIcon, UsersIcon2 } from "../Icons";
import type { Server } from "../../features/servers/serverTypes";

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    id: number;
    name: string;
    description: string;
    privacy: "PRIVATE" | "DEFAULT" | "PUBLIC";
    avatarUrl: string;
    bannerUrl: string;
  }) => void;
  onDelete: () => void;
  server: Server;
  isLoading?: boolean;
  error?: string | null;
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  server,
  isLoading = false,
  error = null,
}) => {
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description || "");
  const [privacySetting, setPrivacySetting] = useState<
    "PRIVATE" | "DEFAULT" | "PUBLIC"
  >(server.privacy as "PRIVATE" | "DEFAULT" | "PUBLIC");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarUrl, setAvatar] = useState<string>(server.avatarUrl);
  const [bannerUrl, setBanner] = useState<string>(server.bannerUrl);
  const [avatarHover, setAvatarHover] = useState(false);
  const [bannerHover, setBannerHover] = useState(false);
  const [membersCount] = useState(1250);
  const [onlineCount] = useState(342);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(server.name);
    setDescription(server.description || "");
    setPrivacySetting(server.privacy as "PRIVATE" | "DEFAULT" | "PUBLIC");
    setAvatar(server.avatarUrl);
    setBanner(server.bannerUrl);
  }, [server]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim()) {
        onSave({
          id: server.id,
          name: name.trim(),
          description: description.trim(),
          privacy: privacySetting,
          avatarUrl,
          bannerUrl,
        });
      }
    },
    [name, onSave, server.id, description, privacySetting, avatarUrl, bannerUrl]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && name.trim()) {
        handleSubmit(e);
      }
    },
    [name, handleSubmit]
  );

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBanner(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar("");
  };

  const removeBanner = () => {
    setBanner("");
  };

  const triggerAvatarInput = () => {
    avatarInputRef.current?.click();
  };

  const triggerBannerInput = () => {
    bannerInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {showDeleteConfirm ? (
          <div className={styles.deleteConfirmation}>
            <div className={styles.deleteIcon}>
              <TrashIcon />
            </div>
            <h2 className={styles.title} id="modal-title">
              Delete Server
            </h2>
            <p className={styles.subtitle}>
              Are you sure you want to delete{" "}
              <span className={styles.serverName}>"{name}"</span>? This action
              cannot be undone.
            </p>
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmButton}
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Server"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title} id="modal-title">
                <CogIcon className={styles.titleIcon} /> Server Settings
              </h2>
              <p className={styles.subtitle}>
                Customize your server with a unique identity
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Vista previa del servidor */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Preview</label>
                <div className={styles.serverPreview}>
                  <div className={styles.serverBannerContainer}>
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        alt="Server banner"
                        className={styles.serverBanner}
                      />
                    ) : (
                      <div className={styles.bannerPlaceholder}></div>
                    )}
                    <div className={styles.serverAvatarContainer}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Server avatar"
                          className={styles.serverAvatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <CameraIcon className={styles.placeholderIcon} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.serverCardContent}>
                    <h3 className={styles.serverPreviewName}>
                      {name || "Server Name"}
                    </h3>
                    <p className={styles.serverPreviewDescription}>
                      {description || "Server description will appear here."}
                    </p>

                    <div className={styles.serverStats}>
                      <div className={styles.statItem}>
                        <UsersIcon2 className={styles.usersIcon} />
                        <span>{membersCount.toLocaleString()}</span>
                        Members
                      </div>
                      <div className={`${styles.statItem} ${styles.online}`}>
                        <span className={styles.status}></span>
                        <span>{onlineCount.toLocaleString()}</span>
                        Online
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Section */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Server Banner</label>
                <div
                  className={`${styles.bannerContainer} ${
                    !bannerUrl ? styles.emptyBanner : ""
                  }`}
                  onMouseEnter={() => setBannerHover(true)}
                  onMouseLeave={() => setBannerHover(false)}
                >
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Server banner"
                      className={styles.bannerImage}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <CameraIcon className={styles.placeholderIcon} />
                      <span>No banner uploaded</span>
                    </div>
                  )}

                  {(bannerHover || !bannerUrl) && (
                    <div className={styles.bannerOverlay}>
                      <button
                        type="button"
                        className={styles.imageUploadButton}
                        onClick={triggerBannerInput}
                        disabled={isLoading}
                      >
                        <CameraIcon className={styles.buttonIcon} />
                        {bannerUrl ? "Change Banner" : "Upload Banner"}
                      </button>
                      {bannerUrl && (
                        <button
                          type="button"
                          className={styles.imageRemoveButton}
                          onClick={removeBanner}
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className={styles.hiddenInput}
                  />
                </div>
              </div>

              {/* Avatar Section */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Server Avatar</label>
                <div
                  className={styles.avatarSection}
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <div
                    className={`${styles.avatarContainer} ${
                      !avatarUrl ? styles.emptyAvatar : ""
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Server avatar"
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.placeholder}>
                        <CameraIcon className={styles.placeholderIcon} />
                      </div>
                    )}

                    {(avatarHover || !avatarUrl) && (
                      <div className={styles.avatarOverlay}>
                        <button
                          type="button"
                          className={styles.imageUploadButton}
                          onClick={triggerAvatarInput}
                          disabled={isLoading}
                        >
                          <CameraIcon className={styles.buttonIcon} />
                          {avatarUrl ? "Change" : "Upload"}
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            className={styles.imageRemoveButton}
                            onClick={removeAvatar}
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles.hiddenInput}
                    />
                  </div>

                  <div className={styles.avatarHelp}>
                    <p>Recommended: 256x256 pixels, JPG or PNG</p>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="serverName" className={styles.label}>
                  Server Name
                </label>
                <input
                  type="text"
                  id="serverName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter server name"
                  required
                  autoFocus
                  disabled={isLoading}
                  className={styles.input}
                  autoComplete="off"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="serverDescription" className={styles.label}>
                  Server Description{" "}
                  <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="serverDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this server about?"
                  disabled={isLoading}
                  className={styles.textarea}
                  rows={3}
                  maxLength={120}
                />
                <div className={styles.charCount}>
                  {description.length}/120 characters
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Server Privacy</label>
                <div className={styles.radioGroup}>
                  <label className={styles.optionLabel}>
                    <div className={styles.radioContainer}>
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        checked={privacySetting === "PUBLIC"}
                        onChange={() => setPrivacySetting("PUBLIC")}
                        disabled={isLoading}
                        className={styles.optionRadio}
                      />
                      <span className={styles.radioCheckmark}></span>
                    </div>
                    <span className={styles.optionText}>
                      <span className={styles.optionName}>Public</span>
                      <span className={styles.optionDescription}>
                        Anyone can find and join this server.
                      </span>
                    </span>
                  </label>

                  <label className={styles.optionLabel}>
                    <div className={styles.radioContainer}>
                      <input
                        type="radio"
                        name="privacy"
                        value="default"
                        checked={privacySetting === "DEFAULT"}
                        onChange={() => setPrivacySetting("DEFAULT")}
                        disabled={isLoading}
                        className={styles.optionRadio}
                      />
                      <span className={styles.radioCheckmark}></span>
                    </div>
                    <span className={styles.optionText}>
                      <span className={styles.optionName}>Default</span>
                      <span className={styles.optionDescription}>
                        Visible in server discovery, but requires approval to
                        join.
                      </span>
                    </span>
                  </label>

                  <label className={styles.optionLabel}>
                    <div className={styles.radioContainer}>
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        checked={privacySetting === "PRIVATE"}
                        onChange={() => setPrivacySetting("PRIVATE")}
                        disabled={isLoading}
                        className={styles.optionRadio}
                      />
                      <span className={styles.radioCheckmark}></span>
                    </div>
                    <span className={styles.optionText}>
                      <span className={styles.optionName}>Private</span>
                      <span className={styles.optionDescription}>
                        Only members with an invite link can join this server.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className={styles.error}>
                  <span>!</span>
                  {error}
                </div>
              )}

              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                >
                  Delete Server
                  <TrashIcon className={styles.buttonIcon} />
                </button>
                <div className={styles.footerRight}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!name.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ServerSettingsModal;
