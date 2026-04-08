// test comment made from the dev branch

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:3001/api/items';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDesc, setTempDesc] = useState('');

  // States for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      // Wait, let's verify if the backend returns {data: rows} or just rows.
      // In server.js we changed it from {message: 'success', data: rows} 
      // to `res.json(rows);` when we wrote it. But earlier when we wrote the implementation plan we had `{data: rows}`.
      // Let's check `App.jsx` what it had. It had `setItems(response.data)`.
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async () => {
    const name = tempName || `Item ${Math.floor(Math.random() * 1000)}`;
    const description = tempDesc || `A generic item description ${new Date().toLocaleTimeString()}`;

    try {
      await axios.post(API_URL, { name, description });
      fetchItems();
      setTempName('');
      setTempDesc('');
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleRead = () => {
    fetchItems();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDesc(item.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) {
      alert("Name is required!");
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}`, { name: editName, description: editDesc });
      fetchItems();
      cancelEdit();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const updateRandomItem = async () => {
    if (items.length === 0) return alert("Read some items first or create one to update!");
    const randomItem = items[Math.floor(Math.random() * items.length)];
    startEdit(randomItem);
  };

  const deleteRandomItem = async () => {
    if (items.length === 0) return alert("Read some items first or create one to delete!");
    const randomItem = items[Math.floor(Math.random() * items.length)];
    handleDelete(randomItem.id);
  };

  return (
    <div className="app-container">
      <h1>React CRUD Ops</h1>

      <div className="controls">
        <input
          placeholder="New Item Name (optional)"
          value={tempName}
          onChange={e => setTempName(e.target.value)}
        />
        <input
          placeholder="New Item Description (optional)"
          value={tempDesc}
          onChange={e => setTempDesc(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button className="btn-secondary" onClick={handleCreate}>Create</button>
        <button className="btn-primary" onClick={handleRead}>Read</button>
        <button className="btn-warning" onClick={updateRandomItem}>Update Random</button>
        <button className="btn-danger" onClick={deleteRandomItem}>Delete Random</button>
      </div>

      <div className="items-container">
        {loading ? (
          <p className="empty-state">Loading items...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">No items found. Create one!</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="item-card">
              {editingId === item.id ? (
                <div className="item-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Item Name"
                  />
                  <input
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Item Description"
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => saveEdit(item.id)}>Save</button>
                    <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="item-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-warning" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(item.id)}>X</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
