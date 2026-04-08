const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// READ: Get all items
app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM items', [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json(rows);
  });
});

// CREATE: Create a new item
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ "error": "Name is required" });
    return;
  }
  
  const sql = 'INSERT INTO items (name, description) VALUES (?,?)';
  const params = [name, description || ''];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      id: this.lastID, 
      name, 
      description: description || '' 
    });
  });
});

// UPDATE: Update an item
app.put('/api/items/:id', (req, res) => {
  const { name, description } = req.body;
  const id = req.params.id;
  
  const sql = 'UPDATE items SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?';
  const params = [name, description, id];
  
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      id: parseInt(id), 
      name, 
      description 
    });
  });
});

// DELETE: Delete an item
app.delete('/api/items/:id', (req, res) => {
  db.run('DELETE FROM items WHERE id = ?', req.params.id, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ message: "deleted", id: parseInt(req.params.id) });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
