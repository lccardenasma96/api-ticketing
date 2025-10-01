const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

let supportIndex = 0;

router.post('/', (req, res) => {
  const { user_id, title, description } = req.body;

  const generateCode = () => {
    return 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const code = generateCode();


  db.all(`SELECT username FROM users WHERE role = 'soporte'`, [], (err, supports) => {
    if (err || supports.length === 0) {
      return res.status(500).json({ error: 'No hay soportes disponibles para asignar' });
    }

  
    const assignedSupport = supports[supportIndex % supports.length].username;
    supportIndex = (supportIndex + 1) % supports.length;

    db.run(
      `INSERT INTO requests (user_id, title, description, code, status, support_name) 
       VALUES (?, ?, ?, ?, 'pendiente', ?)`,
      [user_id, title, description, code, assignedSupport],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get(`SELECT * FROM requests WHERE id = ?`, [this.lastID], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        });
      }
    );
  });
});

router.get('/', (req, res) => {
  const { user_id, role } = req.query;
  let sql = 'SELECT * FROM requests';
  let params = [];

  if (role === 'cliente') {
    sql += ' WHERE user_id = ?';
    params.push(user_id);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


router.put('/:id', authMiddleware, (req, res) => {
  const { status, response } = req.body;

  db.run(
    'UPDATE requests SET status = ?, response = ? WHERE id = ?',
    [status, response, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get('SELECT * FROM requests WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

module.exports = router;
