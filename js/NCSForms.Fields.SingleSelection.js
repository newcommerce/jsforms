// -----------------------------
// Single Selection
// -----------------------------

function SingleSelectionField(modelField, label, sourceModel, sourceDisplayField)
{
	sourceDisplayField = sourceDisplayField || "name";	
	this['sourceModel'] = sourceModel;
	this['sourceDisplayField'] = sourceDisplayField;
	this.construct('singleselectionfield', modelField, label);	
}

SingleSelectionField.inherits(NCSFormField);

SingleSelectionField.prototype.createInputField = function()
{	
	var windowVar = this.windowVar;	
	var selectEl = this['selectEl'] = document.createElement("select");
	selectEl.id = this.getInputId();
	selectEl.addEventListener("change", function(event) { window[windowVar].selectionChanged(event); });
}

SingleSelectionField.prototype.selectionChanged = function(event)
{
	this.edited = true;
	this.validate();
}

SingleSelectionField.prototype.validate = function()
{
	var value = this.getValue();
	if(!isNaN(value) && value > 0)
	{
		this.valid = true;
		this.displayGood();
		this.valueAccepted();
	}
	else
	{
		this.valid = false;
		this.displayBad();
		this.valueUnacceptable();
	}
}

SingleSelectionField.prototype.valuesReceived = function(event)
{
	var req = event.target;	
	var response = JSON.parse(req.responseText);	
	var selectId = response.selectId;
	var values = response['values'];

	var def = response['default'];
	def = def || -1;
	var selectEl = this.getSelectEl();

	if(values instanceof Array && values.length > 0 && !isNaN(values[0]['key']) && values[0]['value'] != undefined)
	{
		var total = values.length;
		values[total] = { key:-1, value:"select one"};
		this.replaceOptions(values, def);
		selectEl.disabled = false;
		this.postValuesReceived();
	}
	else
		this.noValuesReceived();
}

SingleSelectionField.prototype.postValuesReceived = function()
{

}

SingleSelectionField.prototype.noValuesReceived = function()
{
	// do nothing
}

SingleSelectionField.prototype.valuesReceptionError = function(event)
{
	console.error(this.windowVar+" valuesReceptionError("+event+")");
	this.noValuesReceived();
}

SingleSelectionField.prototype.replaceOptions = function(options, selectedKey)
{
	var selectEl = this.getSelectEl();
	selectedKey = selectedKey || -1;
	while(selectEl.firstChild != null)
		selectEl.removeChild(selectEl.firstChild);
	this.addOptions(options, selectedKey);
}

SingleSelectionField.prototype.addOptions = function(options, selectedKey)
{
	selectedKey = selectedKey || -1;

	if(!options instanceof Array || options.length == 0)
	{
		console.error("addSelections has invalid options parameter");
		return;
	}

	if(options[0].key == undefined || options[0].value == undefined)
	{
		console.error("addSelections has invalid options parameter");
		return;
	}

	var selectEl = this.getSelectEl();
	var defaultFound = false;
	if(selectEl != undefined)
	{
		for(i =0; i < options.length; i++)
		{
			var key = options[i].key;
			var value = options[i].value;
			var selectOption = document.createElement("option");
			selectOption.value = key;
			selectOption.appendChild(document.createTextNode(value));			
			if(key == selectedKey)
			{
				selectOption.selected = true;
				defaultFound = true;
			}

			selectEl.appendChild(selectOption);
		}

		if(!defaultFound)
			selectEl.options[selectEl.options.length-1].selected = true;
	}
}

SingleSelectionField.prototype.getSelectEl = function()
{
	return this.selectEl;
}

SingleSelectionField.prototype.generateUrl = function()
{
	var model = this.sourceModel;
	var displayField = this.sourceDisplayField;
	var val = this.getModelValue();	
	val = val || -1;
	var selectId = this.getInputId();

	var url = "multi_select.php?model="+encUC(model)+
		                   "&displayField="+encUC(displayField)+
		                   "&default="+encUC(val)+	
		                   "&selectId="+encUC(selectId);

	var condition = this.generateCondition();

	if(condition != undefined)
		url += "&condition="+encUC(condition);

	return url;
}

SingleSelectionField.prototype.generateCondition = function()
{
	return undefined;
}

SingleSelectionField.prototype.getInputEl = function()
{
	var selectEl = this.getSelectEl();
	var windowVar = this.windowVar;
	var sourceModel = this.sourceModel;
	var sourceDisplayField = this.sourceDisplayField;
	var value = this.getModelValue();

	var options = [{key: 0, value: "Loading ..."}];
	this.replaceOptions(options, 0);
	selectEl.disabled = true;

	var url = this.generateUrl();

	ajaxGet(this.windowVar, "valuesReceived", "valuesReceiptionError", url, {});
	return selectEl;
}

SingleSelectionField.prototype.getValue = function()
{
	var selectEl = this.getSelectEl();
	return selectEl.options[selectEl.selectedIndex].value;
}

SingleSelectionField.prototype.valueAccepted = function()
{
	var value = this.getValue();
	this.setModelValue(this.field, value);

	if("step" in this && this.step != undefined)
		this.step.fieldValid(this);
}


// ------------------------------------------
// SingleSelectRadioField
// ------------------------------------------

function SingleSelectRadioField(modelField, label, sourceModel, sourceDisplayField)
{
	sourceDisplayField = sourceDisplayField || "name";
	this['sourceModel'] = sourceModel;
	this['sourceDisplayField'] = sourceDisplayField;
	this['radioEls'] = [];	
	this.construct('singleselectradiofield', modelField, label);
}

SingleSelectRadioField.inherits(SingleSelectionField);

delete SingleSelectRadioField.prototype['replaceOptions'];
delete SingleSelectRadioField.prototype['addOptions'];
delete SingleSelectRadioField.prototype['getSelectEl'];

SingleSelectRadioField.prototype.createInputField = function()
{
	var windowVar = this.windowVar;
	var inputEl = document.createElement("div");
	inputEl.id = this.getOptionsContainerId();
	this['inputEl'] = inputEl;
}

SingleSelectRadioField.prototype.getInputEl = function()
{
	var windowVar = this.windowVar;
	var sourceModel = this.sourceModel;
	var sourceDisplayField = this.sourceDisplayField;
	var value = this.getModelValue();
	var inputEl = this.inputEl;

	while(inputEl.firstChild != null)
		inputEl.removeChild(inputEl.firstChild);

	var textNode = document.createTextNode("Loading...");
	inputEl.appendChild(textNode);

	var url = this.generateUrl();

	ajaxGet(this.windowVar, "valuesReceived", "valuesReceiptionError", url, {});	

	return inputEl;
}

SingleSelectRadioField.prototype.getOptionsContainerId = function()
{
	return this.getContainerId()+"_options_container";
}

SingleSelectRadioField.prototype.getOptionsContainerEl = function()
{
	return this.inputEl;
}

SingleSelectRadioField.prototype.valuesReceived = function(event)
{
	var req = event.target;	
	var response = JSON.parse(req.responseText);	
	var values = response['values'];

	var def = response['default'];
	def = def || -1;

	var inputEl = this.inputEl;

	while(inputEl.firstChild != null)
		inputEl.removeChild(inputEl.firstChild);	

	if(values instanceof Array && values.length > 0 && !isNaN(values[0]['key']) && values[0]['value'] != undefined)
	{
		var total = values.length;
		//values[total] = { key:-1, value:"no selection"};
		//total++;
		var valueObj;

		for(var i = 0; i < total; i++)
		{
			valueObj = values[i];
			this.createOption(valueObj, def);
		}
		this.postValuesReceived();
	}
	else
		this.noValuesReceived();
}

SingleSelectRadioField.prototype.getValue = function()
{
	var total = this.radioEls.length;
	var radioEl;
	for(var i = 0; i < total; i++)
	{
		radioEl = this.radioEls[i];
		if(radioEl.checked)
			return radioEl.value;
	}

	return -1;
}

SingleSelectRadioField.prototype.createOption = function(valueObj, def)
{
	var labelEl, radioEl, textNode;
	var inputEl = this.inputEl;
	var radioId = this.getContainerId()+"_radio_"+valueObj['key'];
	var labelId = radioId+"_label";
	var windowVar = this.windowVar;

	labelEl = document.createElement("label");
	labelEl.id = labelId;
	textNode = document.createTextNode(valueObj['value']);
	radioEl = document.createElement("input");
	radioEl.id = radioId;

	radioEl.type = "radio";
	radioEl.value = valueObj['key'];
	radioEl.name = this.getContainerId()+"_radio";
	if(def == valueObj['key'])
		radioEl.checked = true;

	labelEl.appendChild(radioEl);
	labelEl.appendChild(textNode);
	inputEl.appendChild(labelEl);
	inputEl.appendChild(createEl("br"));	
	radioEl.addEventListener("click", function(event) { window[windowVar].selectionChanged(event); }, false);

	if(this.optionStylizer != null)
		labelEl = this.optionStylizer.stylizeOption(this, labelEl);
	this.radioEls.push(radioEl);
}



// --------------------------------------------
// SingleSelectIconField
// --------------------------------------------

function SingleSelectIconField(modelField, label, sourceModel, sourceDisplayField, selectedStyle, unselectedStyle, defaultIcon)
{
	selectedStyle = selectedStyle || "ON";
	unselectedStyle = unselectedStyle || "";
	sourceDisplayField = sourceDisplayField || "name";
	defaultIcon = defaultIcon || "no_icon.png";


	this['sourceModel'] = sourceModel;
	this['sourceDisplayField'] = sourceDisplayField;
	this['iconEls'] = [];
	this['values'] = [];
	this['selectedValue'] = -1;
	this['selectedStyle'] = selectedStyle;
	this['unselectedStyle'] = unselectedStyle;
	this['defaultIcon'] = defaultIcon;

	this.construct('singleselecticonfield', modelField, label);
}

SingleSelectIconField.inherits(SingleSelectRadioField);

SingleSelectIconField.prototype.setOptionStylizer = function(optionStylizer)
{
	this.optionStylizer = optionStylizer;
}

SingleSelectIconField.prototype.createOption = function(valueObj, def)
{
	var windowVar = this.windowVar;

	var imgEl, labelEl, containerEl, textNode;
	var inputEl = this.inputEl;
	var brEl;

	var iconId = this.getContainerId()+"_icon_"+valueObj['key'];
	var labelId = iconId+"_label";
	var containerId = iconId+"_container";

	labelEl = document.createElement("span");
	labelEl.id = labelId;

	textNode = document.createTextNode(valueObj['value']);

	imgEl = document.createElement("img");
	imgEl.id = iconId;

	if(valueObj['icon_url'] == undefined)
		imgEl.src = this.defaultIcon;
	else
		imgEl.src = valueObj["icon_url"];

	containerEl = document.createElement("button");
	containerEl.id = containerId;

	containerEl.appendChild(imgEl);
	containerEl.appendChild(labelEl);
	labelEl.appendChild(textNode);

	containerEl.addEventListener("click", function(event) { window[windowVar].selectionChanged(event); }, false);

	containerEl.style.cursor = "pointer";
	disableElementTextSelection(containerEl);

	if(valueObj.key == def)
	{
		this.setSelected(containerEl);
		this['selectedValue'] = valueObj.key;
	}
	else
		this.setUnselected(containerEl);

	this.iconEls.push(containerEl);
	this.values.push(valueObj);

	if(this.optionStylizer != null)
		containerEl = this.optionStylizer.stylizeOption(this, containerEl);

	inputEl.appendChild(containerEl);
}

SingleSelectIconField.prototype.selectionChanged = function(event)
{
	var targetEl = event.target;
	var idx = this.iconEls.indexOf(targetEl);
	while(idx == -1)
	{
		targetEl = targetEl.parentNode;
		idx = this.iconEls.indexOf(targetEl);
	}

	var lastIdx = array_get_idx(this.values, "key", this.selectedValue);	

	this['selectedValue'] = this.values[idx]['key'];
	this.setUnselected(this.iconEls[lastIdx]);
	this.setSelected(this.iconEls[idx]);

	this['edited'] = true;
	this.validate();
}

SingleSelectIconField.prototype.setSelected = function(element)
{
	if(element != null)
		this.applyAppendClass(element, true, this.selectedStyle, this.unselectedStyle);
}

SingleSelectIconField.prototype.setUnselected = function(element)
{
	if(element != null)
		this.applyAppendClass(element, false, this.selectedStyle, this.unselectedStyle);
}

SingleSelectIconField.prototype.applyAppendClass = function(element, on, onStyle, offStyle)
{
	if(on)
	{
		removeAppendStyle(element, offStyle);
		addAppendStyle(element, onStyle);		
	}
	else
	{
		removeAppendStyle(element, onStyle);
		addAppendStyle(element, offStyle);
	}
}

