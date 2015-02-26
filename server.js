var http = require('http');
var sio = require('/Termostato/node_modules/socket.io');
var bind = require('/Termostato/node_modules/bind');
var dispatcher = require('/Termostato/node_modules/httpdispatcher');
var addonDisplay = require('/Termostato/node_modules/AddonMatrix/build/Release/addon');
var addonThermo = require('/Termostato/node_modules/AddonThermo/build/Release/addon');
var calendar = require('/Termostato/node_modules/Controllers/calendar.js');
var dashboard = require('/Termostato/node_modules/Controllers/dashboard.js');
var sys = require('sys')
var exec = require('child_process').exec;

var matrix = {};

var server = http.createServer(function (req, res) {
    dispatcher.dispatch(req, res);
});
    
server.listen(8000, function () {	
	console.log('Server listening at http://localhost:8000/');
});

//BEGIN DISPLAY
var output = addonDisplay.begin(1, 112, 0);
	console.log(output);
	output = addonThermo.begin();
	console.log(output);

//START DISPLAY
var	displayInterval = setInterval(print, 10000);
	
// Attach the socket.io server
var io = sio.listen(server);

io.sockets.on('connection', function (socket) {

	//fermo il display
	if(displayInterval != undefined)
    {
		clearInterval(displayInterval);
	}
	
	//STOP perdo la connessione riattivo il display
	socket.on('disconnect', function(){
    	displayInterval = setInterval(print, 5000);	
	});	
        
	setInterval(function(){
		socket.emit('sensorsValues', getSensorsValues() );
	}, 2000);
	
	setInterval(function(){
		socket.emit('clock', getCurrentDate() );
	}, 3000);
});

dispatcher.setStatic('resources');
dispatcher.setStaticDirname('/Termostato');

dispatcher.onGet("/HomePage", function (req, res) {
	//fermo il display
	if(displayInterval != undefined)
    {
		clearInterval(displayInterval);
	}
	console.log("HomePage get");
    bind.toFile('/Termostato/template/pageMain.tpl', calendar.myCalendar ,
        function (data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
});

//SET SYSTEM DATE
dispatcher.onPost("/setSystemDate", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	setSystemDate(req.params.date);
//	console.log(req.params.date);
    res.end( "ok" );
});

//SENSOR VALUE
dispatcher.onGet("/getSensorValue", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var sensorValue = JSON.stringify( getSensorsValues() );
    res.end( sensorValue );
});

//HEATINGSYSTEM
dispatcher.onGet("/getHeatingSystem", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var heatingSystemStatus = JSON.stringify( dashboard.HeatingSystem.getParam() );
    res.end( heatingSystemStatus );
});
dispatcher.onGet("/setHeatingSystem", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var heatingSystemStatus = JSON.stringify( dashboard.HeatingSystem.toggleParam() );
    res.end( heatingSystemStatus );
});

//DISPLAYLIGHT
dispatcher.onPost("/setDisplayLight", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var displayLightStatus = JSON.stringify( dashboard.DisplayLight.setParam(req.params) );
    res.end( JSON.stringify( displayLightStatus ) );
});
dispatcher.onPost("/getDisplayLight", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var displayLightStatus = JSON.stringify( dashboard.DisplayLight.getParam() );
    res.end( displayLightStatus );
});

//SEASON
dispatcher.onPost("/setSeason", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var seasonStatus = JSON.stringify( dashboard.Season.setSeason(req.params) );
    res.end( seasonStatus );
});
dispatcher.onPost("/getSeason", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var seasonStatus = JSON.stringify( dashboard.Season.getParam() );
    res.end( seasonStatus );
});

//SCHEDULE
dispatcher.onPost("/setSchedule", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var data = req.params;
	var calendarStatus = JSON.stringify( calendar.add(data) );
    res.end( calendarStatus );
});
dispatcher.onPost("/getSchedule", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var calendarStatus = JSON.stringify( calendar.myCalendar );
    res.end( calendarStatus );
});

//REMOVE
dispatcher.onPost("/removeSchedule", function (req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var data = req.params;
	var calendarStatus = JSON.stringify( calendar.remove(data) );
    res.end( calendarStatus );
});

// ------------------ HELPER FUNCTIONS ------------------------------

function getSensorsValues()
{
	var p = addonThermo.ReadTemperatureUmidity(22, 4);			
   	
   	var roundTemp = Math.round(p.temperatura * 100) / 100;
    var roundUmid = Math.round(p.umidita * 100) / 100;
    
    return { temp: roundTemp, umid: roundUmid };
}

function setSystemDate(date)
{
	function puts(error, stdout, stderr) { sys.puts(stdout) }
	exec("date -s \"" + date + "\"", puts);
}

function getCurrentDate()
{
	var currentDate = new Date();
	var current = ""+currentDate.getHours() + ":" + currentDate.getMinutes();
    if(currentDate.getDay() == 0)
    {
    	current += " " + "Sunday";
    }
    if(currentDate.getDay() == 1)
    {
    	current += " " + "Monday";
    }
    if(currentDate.getDay() == 2)
    {
    	current += " " + "Tuesday";
    }
    if(currentDate.getDay() == 3)
    {
    	current += " " + "Wednesday";
    }
    if(currentDate.getDay() == 4)
    {
    	current += " " + "Thursday";
    }
    if(currentDate.getDay() == 5)
    {
    	current += " " + "Friday";
    }
    if(currentDate.getDay() == 6)
    {
    	current += " " + "Saturday";
    }
    return current;
}

function print()
{
	var p = addonThermo.ReadTemperatureUmidity(22, 4);			
   	
   	var roundTemp = Math.round(p.temperatura * 100) / 100;
    var roundUmid = Math.round(p.umidita * 100) / 100;
    	
    	matrix.text = "t:" + roundTemp + " ";
    	matrix.text += "u:" + roundUmid + " ";
    	matrix.velocity = 1;
    	matrix.color = 'green';
    	matrix.reverse = false;
    
    var output = addonDisplay.write(matrix.velocity, matrix.color, matrix.reverse, matrix.text);
}
