$(function() {
	getSetHeatingSystem("/getHeatingSystem");
   	getSetDisplayLight("/getDisplayLight");
   	getSetSeason("/getSeason");

    $('#radio-choice-winter').click(function(){
    	getSetSeason('/setSeason', { season: "Winter" });
    });
    $('#radio-choice-summer').click(function(){
    	getSetSeason('/setSeason', { season: "Summer" } );
    });
    
    $('#radio-choice-display-always-on').click(function(){
    	getSetDisplayLight('/setDisplayLight', { alwaysOn: true } );
    });
    $('#radio-choice-display-temp-umid').click(function(){
    	getSetDisplayLight('/setDisplayLight', { tempUmid: true } );
    }); 
    $('#radio-choice-display-custom-text').click(function(){
    	getSetDisplayLight('/setDisplayLight', { customText: true } );
    });
    
    $('#checkbox-manual').click(function(){
		getSetHeatingSystem("/setHeatingSystem");
    });

    var text = $('#custom-text');
    setCustomText("/setCustomText", text);
    
    //Thread dei sensori e dell'orologio
    
    var socket = io.connect();
    socket.on('connect', function () {

        socket.on('message', function (values, params) {
            if (values == "sensorsValues") {
                $('#temperature').text(params.temp + "°");
                $('#umidity').text(params.umid);
            }
            if (values == "clock")
            {
                $('#clock').text(params);
            }
        });    
    });
    
    
});//ready

//HEATINGSYSTEM
function getSetHeatingSystem(url)
{
   	waitShow();
   	
	$.get( url, function(param){
		if(param.param1 == "heatingSystemOn")
		{
			$('#checkbox-manual').prop('checked', true).checkboxradio('refresh');
			waitHide();
		}
		else if(param.param1 == "heatingSystemOff")
		{
			$('#checkbox-manual').prop('checked', false).checkboxradio('refresh');
			waitHide();
		}
    });//get
}//getSetHeatingSystem

function getSetDisplayLight(url, param)
{
   	waitShow();
	$.post( url, param, function(param){
		if(param != undefined)
   		{
			if(param.alwaysOn == 'true')
			{
				$('#radio-choice-display-always-on').attr("checked", true).checkboxradio("refresh");
				$('#radio-choice-display-temp-umid').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-custom-text').attr("checked", false).checkboxradio("refresh");
    		}
    		else if(param.tempUmid == 'true') 
    		{
    			$('#radio-choice-display-always-on').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-temp-umid').attr("checked", true).checkboxradio("refresh");
    			$('#radio-choice-display-custom-text').attr("checked", false).checkboxradio("refresh");
    		}
    		else if(param.customText == 'true') 
    		{
    			$('#radio-choice-display-always-on').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-temp-umid').attr("checked", false).checkboxradio("refresh");
    			$('#radio-choice-display-custom-text').attr("checked", true).checkboxradio("refresh");
    		}
    	}//if
    	waitHide();
    });//get
}//getSetHeatingSystem

function getSetSeason(url, param)
{
	waitShow();
	$.post(url, param, function(param){
		if(param != undefined)
   		{
   			if(param.season === "Winter")
   			{
   				$('#radio-choice-winter').attr("checked", true).checkboxradio("refresh");
				$('#radio-choice-summer').attr("checked", false).checkboxradio("refresh");
   			}
   			else if(param.season === "Summer") 
   			{
   				$('#radio-choice-summer').attr("checked", true).checkboxradio("refresh");
   				$('#radio-choice-winter').attr("checked", false).checkboxradio("refresh");
   			}
   		}//if
   		waitHide();
   	 });//post
}//getSetSeason

function setCustomText(url, customText) {
    waitShow();

    customText.keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            var text = customText.val();

            var patt = new RegExp("^[\x00-\x7F]+$");
            if (patt.test(text)) {
                var delay = 1;
                var color = "red";
                var reverse = false;
                var jsonObject = {
                    "text": text,
                    "delay": delay,
                    "color": color,
                    "reverse": reverse
                };
                $.post(url, jsonObject, function (response) {
                    waitHide();
                    customText.val('');
                });//post
            }//if
            else { alert('Don\'t use no valid chars'); }
        }//if
    });
}//getSetSeason
