<input type="checkbox" id="checkbox-manual" data-mini="false">
<label for="checkbox-manual">Switch on heating system (always)</label>

<div data-role="collapsibleset" data-theme="a" data-content-theme="a" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d">
    <div data-role="collapsible">
      <h3>Seasons</h3>
      <fieldset data-role="controlgroup">
        <legend>Select:</legend>
		    <input type="radio" name="radio-choice-v-2" id="radio-choice-winter" value="on">
		    <label for="radio-choice-winter">Winter (on)</label>
		    <input type="radio" name="radio-choice-v-2" id="radio-choice-summer" value="off">
		    <label for="radio-choice-summer">Summer (off)</label>
	    </fieldset>
    </div>
    
	<div data-role="collapsible">
      <h3>Display lights</h3>
      <fieldset data-role="controlgroup">
        <legend>Select:</legend>
		    <input type="radio" name="radio-choice-v-3" id="radio-choice-display-always-on" />
		    <label for="radio-choice-display-always-on">always off</label>
		    <input type="radio" name="radio-choice-v-3" id="radio-choice-display-temp-umid" />
		    <label for="radio-choice-display-temp-umid">Temperature/Humidity</label>
		    <input type="radio" name="radio-choice-v-3" id="radio-choice-display-custom-text" />
		    <label for="radio-choice-display-custom-text">Custom text</label>
      </fieldset>
    </div>

    <div data-role="collapsible"
         data-collapsed-icon="gear"
         data-expanded-icon="delete">
      <h3>Set date</h3>
      <a id="set-system-date" href="#" data-role="button" data-icon="gear">Set current date</a>
    </div>
</div>