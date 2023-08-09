const db = require('./database');
const inquirerPrompts = require('./inquirerPrompts');
const Table = require('cli-table3');

const functions = {

    table: new Table(),

    viewAllEmployees: () => {
        db.query('SELECT * FROM employee', (err, results) => {
          if (err) {
            console.error('Error fetching employees:', err);
            return;
          }
          
          // Clear the table data before adding new rows
          functions.table.length = 0;
    
          functions.table.push(['ID', 'First Name', 'Last Name', 'Role ID']);
          results.forEach((employee) => {
            functions.table.push([employee.id, employee.first_name, employee.last_name, employee.role_id]);
          });
          
          console.log(functions.table.toString());
        });  
      },
  
    addEmployee: () => {
        inquirerPrompts.addEmployeePrompt().then((answers) => {
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
        }).catch((error) => {
          console.error('Error occurred:', error);
        });
      },

      updateEmployeeRole: () => {
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
      },

      viewAllRoles: () => {
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
        });
      },

    addRole: () => {
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
                  }
                }
              );
            })
            .catch((error) => {
              console.error('Error occurred:', error);
            });
        });
      },

      viewAllDepartments: () => {
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
        });
      },

    addDepartment: () => {
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
            }
          }
        );
      })
      .catch((error) => {
        console.error('Error occurred:', error);
      });
  },
  
  handleUserChoice: (choice) => {
    switch (choice) {
      case 'View all employees':
        // Use the viewAllEmployeesPrompt from inquirerPrompts
        functions.viewAllEmployees();
        break;

      case 'Add employee':
        // Use the addEmployeePrompt from inquirerPrompts
        inquirerPrompts.addEmployeePrompt();
        break;

      case 'Update employee role':
        // Use the updateEmployeeRolePrompt from inquirerPrompts
        inquirerPrompts.updateEmployeeRolePrompt();
        break;

      case 'View all roles':
        // Use the viewAllRolesPrompt from inquirerPrompts
        functions.viewAllRoles();
        break;

      case 'Add role':
        // Use the addRolePrompt from inquirerPrompts
        inquirerPrompts.addRolePrompt();
        break;

      case 'View all departments':
        // Use the viewAllDepartmentsPrompt from inquirerPrompts
        functions.viewAllDepartments();
        break;

      case 'Add department':
        // Use the addDepartmentPrompt from inquirerPrompts
        inquirerPrompts.addDepartmentPrompt();
        break;

      default:
        console.log('Invalid choice.');
    }
  }

    };

    module.exports = functions;