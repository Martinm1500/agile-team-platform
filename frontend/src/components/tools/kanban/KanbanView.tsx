// KanbanView.tsx
import React, { useState, useEffect, useRef } from "react";
import type { StompSubscription } from "@stomp/stompjs";
import { useAppSelector, useAppDispatch } from "../../../hooks/redux";
import TaskCard, { type Task } from "./TaskCard";
import styles from "./KanbanDashboard.module.css";
import { PlusIcon } from "../../Icons";
import { useTasks } from "../../../features/kanbanWorkspaces/useTasks";
import type { Kanban } from "../../../features/kanbanWorkspaces/kanbanService";
import type { User } from "../../../types";
import { useSpecialties } from "../../../features/servers/useSpecialties";
import { selectProjectMembersByProjectId } from "../../../features/servers/projectMemberSlice";
import { selectSpecialtiesByProjectId } from "../../../features/servers/specialtiesSlice";
import { subscribeGeneral } from "../../../features/messages/stompService";
import { useStomp } from "../../../features/messages/useStomp";
import {
  addTask,
  updateTask,
  removeTask,
} from "../../../features/kanbanWorkspaces/taskSlice";
import { useProjectMemberMutations } from "../../../features/servers/useProjectMembers";

interface TaskUpdateMessage {
  action: "CREATE" | "UPDATE" | "DELETE";
  task?: Task;
  id?: number;
  senderId: number;
}

interface KanbanViewProps {
  currentKanban: Kanban;
  currentUser: User;
}

