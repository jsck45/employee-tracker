const inquirer = require('inquirer');

const prompts = {
  start: () => {
    return inquirer.prompt([
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
          'Exit'
        ],
      },
    ]);
  },

  addEmployeePrompt: (roleChoices, managerChoices) => {
    return inquirer.prompt([
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
        choices: roleChoices,
      },
      {
        type: 'list',
        name: 'manager_id',
        message: "Select the employee's manager:",
        choices: managerChoices,
      },
    ]);
  },

  updateEmployeeRolePrompt: (employeeChoices, roleChoices) => {
    return inquirer.prompt([
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
    ]);
  },

  addRolePrompt: (departmentChoices) => {
    return inquirer.prompt([
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
    ]);
  },

  addDepartmentPrompt: () => {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: "Enter the department's name:",
      },
    ]);
  }
};

module.exports = prompts;