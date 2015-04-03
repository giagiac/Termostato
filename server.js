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
var fileWriter = require('Controllers/fileWriter');

var matrix = {};

var GLOBAL_DELAY = 6000;
var logCounter = 0;

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
var displayInterval = setInterval(print, GLOBAL_DELAY);

// Attach the socket.io server
var io = sio.listen(server);

io.sockets.on('connection', function (socket) {

    //fermo il display
    if (displayInterval != undefined) {
        clearInterval(displayInterval);
    }

    //STOP perdo la connessione riattivo il display
    socket.on('disconnect', function () {
        displayInterval = setInterval(print, GLOBAL_DELAY);
    });

    setInterval(function () {
        socket.emit('sensorsValues', getSensorsValues());
    }, GLOBAL_DELAY);

    setInterval(function () {
        socket.emit('clock', getCurrentDate());
    }, GLOBAL_DELAY);
});

dispatcher.setStatic('resources');
dispatcher.setStaticDirname('/Termostato');

dispatcher.onGet("/HomePage", function (req, res) {
    //fermo il display
    if (displayInterval != undefined) {
        clearInterval(displayInterval);
    }
    console.log("HomePage get");
    bind.toFile('/Termostato/template/pageMain.tpl', calendar.myCalendar,
        function (data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
});

dispatcher.onGet("/ChartPage", function (req, res) {
    //fermo il display
    if (displayInterval != undefined) {
        clearInterval(displayInterval);
    }
    console.log("ChartPage get");
    bind.toFile('/Termostato/template/pageChart.tpl', "",
        function (data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
});

//SET SYSTEM DATE
dispatcher.onPost("/setSystemDate", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    setSystemDate(req.params.date);
    //	console.log(req.params.date);
    res.end("ok");
});

//SENSOR VALUE
dispatcher.onGet("/getSensorValue", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var sensorValue = JSON.stringify(getSensorsValues());
    res.end(sensorValue);
});

//HEATINGSYSTEM
dispatcher.onGet("/getHeatingSystem", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var heatingSystemStatus = JSON.stringify(dashboard.HeatingSystem.getParam());
    res.end(heatingSystemStatus);
});
dispatcher.onGet("/setHeatingSystem", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var heatingSystemStatus = JSON.stringify(dashboard.HeatingSystem.toggleParam());
    res.end(heatingSystemStatus);
});

//DISPLAYLIGHT
dispatcher.onPost("/setDisplayLight", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var displayLightStatus = JSON.stringify(dashboard.DisplayLight.setParam(req.params));
    res.end(JSON.stringify(displayLightStatus));
});
dispatcher.onPost("/getDisplayLight", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var displayLightStatus = JSON.stringify(dashboard.DisplayLight.getParam());
    res.end(displayLightStatus);
});

//SEASON
dispatcher.onPost("/setSeason", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var seasonStatus = JSON.stringify(dashboard.Season.setSeason(req.params));
    res.end(seasonStatus);
});
dispatcher.onPost("/getSeason", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var seasonStatus = JSON.stringify(dashboard.Season.getParam());
    res.end(seasonStatus);
});

//SCHEDULE
dispatcher.onPost("/setSchedule", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var data = req.params;
    var calendarStatus = JSON.stringify(calendar.add(data));
    res.end(calendarStatus);
});
dispatcher.onPost("/getSchedule", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var calendarStatus = JSON.stringify(calendar.myCalendar);
    res.end(calendarStatus);
});
//GRAPH -> Disegno andamento temperature
//http://192.168.1.5:8000/getLog?date=2015-31-2&name=temperature
dispatcher.onGet("/getLog", function (req, res) {
    var startDate = req.params.date;
    var logFileName = req.params.name;

    if (startDate != undefined && logFileName != undefined) {
        res.writeHead(200, { "Content-Type": "plain/text" });
        var directory = './store/logs/' + startDate + '/' + logFileName + '.log';
        var logText = fileWriter.readText(directory);
        var array = logText.substring(0, logText.length - 1); //tolgo la virgola alla fine
        res.end('[' + array + ']');
    }
    else { res.end("[]"); }
});

//REMOVE
dispatcher.onPost("/removeSchedule", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var data = req.params;
    var calendarStatus = JSON.stringify(calendar.remove(data));
    res.end(calendarStatus);
});

// ------------------ HELPER FUNCTIONS ------------------------------

function getSensorsValues() {
    var p = addonThermo.ReadTemperatureUmidity(22, 4);

    var roundTemp = Math.round(p.temperatura * 100) / 100;
    var roundUmid = Math.round(p.umidita * 100) / 100;

    writeLogTempHumid(roundTemp, roundUmid);

    return { temp: roundTemp, umid: roundUmid };
}

function setSystemDate(date) {
    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("date -s \"" + date + "\"", puts);
}

function getCurrentDate() {
    var currentDate = new Date();
    var current = "" + currentDate.getHours() + ":" + currentDate.getMinutes();
    if (currentDate.getDay() == 0) {
        current += " " + "Sunday";
    }
    if (currentDate.getDay() == 1) {
        current += " " + "Monday";
    }
    if (currentDate.getDay() == 2) {
        current += " " + "Tuesday";
    }
    if (currentDate.getDay() == 3) {
        current += " " + "Wednesday";
    }
    if (currentDate.getDay() == 4) {
        current += " " + "Thursday";
    }
    if (currentDate.getDay() == 5) {
        current += " " + "Friday";
    }
    if (currentDate.getDay() == 6) {
        current += " " + "Saturday";
    }
    return current;
}

function print() {
    var p = getSensorsValues();

    matrix.text = "t:" + p.temp + " ";
    matrix.text += "u:" + p.umid + " ";
    matrix.velocity = 10;
    matrix.color = 'green';
    matrix.reverse = false;

    var output = addonDisplay.write(matrix.velocity, matrix.color, matrix.reverse, matrix.text);
}

function writeLogTempHumid(temperature, humidity) {
    //ogni minuto (vedi GLOBAL_DELAY)
    if ((logCounter % 10) == 0) {
        fileWriter.appendLog("/Termostato/store/logs", "temperature.log", new Date(), temperature + ',');
        fileWriter.appendLog("/Termostato/store/logs", "humidity.log", new Date(), humidity + ',');
    }//if
    logCounter++;
}//writeLogTempHumid
