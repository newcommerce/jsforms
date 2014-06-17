// ---------------------------------------------
// FORM FIELD
// ---------------------------------------------

function NCSFormField(modelField, label, length, maxLength)
{
	this.construct('ncsformfield', modelField, label, length, maxLength);
}

NCSFormField.inherits(EventDispatcher);

NCSFormField.prototype.getValue = function()
{
	return this.inputEl.value;
}

NCSFormField.prototype.setLength = function(length)
{
	this['length'] = length;
}

NCSFormField.prototype.setMaxLength = function(maxLength)
{
	this['maxLength'] = maxLength;
}

NCSFormField.prototype.setMessages = function(good, bad)
{
	this['good'] = good;
	this['bad'] = bad;
}

NCSFormField.prototype.setFormStep = function(formStep)
{
	this['step'] = formStep;
	this.formStepSet();
}

NCSFormField.prototype.setForm = function(form)
{
	this['form'] = form;
	this.formSet();
}

NCSFormField.prototype.formSet = function()
{

}

NCSFormField.prototype.formStepSet = function()
{

}

NCSFormField.prototype.setOptionStylizer = function(optionStylizer)
{
	this.optionStylizer = optionStylizer;
}


NCSFormField.prototype.createContainerEl = function()
{
	// CONTAINER
	var containerEl = document.createElement("div");
	containerEl.id = this.getContainerId();
	this['containerEl'] = containerEl;
}

NCSFormField.prototype.getContainerEl = function()
{
	if(!("containerEl" in this))
		this.createContainerEl();

	return this.containerEl;
}

NCSFormField.prototype.getLabelId = function()
{
	return this.getContainerId() + "_label";
}

NCSFormField.prototype.createLabelEl = function()
{
	// LABEL
	var labelEl = document.createElement("span");
	labelEl.id = this.getLabelId();
	labelEl.innerHTML = this.label;
	this['labelEl'] = labelEl;
}

NCSFormField.prototype.getLabelEl = function()
{
	if(!("labelEl" in this))
		this.createLabelEl();

	return this.labelEl;
}

NCSFormField.prototype.getCommentId = function()
{
	return this.getContainerId() + "_comment";
}

NCSFormField.prototype.createCommentEl = function()
{
	// COMMENT
	var commentEl = document.createElement("div");
	commentEl.id = this.getCommentId();
	return commentEl;
}

NCSFormField.prototype.getCommentEl = function()
{
	var commentEl;

	if("commentEl" in this)
		commentEl = this.commentEl;
	else
		commentEl = this.commentEl = this.createCommentEl();

	return this.commentEl;
}

NCSFormField.prototype.assembleElements = function()
{
	var containerEl = this.getContainerEl();
	var inputEl = this.getInputEl();
	var labelEl = this.getLabelEl();
	var commentEl = this.getCommentEl();

	while(containerEl.firstChild != null)
		containerEl.removeChild(containerEl.firstChild);

	containerEl.appendChild(labelEl);
	containerEl.appendChild(inputEl);
	containerEl.appendChild(commentEl);	

	return containerEl;
}

NCSFormField.prototype.edit = function()
{
	if(this.containerEl == undefined && this.server_validate_func != undefined)
	{
		this.postFocusValue = this.preFocusValue = this.getModelValue();
		if(this.postFocusValue != "")
			this.serverValid = true;
		else
			this.serverValid = "unknown";
	}

	var containerEl = this.assembleElements();
	this.validate();
	return containerEl;
}

NCSFormField.prototype.keyUp = function(event)
{
	var innerId = this.inner_id;
	console.log("["+innerId+'] keyUp');
	this['edited'] = true;
	this.validate();
}

NCSFormField.prototype.focusSet = function(event)
{
	var innerId = this.inner_id;
	console.log("["+innerId+'] focusSet');
	this['focused'] = true;
	this['preFocusValue'] = this.getValue();
}

NCSFormField.prototype.focusLost = function(event)
{
	var innerId = this.inner_id;
	console.log("["+innerId+'] focusLost');
	this['focused'] = false;
	
	if(this.inputEl.value == this.preFocusValue == this.postFocusValue == this.postValidationValue)
	{
		this.valid = true;
		this.serverValid = true;
		return;
	}

	this['postFocusValue'] = this.inputEl.value;

	if(this.regexValid && this['server_validate_func'] != undefined)
		this.validateAjax();
	else if(this.regexValid)
		this.valueAccepted()
	else
		this.valueUnacceptable();
}

