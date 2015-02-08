var fs = require('fs'),
    http = require('http'),
    sio = require('socket.io');
var bind = require('bind');
var dispatcher = require('httpdispatcher');
var addonDisplay = require('/Termostato/node_modules/AddonMatrix/build/Release/addon');
var addonThermo = require('/Termostato/node_modules/AddonThermo/build/Release/addon');
var calendar = require('/Termostato/Controllers/calendar.js');
var dashboard = require('/Termostato/Controllers/dashboard.js');

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
	print();
var	displayInterval = setInterval(print, 20000);
	
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
    	displayInterval = setInterval(print, 20000);	
	});	
        
	setInterval(function(){
		socket.emit('sensorsValues', getSensorsValues() );
	}, 2000);
    
});

dispatcher.setStatic('resources');
dispatcher.setStaticDirname('/root/NodeJs/Matrix8x8_TextThermostat');

dispatcher.onGet("/HomePage", function (req, res) {
	//fermo il display
	if(displayInterval != undefined)
    {
		clearInterval(displayInterval);
	}

	console.log("HomePage get");
    bind.toFile('/root/NodeJs/Matrix8x8_TextThermostat/template/pageMain.tpl', calendar.myCalendar ,
        function (data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
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
