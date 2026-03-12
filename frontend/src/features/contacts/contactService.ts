import api from "../../lib/axios";
import type { Contact } from "../../types";

export const requestContactRequest = async (
  targetUserId: number
): Promise<Contact> => {
  const res = await api.post<Contact>(`/api/contacts/${targetUserId}/request`);
  return res.data;
};

export const acceptContactRequest = async (
  contactId: number
): Promise<Contact> => {
  const res = await api.patch<Contact>(`/api/contacts/${contactId}/accept`);
  return res.data;
};

export const rejectContactRequest = async (
  contactId: number
): Promise<Contact> => {
  const res = await api.patch<Contact>(`/api/contacts/${contactId}/reject`);
  return res.data;
};

export const blockContactRequest = async (contactId: number): Promise<void> => {
  await api.patch(`/api/contacts/${contactId}/block`);
};

export const unblockContactRequest = async (
  contactId: number
): Promise<Contact> => {
  const res = await api.patch<Contact>(`/api/contacts/${contactId}/unblock`);
  return res.data;
};

export const getAcceptedContacts = async (): Promise<Contact[]> => {
  const res = await api.get<Contact[]>(`/api/contacts/accepted`);
  return res.data;
};

export const getIncomingPendingContacts = async (): Promise<Contact[]> => {
  const res = await api.get<Contact[]>(`/api/contacts/pending/incoming`);
  return res.data;
};

export const getOutgoingPendingContacts = async (): Promise<Contact[]> => {
  const res = await api.get<Contact[]>(`/api/contacts/pending/outgoing`);
  return res.data;
};

// Opcional: si necesitas blocked
// export const getBlockedContacts = async (): Promise<Contact[]> => {
//   const res = await api.get<Contact[]>(`/api/contacts/blocked`);
//   return res.data;
// };

export const removeContactRequest = async (
  contactId: number
): Promise<void> => {
  await api.delete(`/api/contacts/${contactId}`);
};
