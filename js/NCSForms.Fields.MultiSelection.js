// ------------------------------------------------
// MultiSelectionField
// ------------------------------------------------

// have conditions
function MultiSelectionField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max)
{
	this.constructMultiSelectionField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max)
	// values contain: id, {displayField}, selected
}

MultiSelectionField.inherits(NCSFormField);

MultiSelectionField.prototype.constructMultiSelectionField = function(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max)
{
	this.sourceIdField = sourceIdField;
	this.targetModel = targetModel;
	this.targetIdField = targetIdField;
	this.targetDisplayField = targetDisplayField;
	this.matchModel = matchModel;
	this.construct("multiselectionfield", "", label);
	this.minChoices = min;
	this.maxChoices = max;
	this.values = [];
	this.checkboxes = [];
}

MultiSelectionField.prototype.formSet = function()
{
	var sourceModel = this.form.model.model;
	var sourceId = this.form.model.get("id");

	var postObj = { source_model: sourceModel, source_id: sourceId, target_model: this.targetModel,
	                target_display_field: this.targetDisplayField, match_model: this.matchModel, 
	                source_id_field: this.sourceIdField, target_id_field: this.targetIdField };

	var url = "getMatchValues.php";
	ajaxPost(this.windowVar, "valuesLoaded", "valuesLoadError", url, postObj);
}

MultiSelectionField.prototype.valuesLoaded = function(event)
{
	var req = event.target;	
	var response = JSON.parse(req.responseText);
	var values = response.values;
	var val;
	var valObj;
	var i = 0;
	var count = 0;
	if(values instanceof Array && values.length > 0)
	{
		count = values.length;
		for(i = 0; i < count; i++)
		{
			val = values[i];

			if(val.selected != true)
				val.selected = false;

			valObj = {id:val.id, selected:val.selected, name:val[this.targetDisplayField], callActive:false};
			delete val['id'];
			delete val['selected'];
			delete val[this.targetDisplayField];

			for(key in val)
				valObj[key] = val[key];
			
			this.values.push(valObj);
		}
	}

	this.showValues();
}

MultiSelectionField.prototype.createInputField = function()
{	
	var inputEl = document.createElement("div");
	inputEl.id = this.getInputId();

	return this.inputEl = inputEl;
}

MultiSelectionField.prototype.getInputEl = function()
{
	return this.inputEl;
}

MultiSelectionField.prototype.showValues = function()
{
	this.checkboxes = [];
	var containerEl = this.inputEl;
	containerEl.style['text-align'] = "left";
	while(containerEl.firstChild)
		containerEl.removeChild(containerEl.firstChild);

	var key = 0;
	var value;
	var fieldSetEl = document.createElement("fieldset");
	fieldSetEl.name = this.label;	
	containerEl.appendChild(fieldSetEl);
	this.fieldSetEl = fieldSetEl;

	for(key in this.values)
	{
		value = this.values[key];
		fieldSetEl.appendChild(this.createCheckBox(value));
		if(value.selected == true)
			this.edited = true;
	}

	this.postShowValues();

	this.validate();
}

MultiSelectionField.prototype.postShowValues = function()
{
}

MultiSelectionField.prototype.createCheckBox = function(value)
{
	// value.id, value.name, value.selected
	var spanEl = document.createElement("span");	
	var labelEl = document.createElement("label");
	var inputEl = document.createElement("input");
	var textEl = document.createTextNode(value.name);
	var brEl = document.createElement("br");

	spanEl.appendChild(labelEl);
	spanEl.appendChild(brEl);
	labelEl.appendChild(inputEl);
	labelEl.appendChild(textEl);	
	inputEl.value = value.id;
	inputEl.type = 'checkbox';
	inputEl.id = "";

	if(value.selected)
		inputEl.checked = true;

	var windowVar = this.windowVar;
	value.box = inputEl;

	this.checkboxes.push(inputEl);
	inputEl.addEventListener("click", function(event) { window[windowVar].checkBoxClicked(event); });	

	return spanEl;
}

MultiSelectionField.prototype.checkBoxClicked = function(event)
{
	this.edited = true;
	var inputEl = event.target;
	var valueObj = this.getValueById(inputEl.value);

	if(inputEl.checked)
		valueObj.selected = true;
	else
		valueObj.selected = false;

	this.commitChange(valueObj, inputEl);
	this.validate();
}

MultiSelectionField.prototype.getValueById = function(valueId)
{
	if(this.values instanceof Array && this.values.length > 1)
	{
		for(key in this.values)
		{
			if(this.values[key].id == valueId)
				return this.values[key];
		}
	}

	return undefined;
}

MultiSelectionField.prototype.selectedCount = function()
{
	var count = 0;

	if(this.values instanceof Array && this.values.length > 1)
	{
		for(key in this.values)
		{
			if(this.values[key].selected == true)
				count++;
		}
	}

	return count;
}

MultiSelectionField.prototype.disableOption = function(inputEl)
{
	inputEl.disabled = true;
}

