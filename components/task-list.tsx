"use client";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@clerk/nextjs";
export function TaskList() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { tasks, createTask } = useTasks();
  const { userId } = useAuth();
  const handleSubmit = async () => {
    //e.preventDefault();
    if (!newTaskTitle.trim()) return;
    console.log("newTaskTitle", newTaskTitle);
    try {
      /*      const data = await createTask({
        title: newTaskTitle,
        userId: userId!,
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }); */
      setNewTaskTitle(""); // Clear input on success
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="New task title"
        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={handleSubmit}
        type="submit"
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Add Task
      </button>

      <ul className="w-full max-w-md space-y-2">
        {tasks.map((task) => (
          <li
            key={task?._id}
            className="flex items-center gap-3 p-2 rounded-md bg-background hover:bg-accent transition-colors"
          >
            <input
              type="checkbox"
              checked={false}
              onChange={() => {}}
              className="h-4 w-4 rounded border-primary/50"
            />
            <span className={""}>{task.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
