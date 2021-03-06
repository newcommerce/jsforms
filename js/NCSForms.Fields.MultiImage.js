//-----------------------------
// Multiple Image Upload
//-----------------------------

function MultiFileUploadField(typeId, typeName, label, min, max, allowedMimeTypeWildCard)
{
	this.type = "multifileuploadfield";
	this.constructMFUF(typeId, typeName, label, min, max, allowedMimeTypeWildCard);
}

MultiFileUploadField.inherits(NCSFormField);

MultiFileUploadField.prototype.constructMFUF = function(typeId, typeName, label, min, max, allowedMimeTypeWildCard)
{
	min = min || 1;
	max = max || 2;
	typeName = typeName || "";
	allowedMimeTypeWildCard = allowedMimeTypeWildCard || "*/*";
	this.maxFiles = max;
	this.allowedMimeType = allowedMimeTypeWildCard;
	this.typeId = typeId;	 // this should be editable
	this.typeName = typeName;
	this.acceptedFiles = [];
	this.minFiles = min;
	this.description = "";
	this.construct(this.type, "", label);	
}

MultiFileUploadField.prototype.formSet = function()
{
	this.loadPhotos();	
}

MultiFileUploadField.prototype.loadPhotos = function()
{
	var postObj = this.getLoadPhotosParams();
	var url = "getPhotos.php";

	ajaxPost(this.windowVar, "photosRetreived", "photoRetreivalFailed", url, postObj);

	this.focused = true;
}

MultiFileUploadField.prototype.getLoadPhotosParams = function()
{
	var owner = this.form.model.model;
	var ownerId = this.form.model.values['id'];
	var typeId = this.typeId;

	return { owner: owner, owner_id: ownerId, type_id: typeId };
}

MultiFileUploadField.prototype.addImage = function(id, url, originalName, width, height, typeName, mime)
{
	var windowVar = this.windowVar;
	var image = new UploadedImage(id, url, originalName, width, height, typeName, mime, function(image) { window[windowVar].imageDeleted(image); });
	this.acceptedFiles.push(image);
	image.show(this.resultsContainerEl);
}

MultiFileUploadField.prototype.photosRetreived = function(event)
{
	var exp = /^[a-z]+_[0-9]+_[0-9]+_(.+)$/i;
	var req = event.target;
	var response = JSON.parse(req.responseText);
	var photos = response['photos'];
	var windowVar = this.windowVar;

	if(photos instanceof Array && photos.length > 0)
	{
		for(var i = 0; i < photos.length; i++)
		{
			var id = photos[i].id;
			var owner = photos[i].owner;
			var ownerId = photos[i].owner_id;
			var mime = photos[i].mime_type;
			var description = photos[i].description;
			var url = photos[i].url;
			var filename = url.substring(url.lastIndexOf("/")+1);
			var matches = exp.exec(filename);
			var originalName = matches[1];
			var width = photos[i].original_width;
			var height = photos[i].original_height;
			var typeId = photos[i].type_id;
			var typeName = photos[i].type_name;
			this.addImage(id, url, originalName, width, height, typeName, mime);
		}	
		this.edited = true;	
	}

	this.progressEl.value = 0;
	this.fileInputEl.value = "";
	this.activateButtons();
	this.focused = false;

	this.validate();
}

MultiFileUploadField.prototype.photoRetreivalFailed = function(event)
{
	this.activateButtons();
}

MultiFileUploadField.prototype.getFileInputId = function()
{
	return this.getContainerId()+"_file";
}

