# Mysql-Terminal-Tool

Tool designed to make database manipulation easier

## Getting Started

### Setting config

You can set your database credentials in the file config.json. Notice how the first parameter is "enabled". If enabled is set to true then Mysql-Terminal-Tool will auto log you in using the specified credentials in config.json. If enabled is set to false then Mysql-Terminal-Tool will display a login screen at startup

```
{ 
	"enabled": true,
	"username" : "root",
	"password": "root_pass",
	"database": "database_name"
}

```

### Using the app

Once you are logged in you should see a list of tables in the selected database

1. Select a table

2. Select an option

3. Press load to show data based on option

![](https://raw.githubusercontent.com/munroe7/Mysql-Terminal-Tool/master/img/overview.gif)


#### Insertion

When creating a database entry, the user can enter a value into one or more of the given inputs.

![](https://raw.githubusercontent.com/munroe7/Mysql-Terminal-Tool/master/img/insert.gif)

#### Removal

When removing database entries, the user must follow these rules:

Multiple columns can have conditionals and values
If a column has a conditional then it must have a value or vise vera
Conditionals must match one of the following: <, >, <=, >=, =

![](https://raw.githubusercontent.com/munroe7/Mysql-Terminal-Tool/master/img/removal.gif)


## Built With

* blessed
* mysql
* mysql-assistant


## Authors

* **Sam Munroe**

## License

This project is licensed under the MIT License