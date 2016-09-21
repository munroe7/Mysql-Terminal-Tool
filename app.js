var blessed = require('blessed');
var mysqlAssistant = require("Mysql-Assistant");
var config = require('./config.json');

var database = '';
var selectedTable = '';
var columns = [];
var conditionals = [];
var valid = true;
var validOperators = ['<', '>', '>=', '<=', '='];


//Establish screen
var screen = blessed.screen({
  smartCSR: true,
});

//app background
var bg = blessed.box({
	screen: login,
  left: 0,
  top: 0,
  right: 0,
  left: 0,
  style: {
    bg: 'lightblue'
  },
  content: 'Database Assistant'
});

//Main login form. Parent of all login elements. 
var login = blessed.form({
	parent: bg,
  top: 'center',
  left: 'center',
  width: 50,
  height: 18,
  border: {
    type: 'line',
    fg: '#ffffff'
  },
  style: {
    fg: 'white',
    bg: 'magenta'
  },
  align: 'center',
  content: 'Login:',
  tags: true
});

//Login warning container. Displays error messages.
var loginWarning = blessed.box({
        parent: login,
        top: 2,
        left: 2,
        right: 2,
        height: 2,
        content: '',
        style:{
          bg: 'magenta'
        }
    });

//User field for database login
var loginUser = blessed.textbox({
  parent: login,
  border: 'line',
  style: {
    bg: 'magenta',
    border: {
      type: 'line',
      fg: 'white',
      bg: 'magenta'
    }
  },
  height: 3,
  width: 20,
  left: 2,
  top: 4,
  label: 'Username:',
  name: 'user',
  mouse: true,
  keys: true
});

//password field for login
var loginPassword = blessed.textbox({
  parent: login,
  border: 'line',
  style: {
    bg: 'magenta',
    border: {
      type: 'line',
      fg: 'white',
      bg: 'magenta'
    }
  },
  height: 3,
  width: 20,
  right: 2,
  top: 4,
  label: 'Password:',
  name: 'password',
  mouse: true,
  keys: true,
  censor: true
});

//database field for login
var loginDatabase = blessed.textbox({
  parent: login,
  border: 'line',
  style: {
    bg: 'magenta',
    border: {
      type: 'line',
      fg: 'white',
      bg: 'magenta'
    }
  },
  height: 3,
  right: 2,
  left: 2,
  top: 8,
  label: 'Database Name:',
  name: 'database',
  mouse: true,
  keys: true,
});

//submit button for login
var loginSubmit = blessed.button({
  parent: login,
  content: 'Login',
  align: 'center',
  bottom: 1,
  left: 'center',
  height: 3,
  width: 9,
  border: 'line',
  style:{
    bg: 'magenta',
    border:{
      type: 'line',
      bg: 'magenta',
      fg: 'white'
    },
    hover:{
      border:{
        fg: 'lightblue'
      }
    }
  }
});

//main app
var dashboard = blessed.form({
  padding: 2,
  left: 0,
  top: 0,
  right: 0,
  left: 0,
  style: {
    bg: 'magenta'
  },
  content: 'Database Assistant'	
});

//list of tables
var dashTables = blessed.list({
	parent: dashboard,
	height: 18,
	width: 32,
	top: 2,
	left: 3,
	shadow: true,
	padding: 2,
	mouse: true,
	keys: true,
  scrollbar: {
      bg: 'magenta'
  },
	style: {
		bg: 'blue',
    selected:{
      bg: 'magenta'
    },
	},
  name: 'tableList'
});

//what needs to be done on dash - contains string
var dashFunction = blessed.box({
	parent: dashboard,
	height: 5,
	width: 57,
	left: 39,
	top: 2,
	padding: 2,
	mouse: true,
	keys: true,
	shadow: true,
	content: "1. Select a table",
	style: {
		bg: 'blue'
	},
});

//Dash function buttons....remove...insert
var dashTableOptions = blessed.box({
	parent: dashboard,
  mouse: true,
  keys: true,
  vi: true,
	height: 8,
	width: 32,
	top: 22,
	left: 3,
	shadow: true,
	padding: 2,
	style: {
		bg: 'blue'
	},
  clickable: true,
  hidden: true
});

//table insert option
var radioInsert = blessed.radiobutton({
  parent: dashTableOptions,
  mouse: true,
  keys: true,
  shrink: true,
  style: {
    bg: 'blue'
  },
  height: 1,
  left: 0,
  top: 0,
  name: 'radioInsert',
  content: 'Create Entry'
});

//table remove option
var radioRemove = blessed.radiobutton({
  parent: dashTableOptions,
  mouse: true,
  keys: true,
  shrink: true,
  style: {
    bg: 'blue'
  },
  height: 1,
  left: 0,
  top: 2,
  name: 'radioRemove',
  content: 'Remove Entry',
});

