const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// connect to database
const db  = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Conneced to the election database');
})


app.get('/', (req, res) => {
    res.json({
        message:'Hello World'
    });
})

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