import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useTasks = () => {
  const createTask = useMutation(api.tasks.create);

  const tasks = useQuery(api.tasks.list) ?? [];

  const removeTask = useMutation(api.tasks.remove);

  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);

  return { tasks, createTask, removeTask, updateTaskStatus };
};