//submit the dashboard
var dashSubmit = blessed.button({
  parent: dashboard,
  content: 'Load',
  top: 32,
  left: 3,
  height: 3,
  hidden: true,
  shadow: true,
  width: 32,
  align: 'center',
  padding: 1,
  style:{
    bg: 'blue',
    // hover:{
    //   border:{
    //     fg: 'lightblue'
    //   }
    // }
  }
});

//contains all inputs and main functionality 
var dashWorkspace = blessed.form({
  parent: dashboard,
  width: 57,
  height: 25,
  left: 39,
  top: 10,
  padding: 2,
  mouse: true,
  keys: true,
  shadow: true,
  style: {
    bg: 'blue'
  },
  scrollbar: {
      bg: 'magenta'
  },
  hidden: true,
  scrollable: true,
  content: ''

});

//submit button for workspace
var workspaceSubmit = blessed.button({
  parent: dashFunction,
  content: 'Submit',
  top: 'center',
  right: 2,
  height: 3,
  width: 9,
  border: 'line',
  style:{
    bg: 'magenta',
    border:{
      type: 'line',
      bg: 'magenta',
      fg: 'white'
    },
    hover:{
      border:{
        fg: 'lightblue'
      }
    }
  },
  hidden: true
});

//----------------EVENT LISTENERS-----------------------

//fill in the username if focused
loginUser.on('focus', function() {
  loginUser.readInput();
});

//fill in the password if focused
loginPassword.on('focus', function() {
  loginPassword.readInput();
});

//fill in the database name if focused
loginDatabase.on('focus', function(){
  loginDatabase.readInput();
});

//trigger submit  action
loginSubmit.on('click', function(){
  login.submit();
});

//login box action triggered
login.on('submit', function(data){
  resetLogin();
  //create the connection
  mysqlAssistant.connect(data.user, data.password, data.database, function(callback){
    //if callback is true then an error was found
    if(callback){
      //display warning to user
      loginWarning.content = callback;
      if(callback == "ER_BAD_DB_ERROR"){
        loginDatabase.style.border.fg = 'red'
      }else if (callback == "ER_ACCESS_DENIED_ERROR"){
        loginUser.style.border.fg = 'red'
        loginPassword.style.border.fg = 'red'
      }
      screen.render();
    //if no errors found then render dashboard
    }else{
      //prep the dashboard
    	loadDashboard(callback.database);    	
    }
  });
});

dashTables.on('select', function(data){
  dashTableOptions.show();
  dashFunction.content = '2. Select an option';
	this.screen.render();
});

radioInsert.on('check', function(){
  dashFunction.content = '3. Press Load to continue...';
  this.screen.render();
  dashSubmit.show();
  workspaceSubmit.hide();
});

radioRemove.on('check', function(){
  dashFunction.content = '3. Press Load to continue...';
  this.screen.render();
  dashSubmit.show();
  workspaceSubmit.hide();
});

dashSubmit.on('click', function(){
  //clear all rendered inputs
  clearWorkspace();
  dashboard.submit();
});

dashboard.on('submit', function(data){
  workspaceSubmit.show();
  dashWorkspace.show();
  //List tables for insertion
  if(radioInsert.checked){ 
    //set instructions
    dashFunction.content = 'Press submit to insert entry ->';
    dashWorkspace.content = 'Please fill in the following fields';
    //get columns in table
    mysqlAssistant.getTableColumns(data.tableList, function(data){
      //create a dynamic input for each column
      for(i=0; i<data.length; i++){
        columns[i] = blessed.textbox({
          parent: dashWorkspace,
          border: 'line',
          style: {
            bg: 'blue',
            border: {
              type: 'line',
              fg: 'yellow',
              bg: 'blue',
            },
            title: {
              bg: 'blue'
            },
          },
          height: 3,
          right: 2,
          left: 2,
          top: (4*i)+3,
          label: data[i].Field,
          name: data[i].Field,
          mouse: true,
          keys: true, 
        });
        //create event listeners for each object
        columns[i].on('focus', function(){
          this.readInput();
          screen.render();
        });
      }
      //render the screen after all inputs have been created
      screen.render();
    });
  }

  //Create a conditional and value input for each column
  if(radioRemove.checked){
    //set instructions
    dashFunction.content = 'Press submit to remove entry ->';
    dashWorkspace.content = 'Fill in a conditional followed by a value';

    mysqlAssistant.getTableColumns(data.tableList, function(data){
      //get columns in table
      for(i=0; i<data.length; i++){
        //create a dynamic conditional input for each column
        conditionals[i] = blessed.textbox({
          parent: dashWorkspace,
          border: 'line',
          style: {
            bg: 'blue',
            border: {
              type: 'line',
              fg: 'yellow',
              bg: 'blue',
            },
            title: {
              bg: 'blue'
            },
          },
          width: 15,
          height: 3,
          left: 2,
          top: (4*i)+3,
          label: 'condition',
          name: data[i].Field,
          mouse: true,
          keys: true, 
        });
        //create event listeners for each object
        conditionals[i].on('focus', function(){
          this.readInput();
          screen.render();
        });

        //create a dynamic value input for each column
        columns[i] = blessed.textbox({
          parent: dashWorkspace,
          border: 'line',
          style: {
            bg: 'blue',
            border: {
              type: 'line',
              fg: 'yellow',
              bg: 'blue',
            },
            title: {
              bg: 'blue'
            },
          },
          width: 25,
          height: 3,
          left: 18,
          top: (4*i)+3,
          label: data[i].Field,
          name: data[i].Field,
          mouse: true,
          keys: true, 
        });
        //create event listeners for each object
        columns[i].on('focus', function(){
          this.readInput();
          screen.render();
        });
      }
      //render the screen after all inputs have been created
      screen.render();
    });
  }
});

