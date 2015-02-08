$(function() {

	var socket = io.connect();
    socket.on('connect', function () {
    	
    	socket.on('sensorsValues', function(values){
    		$('#temperature').text(values.temp + "°");
    		$('#umidity').text(values.umid);
    	});
    	
    });
});//ready
