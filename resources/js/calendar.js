var startTime = "";
var endTime = "";
var dayOfWeek = "";

$(function() {

	var socket = io.connect();
    socket.on('connect', function () {
    	
//    	socket.on('calendarUpdated', );
    	
    });
    
    $( "#ButtonStop" ).bind( "click", function(event, ui) {
        socket.emit('stop', true);
    });

	//DELETE
	$('body').on('click', 'table > tbody > tr', function(){
		var pos = $(this).index(); //posizione dell'array da rimuovere
		var day = $(this).parent().parent().attr('id');

		waitShow();
		$.post('removeSchedule', { 'day':day, 'pos':pos }, function(param){
			redrawTableDay(param);
			waitHide();
		});
	});
	
	
	$('.time > div > a').click(function(){
		$(this).toggleClass('pickTime');
		
		if(startTime != "")
		{
			endTime = "Y";
		}//if
		
		startTime="X";		
		
		if(endTime != "")
		{
			$('.ui-collapsible-heading-toggle.ui-btn.ui-btn-icon-left.ui-btn-inherit.ui-icon-minus').trigger('click');
			$('.pickTime').removeClass('pickTime');
			startTime = "";
			endTime = "";
		}//if
	});
	
	//tutti i bottoni salva dei giorni della settimana
	$('.save').click(function(){
		waitShow();
		
		var $spanContainer = $(this).parent().parent();
		var $dayContainer = $(this).parent().parent().parent().parent().parent().parent();
		
		var timeSpanTemp = {
							 'day': $('table', $dayContainer ).attr('id'),
							 'startTime': $('[name="start"]', $spanContainer ).val(),
							 'endTime': $('[name="end"]', $spanContainer ).val(),
							 'temp': $('[name="sliderTemperature"]', $spanContainer ).val(),
							 };
							 
		$.post('setSchedule', timeSpanTemp, function(param){
			redrawTableDay(param);
		});
		
		//collapse - close
		$('.ui-collapsible-heading', $spanContainer.parent()).trigger('click');
	});
	
	$.post('/getSchedule', function(param){
		redrawAllTableDay(param);
	});

});//ready

//RIDISEGNA LA TABELLA DEL GIORNO INDICATO IN CALENDAR
function redrawTableDay(calendar){
    	
	var $buttonDelete = '<a href="#" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-link ui-btn ui-icon-delete ui-btn-icon-notext ui-shadow ui-corner-all" role="button"></a>'; 
			
	var $tableDayContainer = $('#'+calendar.day);
	$('tbody', $tableDayContainer).remove();
 		
	var rows = "";
	$.each(calendar.calendar, function( index, value ) {
   		rows += '<tr><td></td><td>'+ value.start +'</td><td>'+ value.end +'</td><td>'+ value.temperature +'</td><td>' + $buttonDelete +'</td></tr>';
	});
    		
	$tableDayContainer.append(
		'<tbody>'+rows+'</tbody>'
    );
    		
    waitHide();
}//redrawTableDay

function redrawAllTableDay(calendar)
{
	console.log(calendar);
    waitHide();
}//redrawAllTableDay