const KanbanView: React.FC<KanbanViewProps> = ({
  currentKanban,
  currentUser,
}) => {
  const dispatch = useAppDispatch();
  const { isConnected, registerReconnect, unregisterReconnect } = useStomp();

  const {
    tasks,
    loadTasks,
    createTask,
    editTask,
    moveTask,
    deleteTask,
    assignTask,
  } = useTasks();

  const { fetchProjectMembers } = useProjectMemberMutations();
  const { fetchSpecialties } = useSpecialties();

  const isPersonalWorkspace = currentKanban.projectId == null;

  const members = useAppSelector((state) =>
    currentKanban.projectId
      ? selectProjectMembersByProjectId(state, currentKanban.projectId)
      : [],
  );

  const specialties = useAppSelector((state) =>
    currentKanban.projectId
      ? selectSpecialtiesByProjectId(state, currentKanban.projectId)
      : [],
  );

  const currentProjectMember = members.find((m) => m.userId === currentUser.id);

  const currentProjectMemberSpecialty = specialties.find(
    (s) => s.id === currentProjectMember?.specialtyId,
  );

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [originalAssignee, setOriginalAssignee] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const dispatchRef = useRef(dispatch);
  const currentUserIdRef = useRef(currentUser.id);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  useEffect(() => { currentUserIdRef.current = currentUser.id; }, [currentUser.id]);

  useEffect(() => {
    if (!currentKanban.id || !isConnected) return;

    loadTasks(currentKanban.id);

    let subscription: StompSubscription | undefined;

    const subscribe = () => {
      subscription = subscribeGeneral(
        `/topic/kanban/${currentKanban.id}`,
        (msg) => {
          try {
            const update: TaskUpdateMessage = JSON.parse(msg.body);
            if (update.senderId === currentUserIdRef.current) return;

            switch (update.action) {
              case "CREATE":
                if (update.task) dispatchRef.current(addTask(update.task));
                break;
              case "UPDATE":
                if (update.task) dispatchRef.current(updateTask(update.task));
                break;
              case "DELETE":
                if (update.id) dispatchRef.current(removeTask(update.id));
                break;
              default:
                console.warn(
                  "Acción desconocida en actualización de tarea:",
                  update.action,
                );
            }
          } catch (error) {
            console.error("Error al parsear actualización de tarea:", error);
          }
        },
      ) as StompSubscription | undefined;
    };

    subscribe();
    registerReconnect(subscribe);

    return () => {
      subscription?.unsubscribe();
      unregisterReconnect(subscribe);
    };
  }, [currentKanban.id, isConnected, loadTasks, registerReconnect, unregisterReconnect]);

  useEffect(() => {
    if (currentKanban.projectId) {
      if (members.length === 0) {
        fetchProjectMembers(currentKanban.projectId);
      }
      if (specialties.length === 0) {
        fetchSpecialties(currentKanban.projectId);
      }
    }
  }, [
    currentKanban.projectId,
    members.length,
    specialties.length,
    fetchProjectMembers,
    fetchSpecialties,
  ]);

  const enrichedTasks = tasks.map((task) => ({
    ...task,
    status:
      currentKanban.columns.find((col) => col.id === task.columnId)?.status ||
      "UNKNOWN",
    assignee: members.find((m) => m.userId === task.assigneeId),
  }));

  const columns = currentKanban.columns;

  const handleDragStart = (task: Task) => {
    if (!isPersonalWorkspace && !currentProjectMemberSpecialty?.moveTask) {
      return;
    }
    setDraggedTask(task);
  };

  const handleDrop = async (columnId: number) => {
    if (!isPersonalWorkspace && !currentProjectMemberSpecialty?.moveTask) {
      return;
    }
    if (draggedTask) {
      await moveTask(draggedTask.id!, { columnId });
      setDraggedTask(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddTask = (columnId: number) => {
    if (!isPersonalWorkspace && !currentProjectMemberSpecialty?.createTask) {
      return;
    }
    const newTask: Task = {
      kanbanId: currentKanban.id!,
      title: "",
      description: "",
      columnId,
    };
    setEditingTask(newTask);
    setOriginalAssignee(null);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    if (
      !isPersonalWorkspace &&
      task.id &&
      !currentProjectMemberSpecialty?.editTask
    ) {
      return;
    }
    setEditingTask(task);
    setOriginalAssignee(task.assigneeId ?? null);
    setShowModal(true);
  };

  const handleSaveTask = async () => {
    if (editingTask) {
      if (!editingTask.title.trim()) {
        alert("Title is required");
        return;
      }

      const assignee = editingTask.assigneeId ?? null;
      const assigneeChanged = assignee !== originalAssignee;
      const isNew = !editingTask.id;

      const dto: Partial<Task> = {
        title: editingTask.title,
        description: editingTask.description,
      };

      if (isNew) {
        dto.columnId = editingTask.columnId;
      }

      let taskId: number;

      if (isNew) {
        if (
          !isPersonalWorkspace &&
          !currentProjectMemberSpecialty?.createTask
        ) {
          return;
        }
        const createDto: Task = {
          kanbanId: editingTask.kanbanId,
          title: dto.title!,
          description: dto.description ?? "",
          columnId: dto.columnId!,
        };
        const createdTask = await createTask(createDto).unwrap();
        taskId = createdTask.id!;
      } else {
        if (!isPersonalWorkspace && !currentProjectMemberSpecialty?.editTask) {
          return;
        }
        await editTask(editingTask.id!, dto);
        taskId = editingTask.id!;
      }

      if (assigneeChanged) {
        if (
          !isPersonalWorkspace &&
          !currentProjectMemberSpecialty?.assignTask
        ) {
          return;
        }
        if (assignee !== null) {
          await assignTask(taskId, assignee);
        } else {
          await editTask(taskId, { assigneeId: null });
        }
      }

      setShowModal(false);
      setEditingTask(null);
      setOriginalAssignee(null);
    }
  };

  const handleDeleteTask = async () => {
    if (editingTask && editingTask.id) {
      if (!isPersonalWorkspace && !currentProjectMemberSpecialty?.deleteTask) {
        return;
      }
      await deleteTask(editingTask.id);
      setShowModal(false);
      setEditingTask(null);
    }
  };

  return (
    <div className={styles.backlogContainer}>
      <div className={styles.backlogColumns}>
        {columns.map((column) => {
          const columnTasks = enrichedTasks.filter(
            (task) => task.columnId === column.id,
          );
          return (
            <div
              key={column.id}
              className={styles.backlogColumn}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id!)}
            >
              <h3 className={styles.columnTitle}>
                <span
                  className={`${styles.statusDot} ${
                    styles[
                      `statusDot-${column.status
                        .toLowerCase()
                        .replace("_", "-")}`
                    ]
                  }`}
                ></span>
                {column.name}
                <span className={styles.taskCount}>{columnTasks.length}</span>
              </h3>
              <div className={styles.columnTasks}>
                {columnTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <p>No tasks here</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleEditTask(task)}
                      onDragStart={() => handleDragStart(task)}
                      openModal={false}
                      onOpenTaskModal={() => handleEditTask(task)}
                    />
                  ))
                )}
              </div>
              {(isPersonalWorkspace ||
                currentProjectMemberSpecialty?.createTask) && (
                <button
                  className={styles.addTaskButton}
                  onClick={() => handleAddTask(column.id!)}
                >
                  <PlusIcon />
                  Add Item
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showModal && editingTask && (
        <div className={styles.createTaskModalOverlay}>
          <div className={styles.createTaskModal}>
            <h2 className={styles.createTaskModal__title}>
              {editingTask.id ? "Edit Task" : "Create Task"}
            </h2>

            <div className={styles.createTaskModal__inputGroup}>
              <label className={styles.createTaskModal__label}>Title:</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="Enter task title"
                className={`${styles.createTaskModal__input} ${
                  !editingTask.title.trim()
                    ? styles.createTaskModal__inputError
                    : ""
                }`}
              />
              {!editingTask.title.trim() && (
                <span className={styles.createTaskModal__errorMessage}>
                  Title is required
                </span>
              )}
            </div>

            <div className={styles.createTaskModal__inputGroup}>
              <label className={styles.createTaskModal__label}>
                Description:
              </label>
              <textarea
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
                placeholder="Enter task description"
                className={styles.createTaskModal__input}
              />
            </div>

            <div className={styles.createTaskModal__inputRow}>
              <div className={styles.createTaskModal__inputGroup}>
                <label className={styles.createTaskModal__label}>
                  Assigned to:
                </label>
                <select
                  value={editingTask.assigneeId ?? ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      assigneeId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className={styles.createTaskModal__input}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.username}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className={styles.createTaskModal__actions}>
              {editingTask.id &&
                (isPersonalWorkspace ||
                  currentProjectMemberSpecialty?.deleteTask) && (
                  <button
                    className={styles.createTaskModal__buttonDelete}
                    onClick={handleDeleteTask}
                  >
                    Delete
                  </button>
                )}
              <div className={styles.createTaskModal__actionButtons}>
                <button
                  className={styles.createTaskModal__buttonCancel}
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setOriginalAssignee(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.createTaskModal__buttonCreate}
                  onClick={handleSaveTask}
                  disabled={!editingTask.title.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanView;