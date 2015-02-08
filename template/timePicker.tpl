<div data-role="main" class="ui-content">
  <div data-role="collapsibleset">
    <div data-role="collapsible">
    
    <h3>Pick span of time here!</h3>
	
	<div class="ui-field-contain">
		<label for="start">Start</label>
		<input name="start" type="text" data-role="datebox" data-options='{"mode":"timebox"}' />
	</div>

	<div class="ui-field-contain">
		<label for="end">End</label>
		<input name="end" type="text" data-role="datebox" data-options='{"mode":"timebox"}' />
	</div>
	 
	<label for="slider-temperature">Input temperature:</label>
   	<input type="range" name="sliderTemperature" id="slider-temperature" value="18" min="10" max="30" data-popup-enabled="true"/>
	
	<center>
		<a class="save" href="#" data-role="button" data-inline="true" data-theme="b" data-icon="check">Save</a>
	</center>
	
	</div>
  </div>
</div>







