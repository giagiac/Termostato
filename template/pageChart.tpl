<!DOCTYPE html> <html> <head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
	<title>pageMain</title>
	
	<!-- Socket io import nodejs module -->
	<script src="/socket.io/socket.io.js"></script>
	
	<link rel="shortcut icon" href="resources/js/jquery/favicon.ico"/>
	<link rel="stylesheet" href="resources/css/themes/default/jquery.mobile-1.4.5.min.css"/>
	<script src="resources/js/jquery/jquery.js"></script>
	<script src="resources/js/jquery/jquery.mobile-1.4.5.min.js"></script>

	<script type="text/javascript" src="resources/js/jqplot/jquery.jqplot.min.js"></script>
	<script type="text/javascript" src="resources/js/jqplot/plugins/jqplot.dateAxisRenderer.min.js"></script>
	<link rel="stylesheet" type="text/css" hrf="resources/js/jqplot/jquery.jqplot.min.css" />

	<script src="http://code.highcharts.com/highcharts.js"></script>
	<script src="http://code.highcharts.com/modules/exporting.js"></script>


	<link rel="stylesheet" type="text/css" href="resources/css/jquery.datetimepicker.css"/ >
	<script src="resources/js/datetimepicker/jquery.datetimepicker.js"></script>

	<script type="text/javascript">
	function waitShow(){
		$.mobile.loading( "show", {
			theme: "z"
		});
	}
	function waitHide(){
		$.mobile.loading( "hide" );
	}

	var jsonDataTemp;
	var jsonDataHumid;
	$(document).ready(function(){
		getTempHumid();
		jQuery('#datetimepicker').datetimepicker({
			timepicker:false,
			format:'Y-m-d',
			onSelectDate:function(dp,$input){
				getTempHumid($input.val());
			}
		});
	});

	
	function getTempHumid($input)
	{
		waitShow();
		var today = new Date();
		var month = setZeros((today.getMonth()+1));
		var day = setZeros(today.getDate());
		today = (today.getFullYear() + '-' + month + '-' + day);
		var date = $input || today;
		$('#datetimepicker').val(date);
		$.get( "/getLog?date=" + date + "&name=temperature", function( data ) {
			jsonDataTemp = eval(data);
			$.get( "/getLog?date=" + date + "&name=humidity", function( data ) {
				jsonDataHumid = eval(data);
				drawChart();
			});//GET
		});//GET
	}

	function setZeros(val)
	{
		return val.lenght > 1 ? val : '0' + val;
	}//setZeros

	function drawChart()
	{
		$('#container').highcharts({
			chart: {
				type: 'line'
			},
			title: {
				text: 'Temperature/Humidity'
			},
			subtitle: {
				text: ''
			},
			xAxis: {
				categories: ['lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			},
			yAxis: {
				title: {
					text: 'Values (C - %)'
				}
			},
			plotOptions: {
				line: {
					dataLabels: {
						enabled: true
					},
					enableMouseTracking: false
				}
			},
			series: [{
				name: 'Temperature',
				data: jsonDataTemp
			}, {
				name: 'Humidity',
				data: jsonDataHumid
			}]
		},
		function(chart){ waitHide(); });
	}//drawChart

	</script>

</head>
<body>

<div data-role="page" id="pageone">

  <div data-role="header" data-theme="b">
    <h1>Chart</h1>
  </div>
  <input id="datetimepicker" type="text" />
  <div id="container" style="min-width: 310px; height: 400px; margin: 0"></div>
</div>

</body>
</html>
