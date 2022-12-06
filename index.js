const mysql = require('mysql2');
const table = require("console.table");
const inquirer = require("inquirer");

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MYpdrmmbr1!'
});

// simple query
async function createdb(){
    connection.query('DROP DATABASE IF EXISTS employeedb;' , 
    function (err, result) {
        if (err) throw err;
        console.log("Database Dropped");
      });
    connection.query('CREATE DATABASE employeedb;' , 
    function (err, result) {
        if (err) throw err;
        console.log("Database Created");
      });
    connection.query('USE employeedb;');
}

async function createSchema(){
    connection.query('DROP TABLE IF EXISTS department;');
    connection.query('DROP TABLE IF EXISTS role;');
    connection.query('DROP TABLE IF EXISTS employee;');
    connection.query(`
    CREATE TABLE department(
        id INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(30) NOT NULL);`
    );
    connection.query(`
    CREATE TABLE role (
        id  INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(30) UNIQUE NOT NULL,
        salary DECIMAL NOT NULL,
        departmentId INTEGER UNSIGNED,
        INDEX departmentIndex (departmentId),
        CONSTRAINT departmentFK FOREIGN KEY (departmentId) REFERENCES department(id));`
    );
    connection.query(`
    CREATE TABLE employee (
        id  INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        firstName VARCHAR(30) NOT NULL,
        lastName VARCHAR(30) NOT NULL,
        roleId INTEGER UNSIGNED,
        INDEX roleIndex (roleId),
        CONSTRAINT roleFK FOREIGN KEY (roleId) REFERENCES role(id),
        managerId INTEGER UNSIGNED,
        INDEX managerIndex (managerId),
        CONSTRAINT managerFK FOREIGN KEY (managerId) REFERENCES employee(id));`
    );
}

async function insertIntoDepartmentTable(name){
    connection.query("INSERT INTO `department` (name) values ("+name+")",
    function (err, result) {
        if (err) throw err;
        console.log(result);
    });
}
async function insertIntoRoleTable(title,salary,departmentId){
    connection.query("INSERT INTO `role` (title,salary,departmentId) values ("+title+","+salary+","+departmentId+")",
    function (err, result) {
        if (err) throw err;
        console.log(result);
    });
}
async function insertIntoEmployeeTable(firstName,lastName,roleId,managerId){
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "Please provide the employee's first name."
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Please provide the employee's last name."
        },
        {
            type: 'list',
            name: 'roleId',
            message: "Please provide the employee's role.",
            choices: []
        },
        {
            type: 'input',
            name: 'managerId',
            message: "Please provide the employee's manager."
        }
]);
    connection.query("INSERT INTO `employee` (firstName,lastName,roleId,managerId) values ("+firstName+","+lastName+","+roleId+","+managerId+")",
    function (err, result) {
        if (err) throw err;
        console.log(result);
    });
}

async function getAllFromDepartmentTable(){
    connection.query('SELECT * FROM `department`',
    function(err, results) {
        if (err) throw err;
        console.table(results);
    });
    NextPrompt();
}

async function getAllFromRoleTable(){
    connection.query('SELECT * FROM `role`',
    function(err, results) {
        if (err) throw err;
        console.table(results);
    });
    NextPrompt();
}
async function getRolesFromRoleTable(){
    connection.query('SELECT title FROM `role`',
    function (err, result) {
        if (err) throw err;
        console.log(result);
    });    
}
async function getAllFromEmployeeTable(){
    connection.query('SELECT * FROM `employee`',
    function(err, results) {
        if (err) throw err;
        console.table(results);
    });
    NextPrompt();
}

function MainMenuPrompt() { 
    inquirer.prompt([{
        type: "list",
        name: "options",
        message: "Select an option",
        choices: [
            "View All Employees",
            "View Roles",
            "View Departments",
            "Add an Employee",
            "Add a Role",
            "Add a department",
            "Finish",
        ]
    }]).then(async (data) => {
        switch (data.options) {
        case "View All Employees":
            await getAllFromEmployeeTable();
            break;
        case "View Roles":
            await getAllFromRoleTable();
            break;
        case "View Departments":
            await getAllFromDepartmentTable();
            break;
        case "Add an Employee":
            await insertIntoEmployeeTable();
            break;
        case "Add a Role":
            await insertIntoRoleTable();
            break;
        case "Add a department":
            await insertIntoDepartmentTable();
            break;
        case "Finish":
            console.log("Done...");
            connection.end();
            break;
        default:
            console.log("default");
        }
    });
}
function NextPrompt() {
    inquirer.prompt([{
        name: "NextPrompt",
        type: "options",
        message: "Return to the main menu?",
        choices: [
            "Yes",
            "No"
        ]
}]).then((data) => {
      if (data.options == "yes") {
        MainMenuPrompt();
      } else {
        console.log("Application terminated");
        connection.end();
      }
});
}
createdb();
createSchema();
/*


getAllFromDepartmentTable();
*/
insertIntoDepartmentTable("'Sales'");
insertIntoRoleTable("'Manager'",100.01,1);
getRolesFromRoleTable();
connection.end();
