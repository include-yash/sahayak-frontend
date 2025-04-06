// contexts/TodoContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (todo: Todo) => Promise<void>; // Changed to accept Todo object
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTodos();
    }
  }, [isAuthenticated, token]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data);
    } catch (error) {
      console.error("Failed to fetch todos", error);
    }
  };

  const addTodo = async (todo: Todo) => { // Now accepts full Todo object
    try {
      const response = await axios.post(
        `${API_URL}/todos`,
        todo, // Send the complete todo object
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, response.data]);
    } catch (error) {
      console.error("Failed to add todo", error);
      throw error; // Re-throw to handle in the component
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      await axios.put(
        `${API_URL}/todos/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, ...updates } : todo
      ));
    } catch (error) {
      console.error("Failed to update todo", error);
      throw error;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(
        `${API_URL}/todos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo", error);
      throw error;
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo, toggleTodo }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
};