const db = require('./database');
const inquirerPrompts = require('./inquirerPrompts');
const Table = require('cli-table3');

const functions = {

    table: new Table(),

    viewAllEmployees: (promptUserFunction) => {
        const query = `
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            r.title,
            d.name AS department,
            r.salary,
            IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'NULL') AS manager
          FROM employee e
          INNER JOIN role r ON e.role_id = r.id
          INNER JOIN department d ON r.department_id = d.id
          LEFT JOIN employee m ON e.manager_id = m.id
        `;
      
        db.query(query, (err, results) => {
          if (err) {
            console.error('Error fetching employees:', err);
            return;
          }
      
          const table = new Table({
            head: ['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager'],
            colWidths: [5, 15, 15, 20, 20, 10, 20],
            wordWrap: true,
          });
      
          results.forEach((employee) => {
            table.push([
              employee.id,
              employee.first_name,
              employee.last_name,
              employee.title,
              employee.department,
              employee.salary,
              employee.manager,
            ]);
          });
      
          console.log(table.toString());
          console.log('\n'); 
          // After displaying the table, prompt the user back to the main menu
          promptUserFunction();
        });
      },
    
      addEmployee: (promptUserFunction) => {
        // Fetch the list of roles from the database
        db.query('SELECT id, title FROM role', function (err, roleResults) {
          if (err) {
            console.error('Error fetching roles:', err);
            return;
          }
      
          const roleChoices = roleResults.map((role) => role.title);
      
          // Fetch the list of managers from the database
          db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee', function (err, managerResults) {
            if (err) {
              console.error('Error fetching managers:', err);
              return;
            }
      
            const managerChoices = [
              { name: 'None', value: null },
              ...managerResults.map((manager) => ({
                name: manager.manager_name,
                value: manager.id,
              })),
            ];
      
            inquirerPrompts.addEmployeePrompt(roleChoices, managerChoices).then((answers) => {
              const { first_name, last_name, role_id, manager_id } = answers;
      
              // Find the actual role_id associated with the selected role title
              const selectedRole = roleResults.find((role) => role.title === role_id);
              if (!selectedRole) {
                console.error('Selected role not found.');
                return;
              }
      
              // Insert the employee with the correct role ID and manager ID
              db.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                [first_name, last_name, selectedRole.id, manager_id],
                function (err, results) {
                  if (err) {
                    console.error('Error adding employee:', err);
                  } else {
                    console.log(`Employee ${first_name} ${last_name} added successfully!`);
                    promptUserFunction();
                  }
                }
              );
            }).catch((error) => {
              console.error('Error occurred:', error);
            });
          });
        });
      },
      
      
      updateEmployeeRole: (promptUserFunction) => {
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
      
              const employeeChoices = employeeResults.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name} - ${employee.title}`,
                value: employee.id,
              }));
      
              const roleChoices = roleResults.map((role) => role.title);
      
              inquirerPrompts
                .updateEmployeeRolePrompt(employeeChoices, roleChoices)
                .then((answers) => {
                  const { employee_id, new_role_id } = answers;
      
                  // Find the actual role_id associated with the selected role title
                  const selectedRole = roleResults.find((role) => role.title === new_role_id);
                  if (!selectedRole) {
                    console.error('Selected role not found.');
                    return;
                  }
      
                  // Update the employee's role in the database
                  db.query(
                    'UPDATE employee SET role_id = ? WHERE id = ?',
                    [selectedRole.id, employee_id],
                    function (err, results) {
                      if (err) {
                        console.error('Error updating employee role:', err);
                      } else {
                        console.log('Employee role updated successfully!');
                        promptUserFunction();
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
      },
      

      viewAllRoles: (promptUserFunction) => {
        db.query('SELECT * FROM role', function (err, results) {
          if (err) {
            console.error('Error fetching roles:', err);
            return;
          }
      
          // Clear the table data before adding new rows
          functions.table.length = 0;
      
          const table = new Table({
            head: ['ID', 'Title', 'Salary', 'Department ID'],
            colWidths: [5, 20, 15, 15], // Adjust these widths as needed
            wordWrap: true,
          });
      
          results.forEach((role) => {
            table.push([role.id, role.title, role.salary, role.department_id]);
          });
      
          console.log(table.toString());
          console.log('\n');
          promptUserFunction();
        });
      },

      addRole: (promptUserFunction) => {
        db.query('SELECT id, name FROM department', function (err, departmentResults) {
          if (err) {
            console.error('Error fetching departments:', err);
            return;
          }
      
          const departmentChoices = departmentResults.map((department) => ({
            name: department.name,
            value: department.id,
          }));
      
          inquirerPrompts
            .addRolePrompt(departmentChoices)
            .then((answers) => {
              db.query(
                'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
                [answers.title, answers.salary, answers.department_id],
                function (err, results) {
                  if (err) {
                    console.error('Error adding role:', err);
                  } else {
                    console.log(`Role "${answers.title}" added successfully!`);
                    promptUserFunction();
                  }
                }
              );
            })
            .catch((error) => {
              console.error('Error occurred:', error);
            });
        });
      },     

      viewAllDepartments: (promptUserFunction) => {
        db.query('SELECT * FROM department', function (err, results) {
          if (err) {
            console.error('Error fetching departments:', err);
            return;
          }
      
          functions.table.length = 0;
      
          const table = new Table({
            head: ['ID', 'Name'],
            colWidths: [5, 20], // Adjust these widths as needed
            wordWrap: true,
          });
      
          results.forEach((department) => {
            table.push([department.id, department.name]);
          });
      
          console.log(table.toString());
          console.log('\n');
          promptUserFunction();
        });
      },

      addDepartment: (promptUserFunction) => {
        inquirerPrompts
          .addDepartmentPrompt()
          .then((answers) => {
            db.query(
              'INSERT INTO department (name) VALUES (?)',
              [answers.name],
              function (err, results) {
                if (err) {
                  console.error('Error adding department:', err);
                } else {
                  console.log(`Department "${answers.name}" added successfully!`);
                  promptUserFunction();
                }
              }
            );
          })
          .catch((error) => {
            console.error('Error occurred:', error);
          });
      },      
  
  handleUserChoice: (choice, promptUserFunction, exitCallback) => {
    if (choice === 'Exit') {
      exitCallback();
      return; // Exit the function
    }
  
    switch (choice) {
      case 'View all employees':
        functions.viewAllEmployees(promptUserFunction);
        break;
      case 'Add employee':
        functions.addEmployee(promptUserFunction);
        break;
      case 'Update employee role':
        functions.updateEmployeeRole(promptUserFunction);
        break;
      case 'View all roles':
        functions.viewAllRoles(promptUserFunction);
        break;
      case 'Add role':
        functions.addRole(promptUserFunction);
        break;
      case 'View all departments':
        functions.viewAllDepartments(promptUserFunction);
        break;
      case 'Add department':
        functions.addDepartment(promptUserFunction);
        break;
      default:
        console.log('Invalid choice.');
        promptUserFunction();
    }
  }
};

    module.exports = functions;