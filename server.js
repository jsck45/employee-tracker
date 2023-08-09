const express = require('express');
const db = require('./database');
const inquirerPrompts = require('./inquirerPrompts');
const functions = require('./functions');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Start the server after the database connection is established
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  // Start the server
  app.listen(PORT, () => {
    console.log('\nNow listening on port', PORT);
    startApp(); // Call startApp() after the server starts listening
  });
});

function promptUser() {
  inquirerPrompts.start().then((answers) => {
    console.clear();
    functions.handleUserChoice(answers.action, promptUser, () => {
      // Close the database connection and exit the process
      db.end((err) => {
        if (err) {
          console.error('Error closing database connection:', err);
        } else {
          console.log('Database connection closed. Goodbye!');
          process.exit(0);
        }
      });
    });
  });
}


function startApp() {
  console.log('\nWelcome to the Employee Management System!\n');
  promptUser();
}

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});
