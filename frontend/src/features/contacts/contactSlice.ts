//store/contactSlice
import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Contact } from "../../types";
import {
  requestContactRequest,
  acceptContactRequest,
  rejectContactRequest,
  getAcceptedContacts,
  getIncomingPendingContacts,
  getOutgoingPendingContacts,
} from "./contactService";

interface ContactState {
  contacts: Contact[];
  isLoadingRequest: boolean;
  requestError: string | null;
}

const initialState: ContactState = {
  contacts: [],
  isLoadingRequest: false,
  requestError: null,
};

// Thunks
export const fetchContacts = createAsyncThunk<
  Contact[],
  void,
  { rejectValue: string }
>("contact/fetchContacts", async (_, { rejectWithValue }) => {
  try {
    const [accepted, incoming, outgoing] = await Promise.all([
      getAcceptedContacts(),
      getIncomingPendingContacts(),
      getOutgoingPendingContacts(),
    ]);
    return [...accepted, ...incoming, ...outgoing];
  } catch {
    return rejectWithValue("Error al obtener los contactos");
  }
});

export const requestContact = createAsyncThunk<
  Contact,
  number,
  { rejectValue: string }
>("contact/requestContact", async (targetUserId, { rejectWithValue }) => {
  try {
    return await requestContactRequest(targetUserId);
  } catch {
    return rejectWithValue("Error al solicitar el contacto");
  }
});

export const acceptContact = createAsyncThunk<
  Contact,
  number,
  { rejectValue: string }
>("contact/acceptContact", async (contactId, { rejectWithValue }) => {
  try {
    return await acceptContactRequest(contactId);
  } catch {
    return rejectWithValue("Error al aceptar el contacto");
  }
});

export const rejectContact = createAsyncThunk<
  Contact,
  number,
  { rejectValue: string }
>("contact/rejectContact", async (contactId, { rejectWithValue }) => {
  try {
    return await rejectContactRequest(contactId);
  } catch {
    return rejectWithValue("Error al rechazar el contacto");
  }
});

export const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    removeContact: (state, action: PayloadAction<number>) => {
      state.contacts = state.contacts.filter(
        (contact) => contact.id !== action.payload
      );
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
    },
    clearError: (state) => {
      state.requestError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(requestContact.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(requestContact.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.contacts.push(action.payload);
      })
      .addCase(requestContact.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(acceptContact.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(acceptContact.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        const index = state.contacts.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })
      .addCase(acceptContact.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(rejectContact.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(rejectContact.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.contacts = state.contacts.filter(
          (c) => c.id !== action.payload.id
        );
      })
      .addCase(rejectContact.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      });
  },
});

export const { setContacts, removeContact, addContact, clearError } =
  contactSlice.actions;
export default contactSlice.reducer;

// Selectors
export const selectContactState = (state: { contact: ContactState }) =>
  state.contact;

export const selectContacts = createSelector(
  [selectContactState],
  (contactState) => contactState.contacts
);

export const selectIsLoadingRequest = createSelector(
  [selectContactState],
  (contactState) => contactState.isLoadingRequest
);

export const selectRequestError = createSelector(
  [selectContactState],
  (contactState) => contactState.requestError
);
