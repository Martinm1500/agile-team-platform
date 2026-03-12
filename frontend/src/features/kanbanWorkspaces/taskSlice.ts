//store/taskSlice
import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  createTaskRequest,
  editTaskRequest,
  moveTaskRequest,
  assignTaskRequest,
  deleteTaskRequest,
  type Task,
} from "./taskService";

interface TaskState {
  tasks: Task[];
  isLoadingRequest: boolean;
  requestError: string | null;
}

const initialState: TaskState = {
  tasks: [],
  isLoadingRequest: false,
  requestError: null,
};

// Thunks
export const createTask = createAsyncThunk<Task, Task, { rejectValue: string }>(
  "task/createTask",
  async (dto, { rejectWithValue }) => {
    try {
      return await createTaskRequest(dto);
    } catch {
      return rejectWithValue("Error al crear la tarea");
    }
  }
);

export const editTask = createAsyncThunk<
  Task,
  { id: number; dto: Partial<Task> },
  { rejectValue: string }
>("task/editTask", async ({ id, dto }, { rejectWithValue }) => {
  try {
    return await editTaskRequest(id, dto);
  } catch {
    return rejectWithValue("Error al editar la tarea");
  }
});

export const moveTask = createAsyncThunk<
  Task,
  { id: number; dto: Partial<Task> },
  { rejectValue: string }
>("task/moveTask", async ({ id, dto }, { rejectWithValue }) => {
  try {
    return await moveTaskRequest(id, dto);
  } catch {
    return rejectWithValue("Error al mover la tarea");
  }
});

export const assignTask = createAsyncThunk<
  Task,
  { id: number; userId: number },
  { rejectValue: string }
>("task/assignTask", async ({ id, userId }, { rejectWithValue }) => {
  try {
    return await assignTaskRequest(id, userId);
  } catch {
    return rejectWithValue("Error al asignar la tarea");
  }
});

export const deleteTask = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("task/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await deleteTaskRequest(id);
    return id;
  } catch {
    return rejectWithValue("Error al eliminar la tarea");
  }
});

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    removeTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.requestError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(editTask.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(moveTask.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(assignTask.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(assignTask.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(assignTask.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      })
      .addCase(deleteTask.pending, (state) => {
        state.isLoadingRequest = true;
        state.requestError = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoadingRequest = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoadingRequest = false;
        state.requestError = action.payload ?? "Error desconocido";
      });
  },
});

export const { setTasks, removeTask, addTask, updateTask, clearError } =
  taskSlice.actions;
export default taskSlice.reducer;

// Selectors
export const selectTaskState = (state: { task: TaskState }) => state.task;

export const selectTasks = createSelector(
  [selectTaskState],
  (taskState) => taskState.tasks
);

export const selectIsLoadingRequest = createSelector(
  [selectTaskState],
  (taskState) => taskState.isLoadingRequest
);

export const selectRequestError = createSelector(
  [selectTaskState],
  (taskState) => taskState.requestError
);
