import React, { useState, useEffect, useCallback } from "react";
import ContactItem from "./ContactItem";
import AddContactModal from "./AddContactModal";
import type { Contact, User } from "../../types";
import { PlusIcon, SearchIcon, SearchMinusIcon } from "../Icons";
import styles from "./ContactsView.module.css";
import { useContacts } from "../../features/contacts/useContacts";
import { useUsers } from "../../features/users/useUsers";

interface ContactsViewProps {
  currentUser: User;
  onContactSelect: (contact: Contact) => void;
  hideConversation: (conversationId: number) => void;
}

const ContactsView: React.FC<ContactsViewProps> = React.memo(
  ({ currentUser, onContactSelect, hideConversation }) => {
    const { contacts, removeContact, loadContacts, requestContact } =
      useContacts(currentUser.id);
    const { getUserByUsername, userError, isLoadingUser } = useUsers();
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingLoading, setIsAddingLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
      const loadData = async () => {
        await loadContacts();
        setLoading(false);
      };
      loadData();
    }, [loadContacts]);

    const filteredContacts = contacts.filter(
      (contact) =>
        (contact.requester.id === currentUser.id
          ? contact.target.username
          : contact.requester.username
        )
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) && contact.status === "ACCEPTED",
    );

    const handleContactClick = useCallback(
      (contact: Contact) => {
        onContactSelect(contact);
      },
      [onContactSelect],
    );

    const handleRemoveContact = useCallback(
      async (contactId: number) => {
        if (window.confirm("Are you sure you want to remove this contact?")) {
          try {
            await removeContact(contactId);
            hideConversation(contactId);
          } catch (error) {
            console.error("Error removing contact:", error);
            alert("Error removing contact. Please try again.");
          }
        }
      },
      [removeContact, hideConversation],
    );

    const handleAddContact = () => {
      setIsModalOpen(true);
      setAddError(null);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setAddError(null);
    };

    const handleSubmitContact = async (username: string) => {
      try {
        setIsAddingLoading(true);
        setAddError(null);
        const action = await getUserByUsername(username);
        const user = action.payload as User | undefined;
        if (user) {
          await requestContact(user.id);
          setIsModalOpen(false);
        } else {
          setAddError(userError || "User not found");
        }
      } catch (error) {
        console.log(error);
        setAddError("Error adding contact");
      } finally {
        setIsAddingLoading(false);
      }
    };

    return (
      <div className={styles.contactsView} id="contactsViewContainer">
        <div className={styles.contactViewHeader}>
          <button className={styles.addContactBtn} onClick={handleAddContact}>
            <PlusIcon />
            New contact
          </button>
          <div className={styles.searchContactContainer}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchContactInput}
              placeholder="Search"
              aria-label="Search contacts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.contactsViewLists}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Cargando contactos...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className={styles.noContacts}>
              {searchTerm ? (
                <>
                  <SearchMinusIcon />
                  <p>No contacts match your search</p>
                </>
              ) : (
                <>
                  <p>No contacts available</p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.allContactsList}>
              {filteredContacts.map((contact) => (
                <ContactItem
                  currentUser={currentUser}
                  key={`${contact.requester.id}-${contact.target.id}`}
                  contact={contact}
                  onClick={() => handleContactClick(contact)}
                  onRemove={() => handleRemoveContact(contact.id)}
                />
              ))}
            </div>
          )}
        </div>
        {isModalOpen && (
          <AddContactModal
            onClose={handleCloseModal}
            onSubmit={handleSubmitContact}
            isLoading={isAddingLoading || isLoadingUser}
            error={addError}
          />
        )}
      </div>
    );
  },
);

export default ContactsView;
