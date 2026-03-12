import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import {
  getChannelsRequest,
  getChannelByIdRequest,
  createChannelRequest,
  updateChannelRequest,
  deleteChannelRequest,
} from "./channelService";

export interface Channel {
  id: number;
  name: string;
  serverId: number;
  type: "TEXT" | "VOICE";
  position: number;
}

export interface CreateChannelRequest {
  name: string;
  serverId: number;
  type: "TEXT" | "VOICE";
}

export interface UpdateChannelRequest extends CreateChannelRequest {
  id: number;
}

export interface ChannelState {
  channelsById: { [id: number]: Channel };
  isLoading: boolean;
  error: string | null;
}

const initialState: ChannelState = {
  channelsById: {},
  isLoading: false,
  error: null,
};

export const getChannels = createAsyncThunk<
  Channel[],
  void,
  { rejectValue: string }
>("channel/getAll", async (_, { rejectWithValue }) => {
  try {
    return await getChannelsRequest();
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const getChannelById = createAsyncThunk<
  Channel,
  number,
  { rejectValue: string; state: { channels: ChannelState } }
>("channel/getById", async (id, { getState, rejectWithValue }) => {
  const state = getState();
  const cached = state.channels.channelsById[id];
  if (cached) return cached;
  try {
    return await getChannelByIdRequest(id);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const createChannel = createAsyncThunk<
  Channel,
  CreateChannelRequest,
  { rejectValue: string }
>("channel/create", async (data, { rejectWithValue }) => {
  try {
    return await createChannelRequest(data);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const updateChannel = createAsyncThunk<
  Channel,
  UpdateChannelRequest,
  { rejectValue: string }
>("channel/update", async (data, { rejectWithValue }) => {
  try {
    return await updateChannelRequest(data);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

export const deleteChannel = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("channel/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteChannelRequest(id);
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

const channelSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    updateChannelFromWebSocket: (state, action: { payload: Channel }) => {
      state.channelsById[action.payload.id] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChannels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChannels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.channelsById = action.payload.reduce((acc, c) => {
          acc[c.id] = c;
          return acc;
        }, {} as Record<number, Channel>);
      })
      .addCase(getChannels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error";
      })

      .addCase(getChannelById.fulfilled, (state, action) => {
        state.channelsById[action.payload.id] = action.payload;
      })

      .addCase(createChannel.fulfilled, (state, action) => {
        state.channelsById[action.payload.id] = action.payload;
      })

      .addCase(updateChannel.fulfilled, (state, action) => {
        state.channelsById[action.payload.id] = action.payload;
      })

      .addCase(deleteChannel.fulfilled, (state, action) => {
        delete state.channelsById[action.meta.arg];
      });
  },
});

export const selectChannelsById = (state: { channels: ChannelState }) =>
  state.channels.channelsById;

export const selectChannelById = createSelector(
  [selectChannelsById, (_: unknown, id: number) => id],
  (map, id) => map[id] || null
);

export const selectChannelsByServerId = createSelector(
  [selectChannelsById, (_: unknown, serverId: number) => serverId],
  (channels, serverId) =>
    Object.values(channels)
      .filter((c) => c.serverId === serverId)
      .sort((a, b) => a.position - b.position)
);

export const { updateChannelFromWebSocket } = channelSlice.actions;
export default channelSlice.reducer;
