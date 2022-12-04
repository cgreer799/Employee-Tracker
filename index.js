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
    connection.query('DROP TABLE IF EXISTS department;')
    connection.query('CREATE TABLE department(id INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,name VARCHAR(30) NOT NULL);')
}

function insertIntoDepartmentTable(){
    connection.query('INSERT INTO `department` (id, name) values (1, `Sales`)');
}

function getAllFromDepartmentTable(){
    connection.query('SELECT * FROM `department`',
    function(err, results, fields) {
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
    });
}

createdb();
createSchema();
insertIntoDepartmentTable();
getAllFromDepartmentTable();