workspaceSubmit.on('click', function(){
  dashWorkspace.submit();
});

//When you submit a task on the dashboard
dashWorkspace.on('submit', function(data){

  //if insert button was checked
  if(radioInsert.checked){
    clearInputs(columns);
    mysqlAssistant.tableInsert(dashTables.value, data, function(callback){
      showMessage(callback);
    });
  }

  //if remove button was checked
  if(radioRemove.checked){
    //set valid to true by default
    valid = true
    //reset all inputs
    clearInputs(columns);
    clearInputs(conditionals);
    var tempArr = [];
    //loop through all inputs
    for(field in data){
      //if conditional and value entered
      if(data[field][0] && data[field][1]){
        if(inArray(validOperators, data[field][0])){
          tempArr.push({'column': field,'conditional': data[field][0], 'value': data[field][1]})
        }else{
          dashWorkspace.content = 'An invalid conditional was entered. Read docs for info';
          valid = false;
        }
      //if both were empty then leave alone
      }else if(!data[field][0] && !data[field][1]){
      //only one was entered
      }else{
        dashWorkspace.content = 'Both conditional and value must be entered';
        valid = false;
      }
    }

    if(valid){
      mysqlAssistant.tableRemove(dashTables.value, tempArr, function(callback){
        showMessage(callback);
      });
    }
    screen.render();
  }
});


//----------------EVENT LISTENERS END-----------------------

//check if config is enabled
if(config.enabled){
  checkConfig(config);
}

//append background to screen
screen.append(bg);
screen.render();


// Quit on Escape, q, or Control-C. 
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  //IMPORTANT: destroy() removes all event listeners from memory
  this.destroy();
  return process.exit(0);
});


//--------------Functions------------------------

//Every login attempt should clear all error messages and text box styling. 
function resetLogin(){
  loginDatabase.style.border.fg = 'white'
  loginPassword.style.border.fg = 'white'
  loginUser.style.border.fg = 'white'
  loginWarning.content = '';
}

//data is equal to the selected database
function loadDashboard(data){
  //set global database
  database = data;
  //hide the login
  screen.remove(login);
  //append the dashboard object to the main screen
  screen.append(dashboard);
  //populate the tables list
  mysqlAssistant.listTables(function(callback){
    //add tables to dashboard list
  	dashTables.setItems(callback);
  	//render the dashboard
    screen.render();
  });
}

function checkConfig(config){
  mysqlAssistant.connect(config.username, config.password, config.database, function(data){
    if(data){
      loginWarning.content = data;
      if(data == "ER_BAD_DB_ERROR"){
        loginDatabase.style.border.fg = 'red'
      }else if (data == "ER_ACCESS_DENIED_ERROR"){
        loginUser.style.border.fg = 'red'
        loginPassword.style.border.fg = 'red'
      }
      screen.render();
    }else{
      loadDashboard(data.database);     
    }
  });
}

//clear all inputs generated in workspace
function clearWorkspace(){
  var len = 0;
  dashWorkspace.content = '';
  if(columns){
    len = columns.length;
    while(len--){
      dashWorkspace.remove(columns[len]);
    }
  }
  if(conditionals){
    len = conditionals.length;
    while(len--){
      dashWorkspace.remove(conditionals[len]);
    }
  }
  screen.render();
}



//function to check if value in array
function inArray(array, value){
  arrLength = array.length;
  //While loop in reverse is the fastest way to loop through an array
  while(arrLength--){
    if(value == array[arrLength]){
      return true;
    }
  }
  return false;
}

//pass an array of inputs
function clearInputs(inputs){
  for(i=0; i<inputs.length; i++){
    inputs[i].value = '';
  }
  screen.render();
}

function showMessage(message){
  dashWorkspace.content = message;
  setTimeout(function(){
    dashWorkspace.content = '';
    screen.render();
  }, 1500);
}