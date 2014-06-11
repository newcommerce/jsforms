function PostalCodeField(modelField, label)
{
	this.construct('postalcodefield', modelField, label, 7, 7);

	this['regex'] = /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$/i;
	this.setMessages("check", "H0H 0H0");
}
PostalCodeField.inherits(NCSFormField);

function TextAreaField(modelField, label, cols, rows)
{
	cols = cols || 20;
	rows = rows || 5;
	this.cols = cols;
	this.rows = rows;
	this.construct("textareafield", modelField, label);
	this['regex'] = /^.{10,}/i;
	this.setMessages("check", "come on, type a little");
}

TextAreaField.inherits(NCSFormField);

TextAreaField.prototype.createInputField = function()
{
	var containerId = this.getContainerId();
	var inputEl = document.createElement("textarea");
	inputEl.id = this.getInputId();
	inputEl.rows = this.rows;
	inputEl.cols = this.cols;

	this.inputEl = inputEl;
	this.registerInputFieldEvents();
}

function NameField(modelField, label, length, maxLength)
{
	this.construct("namefield", modelField, label, length, maxLength);
	
	this['regex'] = /^(?:[\u00c0-\u01ffa-zA-Z '-]){2,}$/i;
}
NameField.inherits(NCSFormField);

function EmailField(modelField, label, length, maxLength)
{
	this.construct('emailfield', modelField, label, length, maxLength);
	
	this['regex'] = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
	this['server_validate_func'] = "string_not_exists_exact";
	this['server_validate_good'] = "welcome to vraipro!";
	this['server_validate_bad'] = "email already exists for another account, please use another one";
	this.setMessages("check", "please enter valid email address");
}
EmailField.inherits(NCSFormField);

function ProfileUrlField(modelField, label, urlPrefix, length, maxLength)
{
	this['regex'] = /^[A-Za-z0-9._-]{2,}$/i;
	this['server_validate_func'] = "string_not_exists_exact";
	this['server_validate_good'] = "welcome to vraipro!";
	this['server_validate_bad'] = "this url is already in use, please try another one";

	this['urlPrefix'] = urlPrefix;

	this.construct('profileurlfield', modelField, label, length, maxLength);	
	this.setMessages("check", "use only letters, numbers, '_' '-' '.', at least 2 characters long");
}
ProfileUrlField.inherits(NCSFormField);


ProfileUrlField.prototype.getUrlPrefixId = function()
{
	return this.getContainerId() + "_urlPrefix";
}

ProfileUrlField.prototype.getLabelContainerId = function()
{
	return this.getLabelId()+"_container";
}

ProfileUrlField.prototype.createLabelEl = function()
{
	var labelContainerEl = document.createElement("div");
	labelContainerEl.id = this.getLabelContainerId();

	var preLabelEl = document.createElement("div");
	preLabelEl.id = this.getUrlPrefixId();

	var textNode = document.createTextNode(this.urlPrefix);
	preLabelEl.appendChild(textNode);

	var labelEl = document.createElement("div");
	labelEl.id = this.getLabelId();

	textNode = document.createTextNode(this.label);
	labelEl.appendChild(textNode);

	labelContainerEl.appendChild(preLabelEl);
	labelContainerEl.appendChild(labelEl);

	this['labelContainerEl'] = labelContainerEl;
	this['preLabelEl'] = preLabelEl;
	this['labelEl'] = labelEl;
}

ProfileUrlField.prototype.getPreLabelEl = function()
{
	return this.preLabelEl;
}

ProfileUrlField.prototype.getLabelContainerEl = function()
{
	return this.labelContainerEl;
}

function PhoneField(modelField, label)
{
	this.construct('phonefield', modelField, label, 12, 12);	

	// this['regex'] = /^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$/i;
	this['regex'] = /^(\([0-9]{3}\) ?|[0-9]{3}[-.])[0-9]{3}[-.][0-9]{4}$/i;
	this.setMessages("check", "888-888-8888");
}
PhoneField.inherits(NCSFormField);

function RBQField(modelField, label)
{
	this.construct("rbqfield", modelField, label, 12, 12);
	this.optional = true;
	this['regex'] = /^[0-9]{4}-?[0-9]{4}-?[0-9]{2}$/i;
	this.setMessages("check", "####-####-##");	
}
RBQField.inherits(NCSFormField);

function NumericField(modelField, label, length, maxLength)
{
	this.construct('numericfield', modelField, label, length, maxLength);
	
	this['regex'] = /^[0-9]+$/i;
	this.setMessages("check", "enter a number up to "+maxLength+" digit long");
}
NumericField.inherits(NCSFormField);

function DateField(modelField, label)
{
	this.construct('datefield', modelField, label, 10, 10)

	this['regex'] = /^[2][0][1][4-9]-[0-1]?[0-9]-[0-3][0-9]$/i;
	this.setMessages("check", "AAAA-MM-JJ");
}
DateField.inherits(NCSFormField);

function YearsExperienceField(modelField, label)
{
	this.construct("yearsexperiencefield", modelField, label, 2, 2);
	this['regex'] = /^[0-9]+$/i;
	this.setMessages("check", "enter a number up to "+this.maxLength+" digit long");
}
YearsExperienceField.inherits(NumericField);