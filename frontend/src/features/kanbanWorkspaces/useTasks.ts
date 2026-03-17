import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  setTasks,
  addTask,
  updateTask,
  createTask,
  editTask,
  moveTask,
  assignTask,
  deleteTask,
  clearError,
  selectTasks,
  selectIsLoadingRequest,
  selectRequestError,
} from "./taskSlice";
import { useCallback } from "react";
import { getAllTasksForKanban, type Task } from "./taskService";

export const useTasks = () => {
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectTasks);
  const isLoadingRequest = useAppSelector(selectIsLoadingRequest);
  const requestError = useAppSelector(selectRequestError);

  const loadTasks = useCallback(
    async (kanbanId: number) => {
      try {
        const kanbanTasks = await getAllTasksForKanban(kanbanId);
        dispatch(setTasks(kanbanTasks));
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    },
    [dispatch]
  );

  const removeTask = useCallback(
    async (taskId: number) => {
      try {
        await dispatch(deleteTask(taskId));
        return true;
      } catch (error) {
        console.error("Error removing task:", error);
        throw error;
      }
    },
    [dispatch]
  );

  return {
    tasks,
    isLoadingRequest,
    requestError,
    setTasks: (tasks: Task[]) => dispatch(setTasks(tasks)),
    removeTask,
    addTask: (task: Task) => dispatch(addTask(task)),
    updateTask: (task: Task) => dispatch(updateTask(task)),
    createTask: (dto: Task) => dispatch(createTask(dto)),
    editTask: (id: number, dto: Partial<Task>) =>
      dispatch(editTask({ id, dto })),
    moveTask: (id: number, dto: Partial<Task>) =>
      dispatch(moveTask({ id, dto })),
    assignTask: (id: number, userId: number) =>
      dispatch(assignTask({ id, userId })),
    deleteTask: (id: number) => dispatch(deleteTask(id)),
    clearError: () => dispatch(clearError()),
    loadTasks,
  };
};
