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

// Function to view all employees
function viewAllEmployees() {
  db.query('SELECT * FROM employee', (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return;
    }
    console.log(results);
  });
}

// Function to add a new employee
function addEmployee() {
    inquirer .prompt([
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
}

// Function to update employee role
function updateEmployeeRole() {
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
    }

// Function to view all roles
function viewAllRoles() {
    db.query('SELECT * FROM role', function (err, results) {
        if (err) {
          console.error('Error fetching roles:', err);
          return;
        }
        console.log(results);
      });
    }

// Function to add a new role
function addRole() {
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
    }

// Function to view all departments
function viewAllDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
          console.error('Error fetching departments:', err);
          return;
        }
        console.log(results);
      });
    }

// Function to add a new department
function addDepartment() {
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
}

// Handle user's choice
function handleUserChoice(choice) {
  switch (choice) {
    case 'View all employees':
      viewAllEmployees();
      break;

    case 'Add employee':
      addEmployee();
      break;

    case 'Update employee role':
      updateEmployeeRole();
      break;

    case 'View all roles':
      viewAllRoles();
      break;

    case 'Add role':
      addRole();
      break;

    case 'View all departments':
      viewAllDepartments();
      break;

    case 'Add department':
      addDepartment();
      break;

    default:
      console.log('Invalid choice.');
  }
}

// Prompt the user for action using Inquirer
function promptUser() {
  inquirer
    .prompt([
      {
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
      },
    ])
    .then((answers) => {
      handleUserChoice(answers.action);

      // Prompt the user again for the next action
      promptUser();
    })
    .catch((error) => {
      console.error('Error occurred:', error);
    });
}

// Start the server after the database connection is established
db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      process.exit(1);
    }
    console.log('Connected to the employee_db database.');
  
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Prompt the user for action using Inquirer
      promptUser();
    });
  });  

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});
