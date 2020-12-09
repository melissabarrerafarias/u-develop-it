const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const inputCheck = require('./utils/inputCheck');
const db = require('./db/database');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
})

// Get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

// request candidate by id
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id 
                WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: row
        });
    });
});

app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

        if (errors) {
        res.status(400).json({ error: errors });
        return;
        }
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
  
    db.run(sql, params, function(err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: req.body,
        changes: this.changes
      });
    });
  });

// route for all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: rows
      });
    });
  });

  // id param for a single party
  app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: row
      });
    });
  });

// delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});

// delete a party
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
  
      res.json({ message: 'successfully deleted', changes: this.changes });
    });
  });

// create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use `this`
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});



// default response for any other request(Not Found) Catch all (make sure this is the last route above the listener or else it will override all others)
app.use((req, res) => {
    res.status(404).end();
})

// start server after db connection
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});



// verbose sets the execution mode to verbose to produce messages in the terminal regarding the state of the runtime. This feature can help explain what the application is doing,
// specifically SQLite. 


// const db  = new sqlite3.Database('./db/election.db', err => {
//     if (err) {
//         return console.error(err.message);
//     }

//     console.log('Conneced to the election database');
// })
// We created a new object, db. This instance was created with the election.db file. The callback function informs us if there's an error in the connection. 


// db.all(`SELECT * FROM candidates`, (err, rows) => {
//     console.log(rows);
// });
// in this code, the db object is using the all() method. this method runs the SQL query and executes the callback with all the resulting rows that match the query. Once it is executed, 
// the callback function captures the responses from the query in two variables: the err, which is the error response, and rowws, which is the database query response. IF there are no
// errors, the err value is null. This method is the key component that allowd SQL commands to be written in a Node.js application. 


// db.run(`DELETE FROM candidates WHERE id = ?`, 1, function(err, result){
//     if(err) {
//         console.log(err);
//     }
//     console.log(result, this, this.changes);
// });
// The method run() will execute an SQL query but won't retrieve any result data. 
// The question mark denotes a placeholder, making this a PREPARED STATEMENT. Prepared statements can have placeholders that can be filled in dynamically with real values at runtime. 
// An additional param argument can provide values for prepared statement placeholders. Here, we are hardcoding 1 temporarily to demonstrate how prepared statements work. If we need 
// additional placeholders, the param argument can be an array that hold multiple values. 
// An ES5 function is used for the callback. This allows us to take advantage of the database object that's returned in the callback function. 