MultiFileUploadField.prototype.createInputField = function()
{
	var windowVar = this.windowVar;
	var containerId = this.getContainerId();
	var fileInputId = this.getFileInputId();
	var fileInputEl = document.createElement("input");
	fileInputEl.type = "file";	
	fileInputEl.id = fileInputId;
	fileInputEl.accept = this.allowedMimeType;
	fileInputEl.addEventListener("change", function(event) { window[windowVar].fileSelected(); });

	var buttonInputEl = document.createElement("input");
	buttonInputEl.type = "button";
	buttonInputEl.value = "upload file";
	buttonInputEl.addEventListener("click", function(event) { window[windowVar].startUpload(event); });
	buttonInputEl.disabled = true;

	var progressEl = document.createElement("progress");
	progressEl.value = 0;
	progressEl.max = 100;
	progressEl.style.visibility = "hidden";	


	var editContainerEl = document.createElement("span");
	var containerEl = document.createElement("div");
	var typesContainerEl = createEl("div");
	
	containerEl.appendChild(editContainerEl);
	editContainerEl.appendChild(typesContainerEl);
	editContainerEl.appendChild(progressEl);
	editContainerEl.appendChild(fileInputEl);	
	editContainerEl.appendChild(buttonInputEl);	

	typesContainerEl.style.visibility = "hidden";

	var resultsContainerEl = createEl("div");

	containerEl.appendChild(resultsContainerEl);

	this['inputEl'] = containerEl;
	this['editContainerEl'] = editContainerEl;
	this['fileInputEl'] = fileInputEl;
	this['buttonInputEl'] = buttonInputEl;
	this['progressEl'] = progressEl;
	this['resultsContainerEl'] = resultsContainerEl;
	this['typesContainerEl'] = typesContainerEl;
	containerEl.id = this.getInputId();
}

MultiFileUploadField.prototype.fileSelected = function()
{
	this.activateButtons();
}

MultiFileUploadField.prototype.getTypesContainerEl = function()
{
	return this.typesContainerEl;
}

MultiFileUploadField.prototype.getResultsContainerEl = function()
{
	return this.resultsContainerEl;
}

MultiFileUploadField.prototype.getInputEl = function()
{
	return this.inputEl;
}

MultiFileUploadField.prototype.getEditContainerEl = function()
{
	return this.editContainerEl;
}

MultiFileUploadField.prototype.getFileInputEl = function()
{
	return this.fileInputEl;
}

MultiFileUploadField.prototype.getButtonInputEl = function()
{
	return this.buttonInputEl;
}

MultiFileUploadField.prototype.getProgressEl = function()
{
	return this.progressEl;
}

MultiFileUploadField.prototype.startUpload = function(event)
{
	// TODO: make sure there is a file
	// event

	if(this.fileInputEl.value == "")
		return;

	this.focused = true;
	this.edited = true;
	var windowVar = this.windowVar;
	var model = this.form.model.model;
	var modelId = this.form.model.values.id;
	var description = this.description;

	var url = "saveimage.php?owner="+encUC(model)+"&ownerId="+encUC(modelId);
	
	var windowVar = this.windowVar;

	var postObj = { image: this.fileInputEl.files[0], owner: model, ownerId: modelId, description: description, typeId: this.typeId };
	var ajax = ajaxPost(this.windowVar, "uploadComplete", "uploadError", url, postObj, "uploadProgress");	

	this.fileInputEl.disabled = true;
	this.buttonInputEl.disabled = true;	

	// show progress
	this.getProgressEl().style.visibility = "visible";
}

MultiFileUploadField.prototype.uploadProgress = function(event)
{
	var loaded = event.loaded;
	var total = event.total;
	var percent = Math.round((loaded / total) * 100);
	this.progressEl.value = percent;
}

MultiFileUploadField.prototype.uploadError = function(event) 
{
	// TODO: do something
	this.focused = false;
}

MultiFileUploadField.prototype.uploadComplete = function(event)
{
	var req = event.target;
	var response = JSON.parse(req.responseText);
	var id = response['id'];
	var width = response['width'];
	var height = response['height'];
	var mime = response['mime'];
	var url = response['url'];

	var originalName = response['originalName'];
	var windowVar = this.windowVar;
	var cb = function(image) { window[windowVar].imageDeleted(image); }

	var image = new UploadedImage(id, url, originalName, width, height, this.typeName, mime, cb);

	this.acceptedFiles.push(image);
	image.show(this.resultsContainerEl);

	this.progressEl.value = 0;
	this.fileInputEl.value = "";
	this.activateButtons();
	this.focused = false;

	this.validate();

	// hide progress
	this.progressEl.style.visibility = "hidden";

	this.uploadCompleted();
}

MultiFileUploadField.prototype.uploadCompleted = function()
{

}

MultiFileUploadField.prototype.activateButtons = function()
{
	this.fileInputEl.disabled = (this.acceptedFiles.length >= this.maxFiles);
	this.buttonInputEl.disabled = (this.fileInputEl.value == "" || this.fileInputEl.disabled);
}

