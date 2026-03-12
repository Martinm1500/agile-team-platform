// src/features/servers/specialtiesSlice.ts
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import type { Specialty } from "./serverTypes";
import { getSpecialtiesByProjectIdRequest } from "./specialtyService";

interface SpecialtiesState {
  specialties: { [id: number]: Specialty };
  isLoading: boolean;
  error: string | null;
}

const initialState: SpecialtiesState = {
  specialties: {},
  isLoading: false,
  error: null,
};

// Thunk (mueve de serverSlice)
export const getSpecialties = createAsyncThunk<
  Specialty[],
  number,
  { rejectValue: string }
>("specialties/getSpecialties", async (projectId, { rejectWithValue }) => {
  try {
    return await getSpecialtiesByProjectIdRequest(projectId);
  } catch {
    return rejectWithValue("Error al obtener especialidades del proyecto");
  }
});

const specialtiesSlice = createSlice({
  name: "specialties",
  initialState,
  reducers: {
    // Agrega reducers si necesitas
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSpecialties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSpecialties.fulfilled, (state, action) => {
        state.isLoading = false;
        action.payload.forEach((spec) => {
          state.specialties[spec.id] = {
            ...spec,
            projectId: action.meta.arg,
          };
        });
      })
      .addCase(getSpecialties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error desconocido";
      });
  },
});

// Selectores
export const selectSpecialties = (state: { specialties: SpecialtiesState }) =>
  state.specialties.specialties;

export const selectSpecialtiesByProjectId = createSelector(
  [selectSpecialties, (_: unknown, projectId: number) => projectId],
  (specialtiesById, projectId) =>
    Object.values(specialtiesById).filter(
      (spec) => spec.projectId === projectId
    )
);

export default specialtiesSlice.reducer;