NCSFormField.prototype.validateAjax = function()
{
	var windowVar = this.windowVar;

	this.serverValid = "checking";

	var value = this.inputEl.value;
	var model = this.form.model.model;
	var field = this.field;
	var modelId = this.getModelValue('id');
	var serverFunc = this['server_validate_func'];

	var getObj = { table:model, field:field, value:value, function: serverFunc, modelId: modelId };
	var url = "validate.php";

	// remember last value being validated by server.

	this.displayComment("checking server");
	ajaxGet(this.windowVar, "serverValidated", "serverValidatedError", url, getObj);
}

NCSFormField.prototype.getModelValue = function(field)
{
	field = field || this.field;
	return this.form.model.get(field);
}

NCSFormField.prototype.setModelValue = function(field, value)
{
	if(value == undefined)
	{
		value = field;
		field = this.field;
	}

	this.form.model.set(field, value);
}

NCSFormField.prototype.serverValidated = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);

	if(json.result == "true")
	{
		this.valid = true;
		this.serverValid = true;
		this.commentEl.innerHTML = this.server_validate_good;
		this.valueAccepted();
	}
	else
	{
		this.serverValid = false;
		this.commentEl.innerHTML = this.server_validate_bad;
		this.valid = false;
		this.valueUnacceptable();
		this.inputEl.focus();
	}
}

NCSFormField.prototype.serverValidatedError = function(event)
{
	console.error(this.windowVar+"["+this.field+"] "+this.form.model.model+" serverValidateError("+event+");");
}

NCSFormField.prototype.valueAccepted = function()
{
	var value = this.getValue();
	this.postValidationValue = value;

	this.setModelValue(this.field, value);
	this.valueAcceptable();
}

NCSFormField.prototype.valueAcceptable = function()
{
	if("step" in this && this.step != undefined)
		this.step.fieldValid(this);

	// show proper one
	if(this.regexValid && this['server_validate_func'] != undefined)
	{
		if(this.serverValid == true)
			this.displayComment(this.server_validate_good);
		else
			this.displayGood();
	}
	else
		this.displayGood();
}

NCSFormField.prototype.valueUnacceptable = function()
{
	if("step" in this && this.step != undefined)
		this.step.fieldInvalid(this);

	// show proper one
	if(this.regexValid && this['server_validate_func'] != undefined)
	{
		if (this.serverValid == "unknown")
			this.displayComment(this.good);
		else if(this.serverValid == "checking")
			this.displayComment("checking");
		else if(this.serverValid == false)
			this.displayComment(this.server_validate_bad);
		else
			this.displayBad();
	}
	else
		this.displayBad();
}

NCSFormField.prototype.display = function()
{
	// generate html for display, and return it
}

NCSFormField.prototype.isValid = function()
{
	return this['valid'];	
}

NCSFormField.prototype.isFocused = function()
{
	return this['focused'];
}

NCSFormField.prototype.isEdited = function()
{
	return this['edited'];	
}

NCSFormField.prototype.done = function(requiresEdit)
{
	requiresEdit = requiresEdit || false;
	// content is valid, has been edited, but isn't currently focused
	// return !this.isFocused() && this.isValid() && (this.isEdited() || !requiresEdit);	
	return this.isValid() || !this.mandatory;
}

NCSFormField.prototype.displayGood = function()
{
	this.displayComment(this.good);
}

NCSFormField.prototype.displayBad = function()
{
	this.displayComment(this.bad);
}

NCSFormField.prototype.displayComment = function(commentText)
{
	var commentEl = this.getCommentEl();

	if(commentEl == undefined)
		return;

	while(commentEl.firstChild != null)
		commentEl.removeChild(commentEl.firstChild);

	if(this.good != undefined)
		commentEl.appendChild(document.createTextNode(commentText));
}

NCSFormField.prototype.dirtied = function()
{
	if("postFocusValue" in this && this.postFocusValue == this.inputEl.value && this.regexValid == true && this.valid == true)
		return false;
	else
		return true;
}