SingleSelectIconField.prototype.getValue = function()
{
	return this.selectedValue;	
}



// --------------------------------------
// Recursive Selection
// --------------------------------------

function RecursiveSelectionField(modelField, label, sourceModel, sourceDisplayField)
{
	this['fields'] = new Array();
	this['fieldIndex'] = 0;
	this['sourceModel'] = sourceModel;
	this['sourceDisplayField'] = sourceDisplayField;

	this.construct('recursiveselectionfield', modelField, label);
	// as soon as the value from the model is in, run parent_sequence.php?model=model&value=value
}
RecursiveSelectionField.inherits(SingleSelectionField);

RecursiveSelectionField.prototype.getSelectContainerEl = function()
{
	if(!("selectContainerEl" in this))
		this.createSelectContainerEl();

	return this.selectContainerEl;
}

RecursiveSelectionField.prototype.createSelectContainerEl = function()
{
	var selectContainerEl = document.createElement("span");
	selectContainerEl.id = this.getContainerId()+"_select_container";
	this['selectContainerEl'] = selectContainerEl;
}

RecursiveSelectionField.prototype.assembleElements = function()
{
	var containerEl = this.getContainerEl();
	var labelEl = this.getLabelEl();
	var commentEl = this.getCommentEl();
	var inputEl = this.getInputEl();
	var selectContainerEl = this.getSelectContainerEl();

	while(containerEl.firstChild != null)
		containerEl.removeChild(containerEl.firstChild);

	containerEl.appendChild(labelEl);

	// through the container
	containerEl.appendChild(selectContainerEl);
	selectContainerEl.appendChild(inputEl);		
	containerEl.appendChild(commentEl);	

	return containerEl;
}

RecursiveSelectionField.prototype.getSelectEl = function()
{
	if(!(this.fieldIndex in this.fields))
		this.createInputField();

	return this['fields'][this.fieldIndex];
}

RecursiveSelectionField.prototype.getInputId = function()
{
	return this.getContainerId()+"_"+this.fieldIndex+"_select";
}

RecursiveSelectionField.prototype.createInputField = function()
{
	var containerId = this.getContainerId();
	var fieldIndex = this.fieldIndex;
	var selectEl = this['fields'][fieldIndex] = document.createElement("select");
	var windowVar = this.windowVar;
	
	selectEl.id = this.getInputId();
	selectEl.addEventListener("change", function(event) { window[windowVar].selectionChanged(event, fieldIndex); });
}

RecursiveSelectionField.prototype.removeDependantRows = function(fieldIndex)
{
	var idx = this['fields'].length-1;
	var selectContainerEl = this.selectContainerEl;
	var field;
	while(idx > fieldIndex)
	{
		field = this.fields[idx];
		this.fields.splice(idx, 1);
		selectContainerEl.removeChild(field);
		idx--;	
	}
}

RecursiveSelectionField.prototype.selectionChanged = function(event, fieldIndex)
{
	this.edited = true;
	var field = this.fields[fieldIndex];
	var value = this.getValue();
	this.fieldIndex = fieldIndex;
	this.setModelValue(value);
	this.validate();

	this.removeDependantRows(fieldIndex);
	this.fieldIndex++;

	var field = this.getInputEl();
	this.selectContainerEl.appendChild(field);
	field.style.visibility = "hidden";

	// disable all selections
	for(key in this.fields)
		this.fields[key].disabled = true;
}


RecursiveSelectionField.prototype.generateCondition = function()
{
	if(this.fieldIndex == 0)
		return "`id` = `parent_id`";
	else
	{
		var field = this.fields[this.fieldIndex-1];
		var value = field.options[field.selectedIndex].value;
		return "`parent_id` = '"+value+"' AND `id` <> `parent_id`"
	}
}

RecursiveSelectionField.prototype.postValuesReceived = function()
{
	for(key in this.fields)
		this.fields[key].disabled = false;

	this.fields[this.fields.length-1].style.visibility = "visible";
}

RecursiveSelectionField.prototype.noValuesReceived = function()
{
	this.fieldIndex--;
	this.removeDependantRows(this.fieldIndex);

	for(key in this.fields)
		this.fields[key].disabled = false;
}