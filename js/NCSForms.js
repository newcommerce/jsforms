// start, stop, delete


// ---------------------------------------------
// NCSModel
// ---------------------------------------------

function NCSModel(model, id)
{
	id = id != undefined ? id : -1;
	var type = "ncsmodel";
	this.generateWindowVar(type);
	this['model'] = model;
	this['id'] = id;
	this['valid'] = false;  
	this['new'] = id == -1;
	this['validated'] = false;	
	this['ready'] = false;
}

NCSModel.inherits(EventDispatcher);

NCSModel.prototype.addRelation = function(model, id)
{
	if(this['relations'] == undefined)
		this['relations'] = new Array();

	this['relations'].push({model:model, id:id});	
}

NCSModel.prototype.start = function()
{
	if(this['valid'] == true)
		throw 'nothing to do';

	var model = this['model'];
	var id = this['id'];
	var relations = JSON.stringify(this['relations']);

	var postObj = { model: model, id: id, relations: relations };
	var url = "startForm.php";
	ajaxPost(this.windowVar, "started", "startError", url, postObj);
}

NCSModel.prototype.started = function(event)
{
	var req = event.target;	
	var response = JSON.parse(req.responseText);

	this.ingestData(response);

	this.ready = true;
	this.dispatchEvent("ready");
}

NCSModel.prototype.ingestData = function(response)
{
	this['values'] = new Array();
	this['id'] = response['data']['id'];
	var key;
	for(key in response['data'])
	{
		if(response['data'].hasOwnProperty(key))
			this['values'][key] = response['data'][key];
	}
}

NCSModel.prototype.isReady = function()
{
	return this['values'] instanceof Array && this.values.length > 0;
}

NCSModel.prototype.get = function(fieldName)
{
	var model = this['model'];
	var id = this['id'];

	if(this['values'] instanceof Array)
	{
		if(fieldName in this['values'])
			return this['values'][fieldName];
		else
			throw("model["+model+"]["+id+"] doesn't have a field["+fieldName+"] defined");
	}
	else
		throw("model["+model+"]["+id+"] doesn't have values yet");
}

NCSModel.prototype.set = function(fieldName, value)
{
	var model = this['model'];
	var id = this['id'];

	if(this['values'] instanceof Array)
	{
		if(fieldName in this['values'])
		{
			this['values'][fieldName] = value;
			return true;
		}
		else
			throw("model["+model+"]["+id+"] doesn't have a field["+fieldName+"] defined");
	}
	else
		throw("model["+model+"]["+id+"] doesn't have values yet");	
}

NCSModel.prototype.startError = function(event)
{
	
}

function log(message)
{
	var log = document.getElementById("output");
	if(log != undefined && "innerHTML" in log)
		log.innerHTML += message;
}

NCSModel.prototype.save = function()
{	
	// update form.
	var fields = new Array();
	var values = new Array();

	var postObj = {};	
	var key;
	var value;

	for(key in this['values'])
	{
		if(this['values'].hasOwnProperty(key))
		{
			value = this['values'][key];
			fields.push(key);
			values.push(value);
			postObj[key] = value;
		}
	}

	postObj['model'] = this.model;
	var url = "saveModel.php";
	ajaxPost(this.windowVar, "saved", "saveError", url, postObj);	
}

NCSModel.prototype.saved = function(event)
{	
	var req = event.target;
	var json = JSON.parse(req.responseText);
	if("elapsed" in json)
	{
		var elapsed = json['elapsed'];
		log("saved in "+elapsed+" milliseconds<br />");
	}
}

NCSModel.prototype.delete = function(event)
{

}

NCSModel.prototype.saveError = function(event)
{

}


// --------------------------------------
// NCS FORM
// --------------------------------------

function NCSForm(defaultModel, progressId, stepContainerId, previousButtonId, nextButtonId, skipButtonId)
{
	// create a form based on a certain model
	this['defaultModel'] = this['model'] = defaultModel;
	this['progressId'] = progressId;
	this['stepContainerId'] = stepContainerId;
	this['nextButtonId'] = nextButtonId;
	this['previousButtonId'] = previousButtonId;
	this['skipButtonId'] = skipButtonId;
	this['progress'] = 0;
	this.generateWindowVar('ncsform');
	this.initButtons();
}

NCSForm.inherits(EventDispatcher);

NCSForm.prototype.initButtons = function()
{
	var nextButtonEl = this.getNextButton();
	var previousButtonEl = this.getPreviousButton();
	var windowVar = this.windowVar;
	nextButtonEl.addEventListener("click", function() { window[windowVar].nextButtonClicked(event); });
	previousButtonEl.addEventListener("click", function() { window[windowVar].previousButtonClicked(event); });
	this.hideNextButton();
	this.hidePreviousButton();
}

NCSForm.prototype.nextButtonClicked = function(event)
{

	// skip to next step. if at the end, do something smart
	// update the model
	this.model.save();

	if(this.steps.length > this.activeStep+1)
	{
		this.activeStep++;
		this.getStepContainer().innerHTML = "";
		this.showStep();
	}
	else
	{
		this.dispatchEvent("end");		
	}
}

