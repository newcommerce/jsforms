function FreeFormMultiValueField(matchModel, sourceIdField, targetDisplayField, targetIdField, label, min, max)
{
	this.sourceIdField = sourceIdField;
	this.matchModel = matchModel;
	this.targetDisplayField = targetDisplayField;
	this.targetIdField = targetIdField;
	this.label = label;
	this.min = min;
	this.max = max;
	this.values = [];	
	this.construct("freeformmultivaluefield", "", label);
	this.valuesLoaded = false;
}

FreeFormMultiValueField.inherits(NCSFormField);

FreeFormMultiValueField.prototype.getFieldId = function()
{
	return this.getContainerId() + "_field";
}

FreeFormMultiValueField.prototype.getAddBtnId = function()
{
	return this.getContainerId() + "_btn";
}

FreeFormMultiValueField.prototype.createInputField = function()
{
	var windowVar = this.windowVar;
	var inputEl = document.createElement("div");
	inputEl.id = this.getInputId();

	var fieldEl = document.createElement("input");
	fieldEl.id = this.getFieldId();

	var btnEl = document.createElement("input");
	btnEl.type = "button";
	btnEl.value = "add";
	btnEl.addEventListener("click", function(event) { window[windowVar].addBtnClicked(event); }, false);
	btnEl.id = this.getAddBtnId();

	inputEl.appendChild(fieldEl);
	inputEl.appendChild(btnEl);

	this['inputEl'] = inputEl;
	this['btnEl'] = btnEl;
	this['fieldEl'] = fieldEl;
}


FreeFormMultiValueField.prototype.getFieldEl = function()
{
	return this.fieldEl;
}

FreeFormMultiValueField.prototype.getBtnEl = function()
{
	return this.btnEl;
}

FreeFormMultiValueField.prototype.getInputEl = function()
{
	this.loadValues();
	return this.inputEl;
}

FreeFormMultiValueField.prototype.loadValues = function()
{
	if(this.valuesLoaded)
		return;

	var sourceModel = this.form.model.model;
	var sourceId = this.form.model.get("id");

	var postObj = { model: this.matchModel, id_field: this.targetIdField, 
		            display_field: this.targetDisplayField, source_id_field: this.sourceIdField,
		            source_model: sourceModel, source_id: sourceId };
	var windowVar = this.windowVar;
	var url = "getFreeFormValues.php";

	ajaxPost(windowVar, "digestValues", "loadValuesError", url, postObj);
}

FreeFormMultiValueField.prototype.addBtnClicked = function(event)
{
	var name = this.fieldEl.value;
	var model = this.matchModel;
	var sourceId = this.form.model.get("id");
	var sourceIdField = this.sourceIdField;
	var sourceModel = this.form.model.model;

	var postObj = { model: model, name: name, source_id: sourceId, source_id_field: sourceIdField, source_model: sourceModel };
	var url = "addFreeFormValue.php";
	var windowVar = this.windowVar;
	this.fieldEl.disabled = true;
	this.btnEl.disabled = true;

	ajaxPost(windowVar, "valueAdded", "valueAddFailure", url, postObj);
}

FreeFormMultiValueField.prototype.valueAdded = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);
	var windowVar = this.windowVar;

	if(json.success == true)
	{
		var id = json.id;
		var name = json.name;
		var sourceModel = json.source_model;
		var sourceId = json.source_id;
		var model = json.model;

		var valueObj = new FreeFormValue(model, id, name, sourceModel, sourceId,  function(valueObj) { window[windowVar].valueRemoved(valueObj); });
		this.values.push(valueObj);
		valueObj.show(this.inputEl);
		this.fieldEl.value = "";
	}

	this.fieldEl.disabled = (this.values.length >= this.max);
	this.btnEl.disabled = (this.values.length >= this.max);

	this.validate();
}

FreeFormMultiValueField.prototype.valueAddFailure = function(event)
{

}

FreeFormMultiValueField.prototype.digestValues = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);
	var values = json.values;
	var model = this.matchModel;
	var sourceModel = this.form.model.model;
	var sourceId = this.form.model.get("id");
	var windowVar = this.windowVar;

	for(var i = 0; i < values.length; i++)
	{
		var val = values[i];
		var valObj = new FreeFormValue(model, val[this.targetIdField],val[this.targetDisplayField], sourceModel, sourceId, function(valueObj) { window[windowVar].valueRemoved(valueObj); });
		this.values.push(valObj);
		valObj.show(this.inputEl);
	}

	this.validate();
	this.valuesLoaded = true;
}

FreeFormMultiValueField.prototype.valueRemoved = function(valueObj)
{
	// ? nothing!
	var index = this.values.indexOf(valueObj);
	if(index > -1)
		this.values.splice(index, 1);

	this.fieldEl.disabled = (this.values.length >= this.max);
	this.btnEl.disabled = (this.values.length >= this.max);

	this.validate();
}

FreeFormMultiValueField.prototype.loadValuesError = function(event)
{

}

FreeFormMultiValueField.prototype.validate = function()
{
	var total = this.values.length;
	this.valid = (total >= this.min && total <= this.max);

	if(this.valid)
		this.valueAcceptable();
	else
		this.valueUnacceptable();
}

function FreeFormValue(model, id, name, sourceModel, sourceId,  deletedCB)
{
	this['name'] = name;
	this['id'] = id;
	this['model'] = model;
	this['sourceId'] = sourceId;
	this['sourceModel'] = sourceModel;
	this['state'] = 'creating';
	this['deletedCB'] = deletedCB;
	this['type'] = "freeformvalue";
	this.innerId = sequence(this.type, this);
	this['windowVar'] = this.type+"_"+this.innerId;	
}

FreeFormValue.inherits(DeletableSelectedOption);

FreeFormValue.prototype.getLabel = function()
{
	return this.name;
}

FreeFormValue.prototype.delete = function()
{
	this['state'] = 'deleting';
	var element = this.element;
	var windowVar = this.windowVar;
	element.innerHTML = this.generateHtml();

	var url = "deleteFreeFormValue.php";
	var postObj = { source_model: this.sourceModel, source_id: this.sourceId, model: this.model, id: this.id, name: this.name };
	ajaxPost(windowVar, "deleteSuccess", "deleteFailure", url, postObj);
}