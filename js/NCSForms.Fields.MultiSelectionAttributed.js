function AttributedMultiSelectionField(matchModel, sourceIdField, targetModel, targetIdField, targetDisplayField, attributeField, attributeName, label, min, max)
{
	this.sourceIdField = sourceIdField;
	this.targetModel = targetModel;
	this.targetIdField = targetIdField;
	this.targetDisplayField = targetDisplayField;
	this.matchModel = matchModel;
	this.minChoices = min;
	this.maxChoices = max;
	this.choices = [];	
	this.attributeName = attributeName;
	this.attributeField = attributeField;
	this.selectedChoices = [];
	this.addPendingChoice = null;

	this.construct("attributedmultiselectionfield", "", label);
	this.valuesLoaded = false;
}

AttributedMultiSelectionField.inherits(NCSFormField);
AttributedMultiSelectionField.swiss(SingleSelectionField, ['addOptions', 'replaceOptions', 'getSelectEl']);


// CREATES THE ALREADY EXISTING OPTIONS
AttributedMultiSelectionField.prototype.updateSelected = function()
{
	var seledChoice;
	var windowVar = this.windowVar;
	for(var i = 0; i < this.selectedChoices.length; i++)
	{	
		seledChoice = this.selectedChoices[i];
		this.addSelectedChoice(seledChoice);
	}
}

AttributedMultiSelectionField.prototype.addSelectedChoice = function(seledChoice)
{
	var deletePostObj = this.getDeletePostObj(seledChoice);
	var windowVar = this.windowVar;
	var visibleChoice = new AttributedSelectedOption(seledChoice.key, seledChoice.value, seledChoice.attrValue, deletePostObj, function(choice) { window[windowVar].optionUnselected(choice); });
	visibleChoice.show(this.inputEl);
}

AttributedMultiSelectionField.prototype.optionUnselected = function(choiceObj)
{
	var selectedIdx = this.getSelectedIdx(choiceObj.id);
	if(selectedIdx != -1)
	{
		this.selectedChoices.splice(selectedIdx, 1);
		choiceObj = { key: choiceObj.id, value: choiceObj.name };
		this.choices.push(choiceObj);
		this.addOptions([choiceObj], -1);		
	}

	this.validate();
}

// THIS OBJECT IS NECESSARY TO DELETE ALREADY SELECTED OPTIONS
AttributedMultiSelectionField.prototype.getDeletePostObj = function(selectedChoice)
{
	var targetId = selectedChoice.key;
	var sourceId = this.form.model.get("id");
	var selected = false;
	var sourceModel = this.form.model.model;

	var postObj = { source_model: sourceModel, target_model: this.targetModel, source_id: sourceId, target_id: targetId,
					match_model: this.matchModel, source_id_field: this.sourceIdField, target_id_field: this.targetIdField, 
					selected: selected };

	return postObj;
}

AttributedMultiSelectionField.prototype.getAddPostObj = function(selectedChoice)
{
	var postObj = this.getDeletePostObj(selectedChoice);
	postObj.attr_field = this.attributeField;
	postObj.attr_value = this.attrCheckBoxEl.checked ? 1 : 0;
	postObj.selected = true;
	return postObj;
}

// CREATES THE SELECT INPUT OPTIONS
AttributedMultiSelectionField.prototype.updateSelections = function(event)
{
	this.replaceOptions(this.choices, -1);
	this.selectEl.disabled = false;
	this.addBtnEl.disabled = false;
	this.attrCheckBoxEl.disabled = false;
}


AttributedMultiSelectionField.prototype.getSelectId = function()
{
	return this.getContainerId() + "_select";
}

AttributedMultiSelectionField.prototype.getAttrLabelId = function()
{
	return this.getContainerId() + "_attribute_label";
}

AttributedMultiSelectionField.prototype.getAttrCheckBoxId = function()
{
	return this.getContainerId() + "_attribute_checkbox";
}

