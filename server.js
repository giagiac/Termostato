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

var GLOBAL_DELAY_CUSTOM_TEXT = 600;
var GLOBAL_DELAY = 6000;
var GLOBAL_DELAY_SENSOR = 3000;
var GLOBAL_DELAY_CHECK_SCHEDULE = 10000;
var logCounter = 0;
var currentTempUmid;

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
var sensorValueInterval = setInterval(getSensorsValues, GLOBAL_DELAY_SENSOR);
var logInterval = setInterval(writeLogTempHumid, GLOBAL_DELAY); //scrive il log ogni minuto % 10
var checkScheduleInterval = setInterval(checkSchedule, GLOBAL_DELAY_CHECK_SCHEDULE);
var customTextInterval;

// Attach the socket.io server
var io = sio.listen(server);

io.sockets.on('connection', function (socket) {

    //STOP perdo la connessione riattivo il display
    socket.on('disconnect', function () {
        console.log("SONO DISCONNESSO");
        dashboard.DisplayLight.setParam('{"tempUmid": "true"}');
    });

    setInterval(function () {
        socket.emit('sensorsValues', currentTempUmid);
    }, GLOBAL_DELAY);

    setInterval(function () {
        socket.emit('clock', getCurrentDate());
    }, GLOBAL_DELAY);
});

dispatcher.setStatic('resources');
dispatcher.setStaticDirname('/Termostato');

dispatcher.onGet("/HomePage", function (req, res) {
    console.log("HomePage get");
    bind.toFile('/Termostato/template/pageMain.tpl', calendar.myCalendar,
        function (data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
            dashboard.DisplayLight.setParam('{"alwaysOn": "true"}');
        });
});

dispatcher.onGet("/ChartPage", function (req, res) {
    console.log("ChartPage get");
    bind.toFile('/Termostato/template/pageChart.tpl', "",
        function (data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
            dashboard.DisplayLight.setParam('{"alwaysOn": "true"}');
        });
});

//SET SYSTEM DATE
dispatcher.onPost("/setSystemDate", function (req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    setSystemDate(req.params.date);
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
    res.end(displayLightStatus);
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
    console.log(startDate + " - " + logFileName);
    if (startDate != undefined && logFileName != undefined) {
        res.writeHead(200, { "Content-Type": "plain/text" });
        var directory = '/Termostato/store/logs/' + startDate + '/' + logFileName + '.log';
        console.log(directory);
        var logText = fileWriter.readText(directory);
        var array = logText.substring(0, logText.length - 1); //tolgo la virgola alla fine
        res.end('[' + array + ']');
    }
    else { res.end("[]"); }
});
dispatcher.onPost("/setCustomText", function (req, res) {

    dashboard.CustomText.setObject(req.params);
    dashboard.DisplayLight.setParam({ "customText": 'true' }); //dice di avviare la modalità customText

    res.writeHead(200, { "Content-Type": "application/json" });
    var response = JSON.stringify({"response":"ok"});
    res.end(response);
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

    currentTempUmid = { temp: roundTemp, umid: roundUmid };
}

function setSystemDate(date) {
    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("date -s \"" + date + "\"", puts);
}

function getCurrentDate() {
    var currentDate = new Date();
    var current = "" + setZeros(currentDate.getHours()) + ":" + setZeros(currentDate.getMinutes());
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
}//getCurrentDate
function setZeros(val) {
    return ("" + val).length > 1 ? val : '0' + val;
}//setZeros

function printTempUmid() {
    var text = "t:" + currentTempUmid.temp + " ";
        text += "u:" + currentTempUmid.umid + " ";
    var velocity = 1;

    var timeSpanCalculated = GLOBAL_DELAY_CUSTOM_TEXT * text.length * velocity;
    console.log(timeSpanCalculated);
    customTextInterval = setInterval(function () {
        var text = "t:" + currentTempUmid.temp + " ";
            text += "u:" + currentTempUmid.umid + " ";
        var velocity = 1;
        var color = 'green';
        reverse = false;

        var output = addonDisplay.write(velocity, color, reverse, text);
        console.log(output);
    }, timeSpanCalculated);
}

function printCustomText() {
    var jsonObject = dashboard.CustomText.getObject(); //carico il testo settato in precedenza

    var timeSpanCalculated = GLOBAL_DELAY_CUSTOM_TEXT * jsonObject.text.length * jsonObject.delay;
    console.log(timeSpanCalculated);
    customTextInterval = setInterval(function () {

        var text = jsonObject.text + " ";
        var delay = parseInt(jsonObject.delay, 10);
        var color = jsonObject.color;
        var reverse = jsonObject.reverse == 'true' ? true : false;

        var output = addonDisplay.write(delay, color, reverse, text);
        console.log(output);

    }, timeSpanCalculated);

    
}

function writeLogTempHumid() {
    if (currentTempUmid.temp != undefined || currentTempUmid.umid != undefined) {
        //ogni minuto (vedi GLOBAL_DELAY)
        if ((logCounter % 10) == 0) {
            fileWriter.appendLog("/Termostato/store/logs", "temperature.log", new Date(), currentTempUmid.temp + ',');
            fileWriter.appendLog("/Termostato/store/logs", "humidity.log", new Date(), currentTempUmid.umid + ',');
        }//if
        logCounter++;
    }//if
}//writeLogTempHumid

function checkSchedule() {
    calendar.checkSchedule(dashboard.HeatingSystem, currentTempUmid.temp);

    //fermo il display (reset)
    if (customTextInterval != undefined) {
        clearInterval(customTextInterval);
    }

    var displayLight = dashboard.DisplayLight.getParam();
    if (displayLight.alwaysOn == 'true')
    {
        //fermo il display
        if (customTextInterval != undefined) {
            clearInterval(customTextInterval);
        }
    }
    else if (displayLight.tempUmid == 'true')
    {
        printTempUmid();
    }
    else if (displayLight.customText == 'true')
    {
        printCustomText();
    }


}

