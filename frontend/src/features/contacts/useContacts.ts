import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  setContacts,
  removeContact as removeContactAction,
  addContact,
  requestContact,
  acceptContact,
  rejectContact,
  clearError,
  selectContacts,
  selectIsLoadingRequest,
  selectRequestError,
  fetchContacts,
} from "./contactSlice";
import type { Contact } from "../../types";
import { useCallback, useEffect } from "react";
import {
  removeContactRequest,
  blockContactRequest,
  unblockContactRequest,
} from "./contactService";

export const useContacts = (currentUserId: number) => {
  const dispatch = useAppDispatch();

  const contacts = useAppSelector(selectContacts);
  const conversations = useAppSelector(
    (state) => state.conversation.conversations
  );
  const isLoadingRequest = useAppSelector(selectIsLoadingRequest);
  const requestError = useAppSelector(selectRequestError);

  const saveToCache = useCallback(<T>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    await dispatch(fetchContacts());
  }, [dispatch]);

  const removeContact = useCallback(
    async (contactId: number) => {
      try {
        await removeContactRequest(contactId);

        const removedContact = contacts.find((c) => c.id === contactId);
        if (!removedContact) {
          throw new Error("Contact not found");
        }

        const otherUserId =
          removedContact.requester.id === currentUserId
            ? removedContact.target.id
            : removedContact.requester.id;

        dispatch(removeContactAction(contactId));

        const updatedConversations = conversations.filter(
          (conv) =>
            !conv.participants.some(
              (participant) => participant.id === otherUserId
            )
        );
        saveToCache("conversations", updatedConversations);

        return true;
      } catch (error) {
        console.error("Error removing contact:", error);
        throw error;
      }
    },
    [dispatch, contacts, conversations, saveToCache, currentUserId]
  );

  const blockContact = useCallback(
    async (contactId: number) => {
      try {
        await blockContactRequest(contactId);
        dispatch(removeContactAction(contactId));
      } catch (error) {
        console.error("Error blocking contact:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const unblockContact = useCallback(
    async (contactId: number) => {
      try {
        const updatedContact = await unblockContactRequest(contactId);
        dispatch(addContact(updatedContact));
      } catch (error) {
        console.error("Error unblocking contact:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const findContactByUserId = useCallback(
    (userId: number): Contact => {
      const localContact = contacts.find(
        (c) =>
          (c.requester.id === userId && c.target.id === currentUserId) ||
          (c.target.id === userId && c.requester.id === currentUserId)
      );
      if (!localContact) {
        throw new Error("Contact not found locally");
      }
      return localContact;
    },
    [contacts, currentUserId]
  );

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    isLoadingRequest,
    requestError,

    setContacts: (contacts: Contact[]) => dispatch(setContacts(contacts)),
    removeContact,
    addContact: (contact: Contact) => dispatch(addContact(contact)),
    requestContact: (targetUserId: number) =>
      dispatch(requestContact(targetUserId)),
    acceptContact: (contactId: number) => dispatch(acceptContact(contactId)),
    rejectContact: (contactId: number) => dispatch(rejectContact(contactId)),
    blockContact,
    unblockContact,
    clearError: () => dispatch(clearError()),
    loadContacts,
    findContactByUserId,
  };
};
