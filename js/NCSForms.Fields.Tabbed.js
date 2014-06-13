// ---------------------------------------------
// FORM FIELD
// ---------------------------------------------


function NCSTabbedMultiSelection(fields, labels, label)
{
	this.fields = fields;
	this.labels = labels;	
	this.construct("ncstabbedmultiselection", "", label);	
}

NCSTabbedMultiSelection.inherits(NCSFormField);

NCSTabbedMultiSelection.prototype.formSet = function()
{
	// set the form in all fields;
	var field;
	for(key in this.fields)
	{
		field = this.fields[key];
		field.setForm(this.form);
	}	
}

NCSTabbedMultiSelection.prototype.setOptionStylizer = function(optionStylizer)
{
	var field;
	for(key in this.fields)
	{
		field = this.fields[key];
		field.setOptionStylizer(optionStylizer);
	}
}

NCSTabbedMultiSelection.prototype.getInputEl = function()
{
	var containerEl;	
	var labelEl;
	var field;
	for(key in this.fields)
	{
		field = this.fields[key];
		containerEl = field.edit();		
		labelEl = field.getLabelEl();
		commentEl = field.getCommentEl();
		containerEl.removeChild(labelEl);
		containerEl.removeChild(commentEl);
	}

	return this.inputEl;

	// call edit on all fields
}

NCSTabbedMultiSelection.prototype.createContainerEl = function()
{
	var containerEl = createEl("div");
	containerEl.id = this.getContainerId();
	this.containerEl = containerEl;
}

// create containerEl
NCSTabbedMultiSelection.prototype.createInputField = function()
{	
	var inputEl = document.createElement("div");
	inputEl.id = "tabs";

	var ulEl = createEl("ul");
	inputEl.appendChild(ulEl);
	var liEl;
	var divEl;
	var field;
	var aEl;

	var i = 1;

	for(key in this.fields)
	{
		field = this.fields[key];
		liEl = createEl("li");
		aEl = createEl("a");
		aEl.href = "#tabs-"+i;
		aEl.appendChild(createText(field.label))
		liEl.appendChild(aEl);
		ulEl.appendChild(liEl);
		divEl = createEl("div");
		inputEl.appendChild(divEl);
		divEl.className = "APC_espace_tab";
		divEl.id = "tabs-"+i;
		divEl.appendChild(field.getContainerEl());

		field.setFormStep(this);
		i++;
	}	

	this.inputEl = inputEl;
}

NCSTabbedMultiSelection.prototype.assembleElements = function()
{
	var containerEl = this.getContainerEl();
	var inputEl = this.getInputEl();
	var labelEl = this.getLabelEl();
	var commentEl = this.getCommentEl();

	while(containerEl.firstChild != null)
		containerEl.removeChild(containerEl.firstChild);

	containerEl.appendChild(labelEl);
	containerEl.appendChild(inputEl);
	var scriptEl = createEl("script");
	scriptEl.appendChild(createText("$(function() {	$( \"#tabs\" ).tabs(); });"));	
	containerEl.appendChild(scriptEl);

	return containerEl;
}

NCSTabbedMultiSelection.prototype.getTabEls = function()
{

}

NCSTabbedMultiSelection.prototype.fieldValid = function(field)
{

}

NCSTabbedMultiSelection.prototype.fieldInvalid = function(field)
{

}

NCSTabbedMultiSelection.prototype.validate = function()
{

}