MultiFileUploadField.prototype.imageDeleted = function(image)
{
	var idx = this.acceptedFiles.indexOf(image);
	if(idx != -1)
		this.acceptedFiles.splice(idx, 1);
	this.activateButtons();
	this.validate();
}

MultiFileUploadField.prototype.validate = function()
{
	if(this.acceptedFiles.length >= this.minFiles && this.acceptedFiles.length <= this.maxFiles)
	{
		this.valid = true;
		this.displayGood();
		this.valueAcceptable();
	}
	else
	{
		this.valid = false;
		this.displayBad();
		this.valueUnacceptable();
	}
}



// ----------------------------------------
// TypedMultiFileUploadField
// ----------------------------------------

function TypedMultiFileUploadField(typeField, sourceModel, sourceDisplayField, allowedTypes, label, min, max, allowedMimeTypeWildCard)
{
	allowedTypes = allowedTypes || [1]
	this.allowedTypes = allowedTypes;
	this.typeField = typeField;
	this.sourceModel = sourceModel;
	this.sourceDisplayField = sourceDisplayField;		
	this.type = "typedmultifileuploadfield";
	this.constructMFUF(-1, "", label, min, max, allowedMimeTypeWildCard);
	this.radioLabels = [];
}

TypedMultiFileUploadField.inherits(MultiFileUploadField);

TypedMultiFileUploadField.prototype.getLoadPhotosParams = function()
{
	var owner = this.form.model.model;
	var ownerId = this.form.model.values['id'];
	var typeIds = this.allowedTypes.join(",");

	return { owner: owner, owner_id: ownerId, type_ids: typeIds };
}

TypedMultiFileUploadField.prototype.fileSelected = function()
{
	var containerEl = this.getTypesContainerEl();
	containerEl.style.visibility = "visible";
	for(var key in this.radioLabels)
	{
		this.radioLabels[key].firstChild.checked = false;
	}

	this.fileInputEl.disabled = (this.acceptedFiles.length >= this.maxFiles);
}

TypedMultiFileUploadField.prototype.activateButtons = function()
{
	// add condition that the data was received
	this.fileInputEl.disabled = (this.acceptedFiles.length >= this.maxFiles);
	this.buttonInputEl.disabled = (this.fileInputEl.value == "" || this.fileInputEl.disabled);
}

TypedMultiFileUploadField.prototype.loadValues = function()
{
	if(this.valuesLoaded == true)
		return;

	var containerEl = this.getTypesContainerEl();
	this.radioLabels = [];
	removeAllChilds(containerEl);	

	var model = this.sourceModel;
	var displayField = this.sourceDisplayField;
	var val = -1;

	var url = "multi_select.php?model="+encUC(model)+
			           "&displayField="+encUC(displayField)+
	        	            "&default="+encUC(val)+	
		                   "&selectId=none";

    if(this.allowedTypes != undefined && this.allowedTypes.length > 0)
    {
    	var condition = "`id` IN ('"+this.allowedTypes.join("','")+"')";
    	url += "&condition="+encUC(condition);
	}

	ajaxGet(this.windowVar, "valuesReceived", "valuesReceiptionError", url, {});	                   
}

TypedMultiFileUploadField.prototype.valuesReceived = function(event)
{
	var req = event.target;
	var response = JSON.parse(req.responseText);
	var selectId = response.selectId;
	var values = response.values;

	var def = response['default'];
	def = def || -1;

	// values is key / value pair

	var total = values.length;
	var i = 0;
	for(i = 0; i < total; i++)
	{
		this.addTypeOption(values[i]);
	}

	this.valuesLoaded = true;
}

TypedMultiFileUploadField.prototype.getRadioName = function()
{
	return this.getContainerId()+"_type";
}

TypedMultiFileUploadField.prototype.getRadioLabelId = function(index)
{
	return this.getContainerId()+"_radioLabel_"+index;
}

TypedMultiFileUploadField.prototype.getRadioId = function(index)
{
	return this.getContainerId()+"_radio_"+index;
}

