
  function showSelection(userId)
  {
  	var style = window['ncsstyle'] = new VraiProAPPStyle();
    var model = window['ncsmodel'];    
    var form = window['ncsform'] = new NCSForm(model, "progressBar", "formContainer", "previousBtn", "bt_ok");

    // ------
	// PRE STEP

	var preStep = new APPPreStep(style, model, userId, function(projectId)
		 { 
		 	startModel(projectId);
		 });
	form.addStep(preStep);
    form.start();
  }

  function startModel(projectId)
  {
    var model = window['ncsmodel'] = new NCSModel("project", projectId);
    model.start();
    model.addEventListener('ready', function(event) { createForm(); });
  }

  function startModelAddOn()
  {
    var model = window['ncsmodel'];    
    var modelAddOn = window['modelAddOn'] = new NCSModel("project_entrepreneur", model.get("id"), true);
    modelAddOn.addEventListener('ready', function(event) { addFormSteps(); });
    modelAddOn.start();   
  }

  function createForm()
  {
    startModelAddOn();
    var style = window['ncsstyle'];
    var form = window['ncsform'];
    var model = window['ncsmodel'];

    form.setModel(model);

// ------
// STEP 1

    var step1 = form.createStep("first", style);
    var picsField = new TypedMultiFileUploadField("photo_type_id", "photo_type", "name", [2,3,4], "Photos de votre projet", 1, 4, "image/*");

    step1.addField(picsField);

// ------
// STEP 2

    var step2 = form.createStep("two", style);
    var secteurField = new SingleSelectRadioField("secteur_id", "", "secteur");   
    secteurField.setOptionStylizer(style);

    var categoryField = new SingleSelectionField("category_id", "", "category");
    var titleField = new NameField("title", "Donner un titre à votre projet");
    var descriptionField = new TextAreaField("description", "Soyez précis, ça attire les meilleurs pros!");

    step2.addField(secteurField);
    step2.addField(categoryField);
    step2.addField(titleField);
    step2.addField(descriptionField);

// ------ 
// DONE 

	form.next();

    // make steps work -- good, not perfect.
    // fix bug with server side validation
    // make multi-image upload work
    // make recursive selection work

    getEl("navBar").style.display = "";
  }

  function addFormSteps()
  {
    var modelAddOn = window['modelAddOn'];
    var form = window['ncsform'];

// ------
// STEP 3

    var step3 = form.createStep("third", null, modelAddOn);
    var lengthDaysField = new NumericField("lengthdays", "Jours", 2, 2);
    var lengthWeeksField = new NumericField("lengthweeks", "Semaines", 2, 2);
    var lengthHoursField = new NumericField("lengthhrs", "Heures", 2, 2);

    var costField = new NumericField("price", "Couts", 6, 8);

    step3.addField(lengthDaysField);
    step3.addField(lengthWeeksField);
    step3.addField(lengthHoursField);
    step3.addField(costField);
  }


// ---------------------------------------------
// Template Step
// ---------------------------------------------


function NCSTemplateStep(name, style, model, templateUrl, dataRequestUrl)
{
	this.type = 'ncstemplatestep';
	this.constructTemplateStep(name, style, model, templateUrl, dataRequestUrl);	
}

NCSTemplateStep.inherits(NCSFormStep);

NCSTemplateStep.prototype.constructTemplateStep = function(name, style, model, templateUrl, dataRequestUrl, dataRequestGetObj)
{
	this.templateUrl = templateUrl;
	this.dataRequestUrl = dataRequestUrl;
	this.dataRequestGetObj = dataRequestGetObj;
	this.templateLoaded = false;
	this.dataLoaded = false;
	this.spotIds = [];

	this.constructStep(name, style, model);
	this.load(templateUrl, dataRequestUrl, dataRequestGetObj);	
}

NCSTemplateStep.prototype.templateSuccess = function(event)
{
	var req = event.target;
	this.template = req.responseText;
	this.templateLoaded = true;

	this.digestTemplate();
}

NCSTemplateStep.prototype.dataSuccess = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);
	this.data = json;
	this.dataLoaded = true;

	this.digestTemplate();
}

NCSTemplateStep.prototype.templateError = function(event)
{
	// TODO: needs to be overridden
}

NCSTemplateStep.prototype.dataError = function(event)
{
	// TODO: needs to be overridden
}

NCSTemplateStep.prototype.digestTemplate = function()
{
	// TODO: needs to be overridden
}

NCSTemplateStep.prototype.load = function(templateUrl, dataRequestUrl, dataRequestGetObj)
{
	dataRequestGetObj = dataRequestGetObj || {};
	// templateUrl needs to be defined
	// dataRequestUrl needs to be defined	
	var windowVar = this.windowVar;

	ajaxGetTemplate(windowVar, 'templateSuccess', 'templateError', templateUrl, {});
	ajaxGet(windowVar, 'dataSuccess', 'dataError', dataRequestUrl, dataRequestGetObj);	
}

NCSTemplateStep.prototype.addField = function(field, spotId)
{
	field.setFormStep(this);
	field.setForm(this.form);
	this.fields.push(field);
	this.spotIds.push(spotId);
}

// add field with an element id to replace that element.

NCSTemplateStep.prototype.activate = function()
{
	this.active = true;
	this.displayTemplate();	
}

