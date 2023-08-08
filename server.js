const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'abc123',
  database: 'employee_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the employee_db database.');
  // Start the server after the database connection is established
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const listQuestion = {
  type: 'list',
  name: 'action',
  message: 'What would you like to do?',
  choices: [
    'View all employees',
    'Add employee',
    'Update employee role',
    'View all roles',
    'Add role',
    'View all departments',
    'Add department',
  ],
};

// Handle user's choice
function handleUserChoice(choice) {
  switch (choice) {
    case 'View all employees':
      // Implement viewAllEmployees function to fetch and display all employees
      db.query('SELECT * FROM employee', function (err, results) {
        if (err) {
          console.error('Error fetching employees:', err);
          return;
        }
        console.log(results);
      });
      break;

    case 'Add employee':
      // Implement addEmployee function to add a new employee
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'first_name',
            message: "Enter the employee's first name:",
          },
          {
            type: 'input',
            name: 'last_name',
            message: "Enter the employee's last name:",
          },
          {
            type: 'list',
            name: 'role_id',
            message: "What is the employee's role?",
            choices: [
              'Sales Lead',
              'Salesperson',
              'Lead Engineer',
              'Software Engineer',
              'Account Manager',
              'Accountant',
              'Legal Team Lead',
              'Lawyer',
            ],
          },
        ])
        .then((answers) => {
          // Insert the user input into the employee table
          db.query(
            'INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)',
            [answers.first_name, answers.last_name, answers.role_id],
            function (err, results) {
              if (err) {
                console.error('Error adding employee:', err);
              } else {
                console.log('Employee added successfully!');
                console.log(results);
              }
            }
          );
        })
        .catch((error) => {
          console.error('Error occurred:', error);
        });
      break;

    case 'Update employee role':
      // Fetch the list of employees and their roles from the database
      db.query(
        'SELECT e.id, e.first_name, e.last_name, r.title FROM employee e INNER JOIN role r ON e.role_id = r.id',
        function (err, employeeResults) {
          if (err) {
            console.error('Error fetching employees:', err);
            return;
          }

          // Fetch the list of roles from the database
          db.query('SELECT id, title FROM role', function (err, roleResults) {
            if (err) {
              console.error('Error fetching roles:', err);
              return;
            }

            // Map employeeResults to create employeeChoices with formatted names and roles
            const employeeChoices = employeeResults.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name} - ${employee.title}`,
              value: employee.id,
            }));

            // Map roleResults to create roleChoices with only role titles
            const roleChoices = roleResults.map((role) => role.title);

            // Prompt the user to select an employee and a new role from the lists
            inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'employee_id',
                  message: 'Select the employee to update:',
                  choices: employeeChoices,
                },
                {
                  type: 'list',
                  name: 'new_role_id',
                  message: "Select the employee's new role:",
                  choices: roleChoices,
                },
              ])
              .then((answers) => {
                const { employee_id, new_role_id } = answers;

                // Update the employee's role in the database
                db.query(
                  'UPDATE employee SET role_id = ? WHERE id = ?',
                  [new_role_id, employee_id],
                  function (err, results) {
                    if (err) {
                      console.error('Error updating employee role:', err);
                    } else {
                      console.log('Employee role updated successfully!');
                    }
                  }
                );
              })
              .catch((error) => {
                console.error('Error occurred:', error);
              });
          });
        }
      );
      break;

    case 'View all roles':
      // Implement viewAllRoles function to fetch and display all roles
      db.query('SELECT * FROM role', function (err, results) {
        if (err) {
          console.error('Error fetching roles:', err);
          return;
        }
        console.log(results);
      });
      break;

    case 'Add role':
      // Fetch the list of departments from the database
      db.query('SELECT id, name FROM department', function (err, departmentResults) {
        if (err) {
          console.error('Error fetching departments:', err);
          return;
        }

        // Create choices for department selection
        const departmentChoices = departmentResults.map((department) => ({
          name: department.name,
          value: department.id,
        }));

        // Prompt the user to enter role details and select a department
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'title',
              message: "Enter the role's title:",
            },
            {
              type: 'input',
              name: 'salary',
              message: "Enter the role's salary:",
            },
            {
              type: 'list',
              name: 'department_id',
              message: "Select the department for the role:",
              choices: departmentChoices,
            },
          ])
          .then((answers) => {
            // Insert the new role into the database
            db.query(
              'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
              [answers.title, answers.salary, answers.department_id],
              function (err, results) {
                if (err) {
                  console.error('Error adding role:', err);
                } else {
                  console.log('Role added successfully!');
                  console.log(results);
                }
              }
            );
          })
          .catch((error) => {
            console.error('Error occurred:', error);
          });
      });
      break;

    case 'View all departments':
      // Implement viewAllDepartments function to fetch and display all departments
      db.query('SELECT * FROM department', function (err, results) {
        if (err) {
          console.error('Error fetching departments:', err);
          return;
        }
        console.log(results);
      });
      break;

    case 'Add department':
      // Implement addDepartment function to add a new department
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: "Enter the department's name:",
          },
        ])
        .then((answers) => {
          // Insert the new department into the database
          db.query(
            'INSERT INTO department (name) VALUES (?)',
            [answers.name],
            function (err, results) {
              if (err) {
                console.error('Error adding department:', err);
              } else {
                console.log('Department added successfully!');
                console.log(results);
              }
            }
          );
        })
        .catch((error) => {
          console.error('Error occurred:', error);
        });
      break;

    default:
      console.log('Invalid choice.');
  }
}

// Prompt the user for action using Inquirer
function promptUser() {
  inquirer
    .prompt([listQuestion])
    .then((answers) => {
      handleUserChoice(answers.action);
    })
    .catch((error) => {
      console.error('Error occurred:', error);
    });
}

// Start the prompt after the database connection is established
db.on('connect', () => {
  promptUser();
});

// Close the database connection when the server is closed
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err);
    } else {
      console.log('Database connection closed.');
      process.exit(0);
    }
  });
});

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});