NCSForm.prototype.previousButtonClicked = function(event)
{
	this.model.save();

	if(this.activeStep > 0)
	{
		this.activeStep--;
		this.getStepContainer().innerHTML = "";
		this.showStep();
	}
	else
	{
		alert("should never happen");
	}
}

NCSForm.prototype.createStep = function(name, style, model)
{
	var step = new NCSFormStep(name, style, model);
	this.addStep(step);
	return step;
}

NCSForm.prototype.getModel = function() { 
	return this['model'];
}

NCSForm.prototype.getModId = function() { 
	return this['model_id'];
}

NCSForm.prototype.getStepContainer = function()
{ 
	return document.getElementById(this['stepContainerId']); 
}

NCSForm.prototype.addStep = function(step)
{ 
	if(this['steps'] == undefined)
		this['steps'] = new Array();

	this['steps'].push(step);
	step.setForm(this);
}

NCSForm.prototype.getCurrentStep = function()
{
	return this.steps[this.activeStep];
}

NCSForm.prototype.showStep = function()
{
	var step = this.getCurrentStep();

	if(step.model != undefined)
		this.model = step.model;
	else
		this.model = this.defaultModel;

	step.activate();

	if(this.activeStep == 0)
		this.hidePreviousButton();
	else
		this.showPreviousButton();
}

NCSForm.prototype.start = function()
{
	if(this.steps != undefined && this.steps instanceof Array && this.steps.length > 0)
	{
		this['activeStep'] = 0;
		this.showStep();
	}
	else
	{
		throw("no steps defined");
	}
}

NCSForm.prototype.getNextButton = function()
{
	return document.getElementById(this.nextButtonId);
}

NCSForm.prototype.showNextButton = function()
{
	this.getNextButton().style.visibility = "visible";
}

NCSForm.prototype.hideNextButton = function()
{
	this.getNextButton().style.visibility = "hidden";
}

NCSForm.prototype.getPreviousButton = function()
{
	return document.getElementById(this.previousButtonId);
}

NCSForm.prototype.hidePreviousButton = function()
{
	return this.getPreviousButton().style.visibility = "hidden";
}

NCSForm.prototype.showPreviousButton = function()
{
	return this.getPreviousButton().style.visibility = "visible";
}

NCSForm.prototype.stepValid = function(step)
{
	if(step == this.getCurrentStep())
		this.showNextButton();
	
	this.updateProgress();
}

NCSForm.prototype.stepInvalid = function(step)
{
	if(step == this.getCurrentStep())
		this.hideNextButton();

	this.updateProgress();
}

NCSForm.prototype.updateProgress = function()
{
	var totalFields = 0;
	var doneFields = 0;
	var validFields = 0;
	if(this.steps != undefined && this.steps instanceof Array && this.steps.length > 0)
	{
		for(key in this.steps)
		{
			var stepProgress = this.steps[key].getProgress();
			totalFields += stepProgress.total;
			doneFields += stepProgress.done;
			validFields += stepProgress.valid;
		}
	}
	
	var progressEl = document.getElementById(this.progressId);
	progressEl.max = totalFields;
	progressEl.value = doneFields;
}

// ---------------------------------------------
// FORM STEP
// ---------------------------------------------

function NCSFormStep(name, style, model)
{
	this['name'] = name;
	this['fields'] = new Array();
	this['valid'] = false;
	this['shown'] = false;
	this['model'] = model;
	this['style'] = style;	
}

NCSFormStep.inherits(EventDispatcher);

NCSFormStep.prototype.activate = function()
{
	var container = this.form.getStepContainer();
	container.innerHTML = "";
	var fieldDiv;
	var field;
	
	for(key in this.fields)
	{
		field = this.fields[key];

		if(this.style != undefined)
			fieldDiv = this.style.stylize(field);
		else
			fieldDiv = field.edit();

		container.appendChild(fieldDiv);
	}
}

NCSFormStep.prototype.setForm = function(form)
{
	if(!(form instanceof NCSForm))
		throw "NCSFormStep.setForm only accepts NCSForm as parameter";

	this['form'] = form;
}

NCSFormStep.prototype.addField = function(field)
{
	field.setFormStep(this);
	field.setForm(this.form);
	this.fields.push(field);

	// listen to field validated events
	// dispatch step validated events

	// fields dispatches: "valid", "edited", "focusing", "focusDone"
}

NCSFormStep.prototype.fieldValid = function(field)
{
	// check if all fields are valid, if they are, activate the next button
	var valid = true;
	for(key in this.fields)
		valid &= this.fields[key].done();

	this.valid = valid;

	if(valid)
		this.form.stepValid(this);
	else
		this.form.stepInvalid(this);
}

NCSFormStep.prototype.fieldInvalid = function(field)
{
	this.valid = false;
	this.form.stepInvalid(this);	
}

NCSFormStep.prototype.isValid = function()
{
	return this.valid;
}

NCSFormStep.prototype.getProgress = function()
{
	var totalFields = 0;
	var doneFields = 0;
	var validFields = 0;

	for(key in this.fields)
	{
		totalFields++;
		var field = this.fields[key];
		if(field.done(true))
			doneFields++;
		if(field.isValid())
			validFields++;
	}

	return { total: totalFields, 
			  done: doneFields,
			 valid: validFields };
}