MultiSelectionField.prototype.enableOption = function(inputEl)
{
	inputEl.disabled = false;
}

MultiSelectionField.prototype.commitChange = function(valueObj, inputEl)
{
	this.disableOption(inputEl);
	
	valueObj.callActive = true;
	var targetId = valueObj.id;
	var sourceId = this.form.model.get("id");
	var selected = valueObj.selected;
	var sourceModel = this.form.model.model;


	var postObj = { source_model: sourceModel, target_model: this.targetModel, source_id: sourceId, target_id: targetId,
					match_model: this.matchModel, source_id_field: this.sourceIdField, target_id_field: this.targetIdField, 
					selected: selected };

	var url = "saveMultiSelection.php";	
	ajaxPost(this.windowVar, "changeCommited", "changeCommitError", url, postObj);
}

MultiSelectionField.prototype.changeCommited = function(event)
{
	var req = event.target;	
	var response = JSON.parse(req.responseText);
	var needed = response.modificationNeeded;
	var success = response.success;
	var targetId = response.target_id;

	var valueObj = this.getValueById(targetId);
	var inputEl = valueObj.box;	

	// need to get both inputEl, and valueObj
	this.enableOption(inputEl);
	valueObj.callActive = false;

	if(needed && !success)
		inputEl.checked = !inputEl.checked;
}

MultiSelectionField.prototype.changeCommitError = function(event)
{
	// need to get both inputEl and valueObj

	inputEl.disabled = false;
	valueObj.callActive = false;
	inputEl.checked = !inputEl.checked;
}

MultiSelectionField.prototype.validate = function()
{
	var min = this.minChoices;
	var max = this.maxChoices;
	var count = this.selectedCount();

	this.valid = (min <= count && max >= count);

	if(this.valid)
	{
		this.displayGood();
		this.valueAcceptable();
	}
	else
	{
		this.displayBad();
		this.valueUnacceptable();
	}

	if(max == count)
		this.disableUnselected();
	else
		this.enableUnselected();
}

MultiSelectionField.prototype.enableUnselected = function()
{
	if(this.values instanceof Array && this.values.length > 1)
	{
		for(key in this.values)
		{
			if(this.values[key].selected == false && this.values[key].callActive == false)
				this.enableOption(this.values[key].box);				
		}
	}
}

MultiSelectionField.prototype.disableUnselected = function()
{
	if(this.values instanceof Array && this.values.length > 1)
	{
		for(key in this.values)
		{
			if(this.values[key].selected == false && this.values[key].callActive == false)
				this.disableOption(this.values[key].box);
		}
	}
}

// ------------------------------------------------------
// MultiSelectIconField
// ------------------------------------------------------

function MultiSelectIconField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max, selectedStyle, unselectedStyle)
{
	selectedStyle = selectedStyle || "ON";
	unselectedStyle = unselectedStyle || "";

	this['selectedStyle'] = selectedStyle;
	this['unselectedStyle'] = unselectedStyle;

	this.constructMultiSelectionField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max)	
}

MultiSelectIconField.inherits(MultiSelectionField);

MultiSelectIconField.prototype.createCheckBox = function(valueObj)
{
	// value.id, value.name, value.selected
	var containerEl = document.createElement("div");
	var imgEl = document.createElement("img");
	var spanEl = document.createElement("span");	
	var textEl = document.createTextNode(valueObj.name);	

	containerEl.appendChild(imgEl);
	containerEl.appendChild(spanEl);
	spanEl.appendChild(textEl);

	if(valueObj.icon_url == undefined)
		imgEl.src = "no_icon.png";
	else
		imgEl.src = valueObj.icon_url;

	if(valueObj.selected)
		this.setSelected(containerEl);
	else
		this.setUnselected(containerEl);

	var windowVar = this.windowVar;
	valueObj.box = containerEl;

	this.checkboxes.push(containerEl);
	containerEl.addEventListener("click", function(event) { window[windowVar].checkBoxClicked(event); });	

	containerEl.style.cursor = "pointer";
	disableElementTextSelection(containerEl);

	if(this.optionStylizer != null)
		containerEl = this.optionStylizer.stylizeOption(this, containerEl);

	return containerEl;
}

MultiSelectIconField.prototype.isSelected = function(element)
{
	return element.className == this.selectedStyle;
}

MultiSelectIconField.prototype.setSelected = function(element)
{
	if(element != null)
		this.applyAppendClass(element, true, this.selectedStyle, this.unselectedStyle);
}

MultiSelectIconField.prototype.setUnselected = function(element)
{
	if(element != null)
		this.applyAppendClass(element, false, this.selectedStyle, this.unselectedStyle);
}

MultiSelectIconField.prototype.applyAppendClass = function(element, on, onStyle, offStyle)
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