NCSTemplateStep.prototype.displayTemplate = function()
{
	if(this.active && ("templateEl" in this))
	{
		var container = this.form.getStepContainer();

		removeAllChilds(container);

		// show template
		container.appendChild(this.templateEl);

		var fieldDiv;
		var field;
		var spotId;
		var i = 0;
		
		for(key in this.fields)
		{
			field = this.fields[key];
			spotId = this.spotIds[key];

			if(this.style != undefined)
				fieldDiv = this.style.stylize(field, i);
			else
				fieldDiv = field.edit();

			container.appendChild(fieldDiv);
			i++;
		}
	}
	else if(this.active)
	{
		// do something smart!

	}
}



// ---------------------------------------------
// APP Pre Step
// ---------------------------------------------


function APPPreStep(style, model, userId, projectSelectionCB)
{
	userId = userId || 1;
	var name = "APPPreStep";
	var templateUrl = 'APP1_wrapper_projet.template.html';
	var dataRequestUrl = 'projectSummaryList.php';
	var dataRequestGetObj = { user_id: userId };
	this.projectSelectionCB = projectSelectionCB;
	this.constructTemplateStep("pre", style, model, templateUrl, dataRequestUrl, dataRequestGetObj);
}

APPPreStep.inherits(NCSTemplateStep);

APPPreStep.prototype.newProject = function()
{
	this.modifyProject(-1);
}

APPPreStep.prototype.modifyProject = function(projectId)
{
	alert("modifyProject("+projectId+")");
	this.projectSelectionCB(projectId);
}

APPPreStep.prototype.digestTemplate = function()
{
	if(!this.dataLoaded || !this.templateLoaded)
		return;

	// do this in the body
	var bodyEl = document.getElementsByTagName("body")[0];
	var contEl = document.createElement("div");
	contEl.style.display = "none";
	bodyEl.appendChild(contEl);

	var wrapperHTML = this.template;	
	contEl.innerHTML = wrapperHTML;

	var templateContainerEl = getEl("templateContainer");
	var titleEl = getEl("title");
	var projectWrapperEl = getEl("projectWrapper");
	var newProjectWrapperEl = getEl("newProjectWrapper");	
	var projectsContainerEl = getEl("projectsContainer");
	var arrowEl = getEl("arrow");

	projectsContainerEl.removeChild(projectWrapperEl);

	// template container
		// title first
		// project container
			// new project
			// old projects
		// arrow

	removeAllChilds(contEl);
	bodyEl.removeChild(contEl);

	var projectEl;
	var projects = this.data.projects;

	// match buttons to actions (add project)

	var newBtnEl = getElementIn(newProjectWrapperEl, "newProjectButton");
	var windowVar = this.windowVar;
	newBtnEl.addEventListener("click", function(event) { window[windowVar].newProject(); }, false);

	for(var i = 0; i < projects.length; i++)
	{
		projectEl = projectWrapperEl.cloneNode(true);
		this.createProject(projects[i], projectEl);
		projectsContainerEl.appendChild(projectEl);
	}

	this.templateEl = templateContainerEl;
	this.displayTemplate();
}

APPPreStep.prototype.createProject = function(projectData, projectEl)
{
	var titleEl = getElementIn(projectEl, "project_title");
	var locationEl = getElementIn(projectEl, "project_location");
	var dateEl = getElementIn(projectEl, "project_date");
	var projectId = projectData.id;
	var windowVar = this.windowVar;

	var addPicBtnEl = getElementIn(projectEl, "addPictureBtn");
	addPicBtnEl.addEventListener("click", function(event) { window[windowVar].modifyProject(projectId); }, false);

	removeAllChilds(titleEl);
	removeAllChilds(locationEl);
	removeAllChilds(dateEl);
	dateEl.appendChild(createText(projectData.moment));
	titleEl.appendChild(createText(projectData.title));

	var i = 0;
	var moment;
	var photoData;
	var photos = projectData.photos;
	var photoMoments = [];

	// create a loop that loops through the pictures
	while(i < photos.length)
	{
		moment = photos[i]['type'];

		if(!(moment in photoMoments))
			photoMoments[moment] = [];

		photoMoments[moment].push(photos[i]);
		i++;
	}

	var momentsWrapperEl = getElementIn(projectEl, "momentsWrapper");
	// clone this one
	var momentWrapperEl = getElementIn(momentsWrapperEl, "momentWrapper");
	removeAllChilds(momentsWrapperEl);

	for(moment in photoMoments)
	{
		var wrapperEl = momentWrapperEl.cloneNode(true);
		photos = photoMoments[moment];

		this.createPhotoMoment(moment, photos, wrapperEl);
		momentsWrapperEl.appendChild(wrapperEl);
	}
}

APPPreStep.prototype.createPhotoMoment = function(moment, photos, wrapperEl)
{
	// get the momentSousWrapper
	var momentSousWrapperEl = getElementIn(wrapperEl, "momentSousWrapper");

	// get a picture element too
	var photoWrapperEl = getElementIn(momentSousWrapperEl, 'photoWrapper');	
	
	// remove all childs from momentSousWrapper
	removeAllChilds(momentSousWrapperEl);

	// get the typeNameEl
	var typeNameEl = getElementIn(wrapperEl, "projectPhotoTypeName");

	var photoData;
	for(var i = 0; i < photos.length; i++)
	{
		var photoEl = photoWrapperEl.cloneNode(true);		
		photoData = photos[i];
		var imgEl = getElementIn(photoEl, "momentImage");
		imgEl.src = photoData.url;
		momentSousWrapperEl.appendChild(photoEl);
	}

	removeAllChilds(typeNameEl);
	typeNameEl.appendChild(createText(moment));
}