AttributedMultiSelectionField.prototype.createInputField = function()
{
	var windowVar = this.windowVar;

	var inputEl = createEl("div");
	inputEl.id = this.getInputId();

	var selectEl = this['selectEl'] = createEl("select");
	selectEl.id = this.getSelectId();
	selectEl.disabled = true;
	this['selectEl'] = selectEl;	

	var addBtnEl = this['addBtnEl'] = createEl("input");
	addBtnEl.type = "button";
	addBtnEl.value = "+";
	addBtnEl.disabled = true;
	addBtnEl.addEventListener("click", function(event) { window[windowVar].addBtnClicked(event); }, false);
	this['addBtnEl'] = addBtnEl;

	// check box + label
	var labelEl = this['attrLabelEl'] = createEl("label");
	labelEl.id = this.getAttrLabelId();
	labelEl.appendChild(document.createTextNode(this.attributeName));
	this['attributeLabelEl'] = labelEl;

	var checkBoxEl = this['attrCheckBoxEl'] = createEl("input");
	checkBoxEl.type = "checkbox";
	checkBoxEl.id = this.getAttrCheckBoxId();
	this['attributeCheckboxEl'] = checkBoxEl;	

	labelEl.appendChild(checkBoxEl);
	inputEl.appendChild(selectEl);
	inputEl.appendChild(labelEl);
	inputEl.appendChild(addBtnEl);	

	return this.inputEl = inputEl;
}

AttributedMultiSelectionField.prototype.getAttributeLabelEl = function()
{
	return this.attributeLabelEl;
}

AttributedMultiSelectionField.prototype.getAttributeCheckboxEl = function()
{
	return this.attributeCheckboxEl;
}

AttributedMultiSelectionField.prototype.getSelectEl = function()
{
	return this.selectEl;
}

AttributedMultiSelectionField.prototype.getAddBtnEl = function()
{
	return this.addBtnEl;
}

AttributedMultiSelectionField.prototype.getInputEl = function()
{
	this.loadValues();
	return this.inputEl;
}

AttributedMultiSelectionField.prototype.getChoiceIdx = function(choiceKey)
{
	var choiceObj;
	for(var i = 0; i < this.choices.length; i++)
	{
		choiceObj = this.choices[i];
		if(choiceObj.key == choiceKey)
			return i;
	}

	return -1;
}

AttributedMultiSelectionField.prototype.getSelectedIdx = function(selectedKey)
{
	var selectedObj;
	for(var i = 0; i < this.selectedChoices.length; i++)
	{
		selectedObj = this.selectedChoices[i];
		if(selectedObj.key == selectedKey)
			return i;
	}

	return -1;
}

AttributedMultiSelectionField.prototype.addBtnClicked = function(event)
{
	var optionEl = this.selectEl.options[this.selectEl.selectedIndex];
	var selectedId = optionEl.value;

	var attrValue = this.attrCheckBoxEl.checked;

	this.selectEl.disabled = true;
	this.attrCheckBoxEl.disabled = true;
	this.addBtnEl.disabled = true;

	var choiceIdx = this.getChoiceIdx(selectedId);
	var choiceObj = this.choices[choiceIdx];
	this.choices.splice(choiceIdx, 1);

	var postObj = this.getAddPostObj(choiceObj);
	var url = "saveMultiSelection.php";

	ajaxPost(this.windowVar, "choiceAdded", "choiceAddFailed", url, postObj);
	this.addPendingChoice = choiceObj;
}

AttributedMultiSelectionField.prototype.choiceAdded = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);
	this.attrCheckBoxEl.checked = false;
	var choiceObj = this.addPendingChoice;
	var choiceKey = choiceObj.key;

	choiceObj.attrValue = json.attr_value;
	delete this.addPendingChoice;
	this.selectedChoices.push(choiceObj);
	this.addSelectedChoice(choiceObj);
	this.addBtnEl.disabled = this.attrCheckBoxEl.disabled = this.selectEl.disabled = false;	

	this.removeSelectOption(choiceKey);

	this.validate();
}

