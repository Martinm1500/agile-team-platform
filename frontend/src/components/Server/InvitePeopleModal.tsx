import React, { useState, useCallback, useMemo } from "react";
import styles from "./InvitePeopleModal.module.css";
import { InvitePeopleIcon } from "../Icons";
import type { User } from "../../types/index";
import { useServer } from "../../features/servers/useServers";
import { useUsers } from "../../features/users/useUsers";
import { useContacts } from "../../features/contacts/useContacts";

interface InvitePeopleModalProps {
  currentUser: User;
  serverId: number;
  isOpen: boolean;
  onClose: () => void;
}

const InvitePeopleModal: React.FC<InvitePeopleModalProps> = ({
  currentUser,
  serverId,
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { sendServerInvitation } = useServer();
  const { getUserByUsername } = useUsers();
  const { contacts } = useContacts();

  const activeContacts = useMemo(() => {
    return contacts.map((c) => {
      const other = c.requester.id === currentUser.id ? c.target : c.requester;
      return {
        ...c,
        userId: other.id,
        name: other.name,
        avatarUrl: other.avatarUrl,
      };
    });
  }, [contacts, currentUser.id]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedUsername = username.trim().replace(/^@/, "");
      if (!trimmedUsername) return;

      setLocalLoading(true);
      setLocalError(null);

      try {
        const user = await getUserByUsername(trimmedUsername).unwrap();
        await sendServerInvitation(serverId, { userId: user.id });
        setUsername("");
      } catch (err) {
        console.log(err);
        setLocalError("User not found or error sending invitation");
      } finally {
        setLocalLoading(false);
      }
    },
    [username, getUserByUsername, sendServerInvitation, serverId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && username.trim()) {
        handleSubmit(e as never);
      }
    },
    [username, handleSubmit]
  );

  const handleInviteContact = useCallback(
    async (userId: number) => {
      setLocalLoading(true);
      setLocalError(null);

      try {
        await sendServerInvitation(serverId, { userId });
      } catch (err) {
        console.log(err);
        setLocalError("Error sending invitation");
      } finally {
        setLocalLoading(false);
      }
    },
    [sendServerInvitation, serverId]
  );

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return activeContacts;
    const lowerQuery = searchQuery.toLowerCase();
    return activeContacts.filter((contact) =>
      contact.name.toLowerCase().includes(lowerQuery)
    );
  }, [activeContacts, searchQuery]);

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
        <h2 className={styles.title} id="modal-title">
          <InvitePeopleIcon className={styles.titleIcon} /> Invite People
        </h2>
        <p className={styles.subtitle}>
          Invite a user by username or select from contacts
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="@username"
              required
              autoFocus
              disabled={localLoading}
              className={styles.input}
              autoComplete="off"
            />
            {localError && <p className={styles.error}>{localError}</p>}
          </div>

          <div className={styles.contactsSection}>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setIsContactsOpen(!isContactsOpen)}
              aria-expanded={isContactsOpen}
            >
              {isContactsOpen ? "Hide Contacts" : "Show Contacts"}
            </button>
            {isContactsOpen && (
              <div className={styles.contactsContainer}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <div className={styles.contactsList}>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div key={contact.id} className={styles.contactItem}>
                        <div className={styles.contactInfo}>
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={`${contact.name}'s avatar`}
                              className={styles.avatar}
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {contact.name[0].toUpperCase()}
                            </div>
                          )}
                          <span>{contact.name}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.inviteContactButton}
                          onClick={() => handleInviteContact(contact.userId)}
                          disabled={localLoading}
                          aria-label={`Invite ${contact.name}`}
                        >
                          Invite
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noContacts}>No contacts found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={localLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!username.trim() || localLoading}
            >
              {localLoading ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvitePeopleModal;