MultiSelectIconField.prototype.checkBoxClicked = function(event)
{
	this.edited = true;
	var inputEl = event.target;
	var index = this.checkboxes.indexOf(inputEl);
	while(index == -1)
	{
		inputEl = inputEl.parentNode;
		index = this.checkboxes.indexOf(inputEl);
	}

	var valueObj = this.values[index];
	if(valueObj.callActive)
		return;


	if(this.isSelected(inputEl))
	{
		valueObj.selected = false;
		this.setUnselected(inputEl);
	}
	else
	{
		valueObj.selected = true;
		this.setSelected(inputEl);
	}

	this.commitChange(valueObj, inputEl);
	this.validate();
}

// ------------------------------------------------------
// FlexibleMultiSelectionField
// ------------------------------------------------------

function FlexibleMultiSelectionField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max)
{
	this.constructMultiSelectionField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, label, min, max);
}

FlexibleMultiSelectionField.inherits(MultiSelectionField);

FlexibleMultiSelectionField.prototype.getMoreContainerId = function()
{
	return this.getContainerId() + "_more";
}

FlexibleMultiSelectionField.prototype.getMoreLabelId = function()
{
	return this.getContainerId() + "_more_label";
}

FlexibleMultiSelectionField.prototype.getMoreButtonId = function()
{
	return this.getContainerId() + "_more_button";
}

FlexibleMultiSelectionField.prototype.getMoreInputId = function()
{
	return this.getContainerId() + "_more_input";
}

FlexibleMultiSelectionField.prototype.createContainerEl = function()
{
	// CONTAINER
	var containerEl = document.createElement("div");
	containerEl.id = this.getContainerId();
	this['containerEl'] = containerEl;

	var containerEl = this.inputEl;
	var moreContainerEl = document.createElement("div");
	moreContainerEl.id = this.getMoreContainerId();

	var moreTextNode = document.createTextNode("Ajouter:");
	var moreLabelEl = createEl("span");
	moreLabelEl.appendChild(moreTextNode);
	moreLabelEl.id = this.getMoreLabelId();
	moreContainerEl.appendChild(moreLabelEl);

	var moreInputEl = document.createElement("input");
	moreInputEl.id = this.getMoreInputId();

	var windowVar = this.windowVar;
	moreInputEl.addEventListener("keyup", function(event) { window[windowVar].extraValidate(event); });
	moreContainerEl.appendChild(moreInputEl);

	var addButtonEl = document.createElement("input");
	addButtonEl.id = this.getMoreButtonId();
	addButtonEl.type = 'button';
	addButtonEl.value = "Add";
	addButtonEl.addEventListener("click", function(event) { window[windowVar].addElement(event); });
	moreContainerEl.appendChild(addButtonEl);

	this.moreContainerEl = moreContainerEl;
	this.moreInputEl = moreInputEl;
	this.addButtonEl = addButtonEl;

	addButtonEl.disabled = true;

	containerEl.appendChild(moreContainerEl);
}

FlexibleMultiSelectionField.prototype.postShowValues = function()
{

}

FlexibleMultiSelectionField.prototype.extraValidate = function(event)
{
	var inputEl = event.target;
	this.addButtonEl.disabled = inputEl.value.length < 5;
}

FlexibleMultiSelectionField.prototype.addElement = function(event)
{
	// get the value
	var moreInputEl = this.moreInputEl;
	var value = moreInputEl.value;
	var addButtonEl = this.addButtonEl;

	moreInputEl.disabled = addButtonEl.disabled = true;

	// send ajax call, once received do something great
	var matchModel = this.matchModel;

	var url = "addValue.php";
	var postObj = { model: this.targetModel, value: value, valueField: this.targetDisplayField, creator_id: this.form.model.get("id"),
					creator: this.form.model.model };

	ajaxPost(this.windowVar, "addValueSuccessful", "addValueFailed", url, postObj);
}

FlexibleMultiSelectionField.prototype.addValueSuccessful = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);

	var value = json.value;
	var id = json.id;
	var model = json.model;
	var creator = json.creator;
	var creatorId = json.creator_id;
	var fieldSetEl = this.fieldSetEl;

	if(!isNaN(id))
	{
		var value = { id:id, name:value, callActive:false, selected:true};
		this.values.push(value);
		fieldSetEl.appendChild(this.createCheckBox(value));		
		this.moreInputEl.value = "";
	}

	this.moreInputEl.disabled = false;
}

FlexibleMultiSelectionField.prototype.addValueFailed = function(event)
{
	this.moreInputEl.disabled = this.addButtonEl.disabled = false;
}

FlexibleMultiSelectionField.prototype.formSet = function()
{
	var sourceModel = this.form.model.model;
	var sourceId = this.form.model.get("id");

	var postObj = { source_model: sourceModel, source_id: sourceId, target_model: this.targetModel,
	                target_display_field: this.targetDisplayField, match_model: this.matchModel, 
	                source_id_field: this.sourceIdField, target_id_field: this.targetIdField, restrict: true,
	                restrict_field: "creator_id", restrict_values:sourceId+",-1"};

	var url = "getMatchValues.php";
	ajaxPost(this.windowVar, "valuesLoaded", "valuesLoadError", url, postObj);
}
