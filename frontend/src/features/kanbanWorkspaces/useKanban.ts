//store/useKanban.ts
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  setKanbans,
  addKanban,
  updateKanbanReducer,
  createKanban,
  updateKanban,
  deleteKanban,
  clearError,
  selectKanbans,
  selectIsLoadingRequest,
  selectRequestError,
} from "./kanbanSlice";

import { useCallback, useEffect } from "react";
import { getAllKanbans, type Kanban } from "./kanbanService";

export const useKanban = () => {
  const dispatch = useAppDispatch();

  const kanbans = useAppSelector(selectKanbans);
  const isLoadingRequest = useAppSelector(selectIsLoadingRequest);
  const requestError = useAppSelector(selectRequestError);

  const loadKanbans = useCallback(async () => {
    try {
      const allKanbans = await getAllKanbans();
      dispatch(setKanbans(allKanbans));
    } catch (error) {
      console.error("Error loading kanbans:", error);
    }
  }, [dispatch]);

  const removeKanban = useCallback(
    async (kanbanId: number) => {
      try {
        await dispatch(deleteKanban(kanbanId));
        return true;
      } catch (error) {
        console.error("Error removing kanban:", error);
        throw error;
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadKanbans();
  }, [loadKanbans]);

  return {
    kanbans,
    isLoadingRequest,
    requestError,

    setKanbans: (kanbans: Kanban[]) => dispatch(setKanbans(kanbans)),
    removeKanban,
    addKanban: (kanban: Kanban) => dispatch(addKanban(kanban)),
    updateKanbanReducer: (kanban: Kanban) =>
      dispatch(updateKanbanReducer(kanban)),
    createKanban: (name: string) => dispatch(createKanban({ name })),
    updateKanban: (id: number, dto: { name: string }) =>
      dispatch(updateKanban({ id, dto })),
    deleteKanban: (id: number) => dispatch(deleteKanban(id)),
    clearError: () => dispatch(clearError()),
    loadKanbans,
  };
};
