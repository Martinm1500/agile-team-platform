import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  createKanbanRequest,
  updateKanbanRequest,
  deleteKanbanRequest,
  type Kanban,
} from "./kanbanService";

interface KanbanState {
  kanbans: Kanban[];
  isLoadingRequest: boolean;
  requestError: string | null;
}

const initialState: KanbanState = {
  kanbans: [],
  isLoadingRequest: false,
  requestError: null,
};

// Thunks
export const createKanban = createAsyncThunk<
  Kanban,
  { name: string },
  { rejectValue: string }
>("kanban/createKanban", async (dto, { rejectWithValue }) => {
  try {
    return await createKanbanRequest(dto);
  } catch {
    return rejectWithValue("Error al crear el kanban");
  }
});

export const updateKanban = createAsyncThunk<
  Kanban,
  { id: number; dto: { name: string } },
  { rejectValue: string }
>("kanban/updateKanban", async ({ id, dto }, { rejectWithValue }) => {
  try {
    return await updateKanbanRequest(id, dto);
  } catch {
    return rejectWithValue("Error al actualizar el kanban");
  }
});

export const deleteKanban = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("kanban/deleteKanban", async (id, { rejectWithValue }) => {
  try {
    await deleteKanbanRequest(id);
    return id;
  } catch {
    return rejectWithValue("Error al eliminar el kanban");
  }
});

export const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    setKanbans: (state, action: PayloadAction<Kanban[]>) => {
      state.kanbans = action.payload;
    },
    removeKanban: (state, action: PayloadAction<number>) => {
      state.kanbans = state.kanbans.filter(
        (kanban) => kanban.id !== action.payload
      );
    },
    addKanban: (state, action: PayloadAction<Kanban>) => {
      state.kanbans.push(action.payload);
    },
    updateKanbanReducer: (state, action: PayloadAction<Kanban>) => {
      const index = state.kanbans.findIndex((k) => k.id === action.payload.id);
      if (index !== -1) {
        state.kanbans[index].name = action.payload.name;
      }
    },
    clearError: (state) => {
      state.requestError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createKanban.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(createKanban.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.kanbans.push(action.payload);
      })
      .addCase(createKanban.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(updateKanban.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(updateKanban.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        const index = state.kanbans.findIndex(
          (k) => k.id === action.payload.id
        );
        if (index !== -1) {
          state.kanbans[index].name = action.payload.name;
        }
      })
      .addCase(updateKanban.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(deleteKanban.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(deleteKanban.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.kanbans = state.kanbans.filter((k) => k.id !== action.payload);
      })
      .addCase(deleteKanban.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      });
  },
});

export const {
  setKanbans,
  removeKanban,
  addKanban,
  updateKanbanReducer,
  clearError,
} = kanbanSlice.actions;
export default kanbanSlice.reducer;

// Selectors
export const selectKanbanState = (state: { kanban: KanbanState }) =>
  state.kanban;

export const selectKanbans = createSelector(
  [selectKanbanState],
  (kanbanState) => kanbanState.kanbans
);

export const selectIsLoadingRequest = createSelector(
  [selectKanbanState],
  (kanbanState) => kanbanState.isLoadingRequest
);

export const selectRequestError = createSelector(
  [selectKanbanState],
  (kanbanState) => kanbanState.requestError
);