NCSFormField.prototype.isOptional = function()
{
	if(!("optional" in this))
		this.optional = false;

	return this.optional && this.getValue() == "";
}

NCSFormField.prototype.validate = function()
{
	var val = this.getValue();
	if(this.isOptional())
	{
		this.valid = true;
		this.valueAccepted();
	}

	if(!this.dirtied())
	{
		this.valueAccepted();
		return;
	}

	if(this.regex != undefined && isElement(this.commentEl))	
		this.valid = this.regex.test(val);
	else 
		this.valid = true;

	this['regexValid'] = this.valid;

	if(this['server_validate_func'] != undefined)
	{
		if(this.preFocusValue != this.getValue())
			this.serverValid = "unknown";
		else
			this.serverValid = true;

		if(this.regexValid == true && this.serverValid == true)
			this.valid = true;
		else
			this.valid = false;
	}

	if(this.valid)
		this.valueAccepted();
	else
		this.valueUnacceptable();
}

NCSFormField.prototype.construct = function(type, modelField, label, length, maxLength)
{
	length = length || -1;
	maxLength = maxLength || -1;
	this['field'] = modelField;
	this['label'] = label;
	this['maxLength'] = maxLength;
	this['length'] = length;
	this['focused'] = false;
	this['valid'] = false;
	this['mandatory'] = true;
	this.generateWindowVar(type);
	this.createInputField();
	this.isOptional();
}

NCSFormField.prototype.getContainerId = function()
{
	var type = this['type'];
	var innerId = this['inner_id'];
	return "field_"+type+"_"+innerId;
}

NCSFormField.prototype.getInputId = function()
{
	return this.getContainerId()+"_input";
}


NCSFormField.prototype.getInputEl = function()
{	
	var value = this.getModelValue();	
	this.inputEl.value = value;
	return this.inputEl;
}

NCSFormField.prototype.createInputField = function()
{
	var inputEl = document.createElement("input");		
	inputEl.id = this.getInputId();
	if(this.maxLength != -1)
		inputEl.maxLength = this.maxLength;

	if(this.length != -1)
		inputEl.size = this.length;
	
	this['inputEl'] = inputEl;

	this.registerInputFieldEvents();
}

NCSFormField.prototype.registerInputFieldEvents = function()
{
	var inputEl = this.inputEl;

	var windowVar = this.windowVar;
	inputEl.addEventListener("keyup", function(event) { window[windowVar].keyUp(event); }, false);
	inputEl.addEventListener("blur", function(event) { window[windowVar].focusLost(event); }, false);
	inputEl.addEventListener("focus", function(event) { window[windowVar].focusSet(event); }, false);	
}

// ---------------------------------------------
// Deletable Selection Option
// ---------------------------------------------

function DeletableSelectedOption()
{

}

DeletableSelectedOption.prototype.getLabel = function()
{
	return "";
}

DeletableSelectedOption.prototype.generateHtml = function()
{
	var state = this['state'];
	var html = "";
	html = this.getLabel();
	var windowVar = this.windowVar;

	if(state == "deleting")
		html += "(deleting)";

	if(state == "creating" || state == "alive")
		html += "<a href='javascript:window[\""+windowVar+"\"].delete();'>(x)</a>";

	return html;
}

DeletableSelectedOption.prototype.createElement = function()
{
	return document.createElement("div");
}

DeletableSelectedOption.prototype.show = function(containerEl)
{
	this['containerEl'] = containerEl;
	var element = this['element'] = this.createElement();
	element.innerHTML = this.generateHtml();	
	containerEl.appendChild(element);
	this['state'] = "alive";
}

DeletableSelectedOption.prototype.deleteSuccess = function(event)
{
	var req = event.target;
	var response = JSON.parse(req.responseText);
	var success = response['success'];
	if(success)
	{
		var containerEl = this['containerEl'];
		var element = this['element'];		
		containerEl.removeChild(element);
		this['state'] = 'deleted';
	}
	else
	{
		this['state'] = 'active';
		var element = this['element'];
		element.innerHTML = this.generateHtml();
	}

	this.deletedCB(this);
}

DeletableSelectedOption.prototype.deleteFailure = function(event)
{
	console.error("delete failure in "+this['id']+" ("+event+")");
	this['state'] = 'active';
	var element = this['element'];
	element.innerHTML = this.generateHtml();
}