AttributedMultiSelectionField.prototype.removeSelectOption = function(optionValue)
{
	var selectEl = this.selectEl;
	var i = 0;
	var optionEl;
	for(; i < selectEl.childNodes.length; i++)
	{
		optionEl = selectEl.childNodes[i];
		if(optionEl.value == optionValue)
			break;
		else
			optionEl = null;
	}

	if(optionEl != null)
		selectEl.removeChild(optionEl);
}

AttributedMultiSelectionField.prototype.choiceAddFailed = function(event)
{
	alert(this.windowVar+" -- choiceAddFailed -- "+event);
}

AttributedMultiSelectionField.prototype.validate = function(event)
{
	var choiceCount = this.selectedChoices.length;
	this.valid = (this.minChoices <= choiceCount && choiceCount <= this.maxChoices);
	if(this.valid)
		this.valueAcceptable();
	else
		this.valueUnacceptable();
}

AttributedMultiSelectionField.prototype.loadValues = function()
{
	if(this.valuesLoaded)
		return;

	var options = [{key: 0, value: "Loading ..."}];
	this.replaceOptions(options, 0);
	this.selectEl.disabled = true;

	var sourceModel = this.form.model.model;
	var sourceId = this.form.model.get("id");

	var postObj = { source_model: sourceModel, source_id: sourceId, target_model: this.targetModel,
	                target_display_field: this.targetDisplayField, match_model: this.matchModel, 
	                source_id_field: this.sourceIdField, target_id_field: this.targetIdField };

	var url = "getMatchValues.php";
	var windowVar = this.windowVar;

	ajaxPost(windowVar, "digestValues", "valuesLoadError", url, postObj);
}

AttributedMultiSelectionField.prototype.digestValues = function(event)
{
	var req = event.target;	
	var response = JSON.parse(req.responseText);
	var values = response.values;
	var val;
	var i = 0;
	var count = 0;
	if(values instanceof Array && values.length > 0)
	{
		count = values.length;
		for(i = 0; i < count; i++)
		{
			val = values[i];

			if(val.selected != true)
			{
				val.selected = false;
				var choiceObj = {key:val.id, value:val[this.targetDisplayField]};
				this.choices.push(choiceObj);
			}
			else
			{
				var selectedChoiceObj = {key:val.id, value:val[this.targetDisplayField], attrValue:val[this.attributeField]};
				this.selectedChoices.push(selectedChoiceObj);
			}
		}
	}

	this.updateSelected();
	this.updateSelections();
	this.valuesLoaded = true;
	this.validate();
}

AttributedMultiSelectionField.prototype.valuesLoadError = function(event)
{
	alert(this.windowVar +" -- values load error -- "+event);
}

// ---------------------------------------------------------
// Attributed Selected Option
// ---------------------------------------------------------

function AttributedSelectedOption(id, name, attrValue, deletePostObj, deletedCB)
{
	this['id'] = id;
	this['attrValue'] = attrValue;
	this['name'] = name;
	this['state'] = 'creating';
	this['deletedCB'] = deletedCB;
	this['type'] = 'attributedselectedoption';
	this.innerId = sequence(this.type, this);
	this['windowVar'] = this.type+"_"+this.innerId;
	this['deletePostObj'] = deletePostObj;
}

AttributedSelectedOption.inherits(DeletableSelectedOption);

AttributedSelectedOption.prototype.getLabel = function()
{
	return this.name + ( this.attrValue == 1 ? " - CCQ " : " ");
}

AttributedSelectedOption.prototype.delete = function()
{
	this['state'] = 'deleting';
	var element = this['element'];
	element.innerHTML = this.generateHtml();

	var url = "saveMultiSelection.php";
	var postObj = this.deletePostObj;
	ajaxPost(this.windowVar, "deleteSuccess", "deleteFailure", url, postObj);
}