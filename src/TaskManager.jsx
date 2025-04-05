import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [editingTask, setEditingTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In the useEffect or at the top of your component
  useEffect(() => {
    console.log('TaskManager component mounted');
    fetchTasks();
  }, []);

  // Fetch all tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Tasks fetched:', data);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // CREATE: Add a new task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority
          }
        ])
        .select();

      if (error) throw error;
      
      // Add the new task to the state
      if (data) {
        setTasks([data[0], ...tasks]);
      }
      
      // Reset the form
      setNewTask({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  // UPDATE: Start editing a task
  const handleEditClick = (task) => {
    setEditingTask({ ...task });
    setIsEditing(true);
  };

  // UPDATE: Save edited task
  const handleUpdateTask = async () => {
    if (!editingTask.title.trim()) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id);

      if (error) throw error;
      
      // Update the task in the state
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...editingTask, updated_at: new Date().toISOString() } : task
      ));
      
      setIsEditing(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // DELETE: Remove a task
  const handleDeleteTask = async (id) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove the task from the state
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for new task form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  // Handle input changes for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTask({ ...editingTask, [name]: value });
  };

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading && <div className="loading-indicator">Loading task manager...</div>}
      
      {/* CREATE: Form to add new task */}
      <div className="task-form">
        <h2>Add New Task</h2>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={newTask.title}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Task Description"
          value={newTask.description}
          onChange={handleInputChange}
        />
        <select
          name="priority"
          value={newTask.priority}
          onChange={handleInputChange}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onClick={handleAddTask} disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      {/* UPDATE: Form to edit task */}
      {isEditing && (
        <div className="edit-form">
          <h2>Edit Task</h2>
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={editingTask.title}
            onChange={handleEditInputChange}
          />
          <textarea
            name="description"
            placeholder="Task Description"
            value={editingTask.description}
            onChange={handleEditInputChange}
          />
          <select
            name="priority"
            value={editingTask.priority}
            onChange={handleEditInputChange}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="edit-buttons">
            <button onClick={handleUpdateTask} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* READ: Display list of tasks */}
      <div className="task-list">
        <h2>Your Tasks</h2>
        {loading && !isEditing && <p>Loading tasks...</p>}
        {!loading && tasks.length === 0 ? (
          <p>No tasks yet. Add a task to get started!</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-card priority-${task.priority}`}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <div className="task-meta">
                <span className="priority">Priority: {task.priority}</span>
                <span className="date">Created: {new Date(task.created_at).toLocaleDateString()}</span>
                {task.updated_at && (
                  <span className="date">Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
                )}
              </div>
              <div className="task-actions">
                <button onClick={() => handleEditClick(task)}>Edit</button>
                <button onClick={() => handleDeleteTask(task.id)} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;