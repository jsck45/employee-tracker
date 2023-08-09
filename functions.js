const db = require('./database');
const inquirerPrompts = require('./inquirerPrompts');
const Table = require('cli-table3');

const functions = {

    table: new Table(),

    viewAllEmployees: (promptUserFunction) => {
        const query = `
          SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary
          FROM employee e
          INNER JOIN role r ON e.role_id = r.id
          INNER JOIN department d ON r.department_id = d.id
        `;
    
        db.query(query, (err, results) => {
          if (err) {
            console.error('Error fetching employees:', err);
            return;
          }
    
          const table = new Table({
            head: ['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary'],
            colWidths: [5, 15, 15, 20, 20, 10],
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
            ]);
          });
    
          console.log(table.toString());
          console.log('\n'); 
          // After displaying the table, prompt the user back to the main menu
          promptUserFunction();
        });
      },
    
      addEmployee: (promptUserFunction) => {
        inquirerPrompts.addEmployeePrompt().then((answers) => {
          const { first_name, last_name, role_id } = answers;
      
          // Retrieve the role ID based on the selected role title
          db.query('SELECT id FROM role WHERE title = ?', [role_id], function (err, roleResults) {
            if (err) {
              console.error('Error fetching role ID:', err);
              return;
            }
      
            if (roleResults.length === 0) {
              console.error('Role not found:', role_id);
              return;
            }
      
            const roleId = roleResults[0].id;
      
            // Insert the employee with the correct role ID
            db.query(
              'INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)',
              [first_name, last_name, roleId],
              function (err, results) {
                if (err) {
                  console.error('Error adding employee:', err);
                } else {
                  console.log('Employee added successfully!');
                  console.log(results);
                  promptUserFunction();
                }
              }
            );
          });
        }).catch((error) => {
          console.error('Error occurred:', error);
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
    
          functions.table.push(['ID', 'Title', 'Salary', 'Department ID']);
          results.forEach((role) => {
            functions.table.push([role.id, role.title, role.salary, role.department_id]);
          });
          
          console.log(functions.table.toString());
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
                    console.log('Role added successfully!');
                    console.log(results);
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
    
          // Clear the table data before adding new rows
          functions.table.length = 0;
    
          functions.table.push(['ID', 'Name']);
          results.forEach((department) => {
            functions.table.push([department.id, department.name]);
          });
    
          console.log(functions.table.toString());
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
              console.log('Department added successfully!');
              console.log(results);
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