TypedMultiFileUploadField.prototype.addTypeOption = function(valueObj, def)
{
	var windowVar = this.windowVar;
	var key = valueObj.key;
	var val = valueObj['value'];

	var radioEl = document.createElement("input");
	radioEl.type = 'radio';
	radioEl.name = this.getRadioName();
	if(def == key)
		radioEl.checked = true;

	radioEl.value = key;
	radioEl.id = this.getRadioId();

	var labelEl = document.createElement("label");
	labelEl.id = this.getRadioLabelId(this.radioLabels.length);

	var textNode = document.createTextNode(val);
	labelEl.appendChild(radioEl);
	labelEl.appendChild(textNode);

	radioEl.addEventListener("click", function(event) { window[windowVar].selectionChanged(event); }, false);

	var containerEl = this.getTypesContainerEl();
	containerEl.appendChild(labelEl);
	this.radioLabels.push(labelEl);
}

TypedMultiFileUploadField.prototype.selectionChanged = function(event)
{
	var element = event.target;

	var index = this.radioLabels.indexOf(element);
	while(index == -1)
	{
		element = element.parentNode;
		index = this.radioLabels.indexOf(element);
	} while(index == -1);

	var inputEl = this.radioLabels[index].firstChild;

	this.typeId = inputEl.value;	
	this.typeName = this.radioLabels[index].textContent;
	this.startUpload(event);

	for(var key in this.radioLabels)
	{
		this.radioLabels[key].firstChild.disabled = true;
	}
}

TypedMultiFileUploadField.prototype.valuesReceiptionError = function(event)
{
	// not sure what to do.
}

TypedMultiFileUploadField.prototype.uploadCompleted = function()
{
	this.getTypesContainerEl().style.visibility = "hidden";

	for(var key in this.radioLabels)
	{
		this.radioLabels[key].firstChild.disabled = false;
	}
}

TypedMultiFileUploadField.prototype.getInputEl = function()
{
	this.loadValues();
	this.getButtonInputEl().style.display = "none";
	return this.inputEl;
}


// UPLOADED IMAGE OBJECT
function UploadedImage(id, url, originalName, width, height, typeName, mimeType, deletedCB)
{
	this['id'] = id;
	this['url'] = url;
	this['originalName'] = originalName;
	this['state'] = 'creating';
	this['width'] = width;
	this['height'] = height;
	this['mimeType'] = mimeType;
	this['deletedCB'] = deletedCB;
	this['type'] = "uploadedimage";
	this['innerId'] = sequence(this.type, this);
	this['windowVar'] = this.type+"_"+this.innerId;	
	this['typeName'] = typeName;
}

UploadedImage.inherits(DeletableSelectedOption);

UploadedImage.prototype.show = function(containerEl)
{
	this['state'] = "alive";

	this['containerEl'] = containerEl;
	var element = this['element'] = this.createElement();
	this.populateElement(element);
	containerEl.appendChild(element);	
}

UploadedImage.prototype.populateElement = function(element)
{
	var windowVar = this.windowVar;

	element.className = "fluid FLOW_wrapper_thumbnail";
	var wrapperEl = createEl("div");
	wrapperEl.className = "fluid FLOW_thumbnail";
	element.appendChild(wrapperEl);

	var imgEl = createEl("img");
	imgEl.src = this.url;
	imgEl.width = 64;
	imgEl.height = 64;
	wrapperEl.appendChild(imgEl);	

	if(this.state == "alive" || this.state == "creating")
	{
		var btnEl = createEl("button");	
		btnEl.addEventListener("click", function(event) { window[windowVar].delete(); }, false);
		btnEl.appendChild(createText("x"));
		btnEl.className = "bouton supprimer_photo";
		element.appendChild(btnEl);
	}
	else if(this.state == "deleting")
	{
		element.appendChild(createText("(deleting)"));
	}

	var typeEl = createEl("div");
	typeEl.className = "fluid APC6_avant_pendant_apres";
	typeEl.appendChild(createText(this.typeName));
	element.appendChild(typeEl);
}

UploadedImage.prototype.delete = function()
{
	this['state'] = 'deleting';
	var element = this['element'];
	removeAllChilds(element);

	this.populateElement(element);

	var url = "deleteImage.php";
	var id = this.id;
	var getObj = { id : id };	
	var windowVar = this.windowVar;

	ajaxGet(windowVar, "deleteSuccess", "deleteFailure", url, getObj);
}