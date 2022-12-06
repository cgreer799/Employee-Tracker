const mysql = require('mysql2');
const promise = require('promise-mysql2');
const table = require("console.table");
const inquirer = require("inquirer");

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MYpdrmmbr1!'
});

const promiseconnection = promise.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MYpdrmmbr1!'
  });


function createdb(){
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

function createSchema(){
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
//Creating Database and Schema
createdb();
createSchema();

async function insertIntoDepartmentTable(name){
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: "Please provide the name for this department."
        }
    ]).then(async (data) => {
        name = data.name;
        await connection.promise().query("INSERT INTO `department` (name) values ("+name+")").then(() => {
            console.log("Succesfully added the " + name + " department to the database");
            }).then(() => {
                NextPrompt();
            });
    });
}
async function insertIntoRoleTable(title,salary,departmentId){
    const [departmentrows] = await connection.promise().query('SELECT * FROM `role`');
    const departmentarray =[];
    for (var i=0;i<departmentrows.length;i++){
        departmentarray.push((i+1)+" "+departmentrows[i].name.toString());
    }
    departmentarray.push("No Department");
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: "Please provide the title for this role."
        },
        {
            type: 'input',
            name: 'salary',
            message: "Please provide the salary for this role."
        },
        {
            type: 'list',
            name: 'departmentname',
            message: "Please select the department for this role.",
            choices: departmentarray
        }
    ]).then(async (data)=>{
        title = data.title;
        salary = data.salary;
        if(data.departmentname == "No Department") {
            departmentId = 'NULL';
        }
        else {
            departmentId = data.departmentname.charAt(0);
        }
        await connection.promise().query("INSERT INTO `role` (title,salary,departmentId) values ("+title+","+salary+","+departmentId+")").then(() => {
            console.log("Succesfully added the " + title + " role to the database");
            }).then(() => {
                NextPrompt();
            });
    });
}

async function insertIntoEmployeeTable(firstName,lastName,roleId,managerId){
    const [rolerows] = await connection.promise().query('SELECT * FROM `role`');
    const rolesarray =[];
    for (var i=0;i<rolerows.length;i++){
        rolesarray.push((i+1)+" "+rolerows[i].title.toString());
    }
    const [employeerows] = await connection.promise().query('SELECT * FROM `employee`');
    const namessarray =[];
    for (var i=0;i<employeerows.length;i++){
        namessarray.push((i+1)+" "+employeerows[i].firstName.toString()+" "+employeerows[i].firstName.toString());
    }
    namessarray.push("No Manager/Employee is a Manager")
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
            name: 'roletitle',
            message: "Please provide the employee's role.",
            choices: rolesarray
        },
        {
            type: 'list',
            name: 'managername',
            message: "Please provide the employee's manager.",
            choices: namessarray
        }
        
    ]).then(async (data)=>{
        firstName = data.firstName;
        lastName = data.lastName;
        roleId = data.roletitle.charAt(0);
        if(data.managername == "No Manager/Employee is a Manager") {
            managerId = 'NULL';
        }
        else {
            managerId = data.managername.charAt(0);
        }
        
        await connection.promise().query("INSERT INTO `employee` (firstName,lastName,roleId,managerId) values ('"+firstName+"','"+lastName+"',"+roleId+","+managerId+")").then(() => {
            console.log("Succesfully added " + firstName + " " + lastName + " to the database");
        }).then(() => {
            NextPrompt();
        });
    });
}

async function getAllFromDepartmentTable(){
    connection.query('SELECT * FROM `department`',
    function(err, results) {
        if (err) throw err;
        console.table(results);
        NextPrompt();
    });
}

async function getAllFromRoleTable(){
    connection.query('SELECT * FROM `role`',
    function(err, results) {
        if (err) throw err;
        console.table(results);
        NextPrompt();
    });
}

async function getAllFromEmployeeTable(){
    connection.query('SELECT * FROM `employee`',
    function(err, results) {
        if (err) throw err;
        console.table(results);
        NextPrompt();
    });
    
}

function MainMenuPrompt() {
    inquirer.prompt([
        {
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
    }
    ]).then((data) => {
        switch (data.options) {
            case "View All Employees":
                getAllFromEmployeeTable();
                break;
            case "View Roles":
                getAllFromRoleTable();
                break;
            case "View Departments":
                getAllFromDepartmentTable();
                break;
            case "Add an Employee":
                insertIntoEmployeeTable();
                break;
            case "Add a Role":
                insertIntoRoleTable();
                break;
            case "Add a department":
                insertIntoDepartmentTable();
                break;
            case "Finish":
                console.log("Done...");
                connection.end();
                break;
        }
    });
}
function NextPrompt() {
    inquirer.prompt([{
        type: "list",
        name: "NextPrompt",
        message: "Return to the main menu?",
        choices: [
            "Yes",
            "No"
        ]
    }]).then((data) => {
            if (data.NextPrompt == "Yes") {
                MainMenuPrompt();
            } else {
                console.log("Application terminated");
                connection.end();
            }
    });
}

MainMenuPrompt();
