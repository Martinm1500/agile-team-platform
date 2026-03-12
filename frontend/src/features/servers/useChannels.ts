import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hooks/redux";
import {
  selectChannelsByServerId,
  selectChannelById,
  deleteChannel,
  createChannel,
  updateChannel,
} from "./serverSlice";
import type { RootState } from "../../store";
import type { CreateChannelRequest, Channel } from "./serverTypes";
import { useMemo } from "react";

// Hook para mutations (acciones que modifican el estado)
export const useChannelMutations = () => {
  const dispatch = useAppDispatch();

  const removeChannel = useCallback(
    async (channelId: number) => {
      try {
        await dispatch(deleteChannel(channelId)).unwrap();
        console.log(`Canal ${channelId} eliminado con éxito`);
      } catch (error) {
        console.error("Error al eliminar el canal:", error);
        throw error;
      }
    },
    [dispatch],
  );

  const createNewChannel = useCallback(
    async (data: CreateChannelRequest) => {
      try {
        const result = await dispatch(createChannel(data)).unwrap();
        console.log(`Canal creado con éxito: ${result.id}`);
        return result;
      } catch (error) {
        console.error("Error al crear el canal:", error);
        throw error;
      }
    },
    [dispatch],
  );

  const updateExistingChannel = useCallback(
    async (channelId: number, data: Channel) => {
      try {
        const result = await dispatch(
          updateChannel({ channelId, data }),
        ).unwrap();
        console.log(`Canal actualizado con éxito: ${result.id}`);
        return result;
      } catch (error) {
        console.error("Error al actualizar el canal:", error);
        throw error;
      }
    },
    [dispatch],
  );

  return {
    removeChannel,
    createNewChannel,
    updateExistingChannel,
  };
};

// Hooks específicos para queries (lecturas memoizadas)
// Estos solo causan re-renders si los datos relevantes cambian

export const useServerChannels = (serverId: number) => {
  return useSelector((state: RootState) =>
    selectChannelsByServerId(state, serverId),
  );
};

export const useServerTextChannels = (serverId: number) => {
  const channels = useServerChannels(serverId);
  return useMemo(
    () => channels.filter((channel) => channel.type === "TEXT"),
    [channels],
  );
};

export const useServerVoiceChannels = (serverId: number) => {
  const channels = useServerChannels(serverId);
  return useMemo(
    () => channels.filter((channel) => channel.type === "VOICE"),
    [channels],
  );
};

export const useChannel = (channelId?: number) => {
  return useSelector((state: RootState) =>
    channelId != null ? selectChannelById(state, channelId) : undefined,
  );
};
