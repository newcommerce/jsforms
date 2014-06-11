function NCSFieldStyle(brCount)
{
	this['brCount'] = brCount || 3;
}

NCSFieldStyle.prototype.getElement = function(containerEl, id)
{
	var level = 0;
	var index = [];
	index[0] = 0;
	var el = containerEl;
	while(level >= 0)
	{
		for(; index[level] < el.children.length; index[level]++)
		{
			el = el.children[index[level]];
			index[level]++;

			level++;
			index[level] = 0;
			break;
		}

		if(el.id == id)
			return el;
		
		if(index[level] >= el.children.length)
		{
			el = el.parentNode;
			level--;
		}
	}
}

NCSFieldStyle.prototype.blueifyLabel = function(labelEl)
{
	// LABEL
	labelText = labelEl.innerHTML;
	labelTextNode = document.createTextNode(labelText);

	var labelDiv = createEl("div");
	labelDiv.appendChild(labelTextNode);
	labelDiv.className = "fluid Flow_dialogue_texte_bleu";

	var parentEl = labelEl.parentNode;
	parentEl.insertBefore(labelDiv, labelEl);
	parentEl.removeChild(labelEl);
}

NCSFieldStyle.prototype.redifyComment = function(commentEl)
{
	var commentId = commentEl.id;
	var parentEl = commentEl.parentNode;
	parentEl.removeChild(commentEl);

	var commentEl = document.createElement("div");
	commentEl.id = commentId;
	commentEl.className = "fluid message_confirmation";

	// parentEl.appendChild(brEl);
	parentEl.appendChild(commentEl);

	for(var i = 0; i < this.brCount; i++)
		parentEl.appendChild(document.createElement("br"));
}

NCSFieldStyle.prototype.styleInput = function(inputEl, size, maxLength)
{
	size = size || 18;
	maxLength = maxLength || 30;

	inputEl.size = size;
	inputEl.maxLength = maxLength;
	inputEl.className = "form";
}

NCSFieldStyle.prototype.labelAsPlaceHolder = function(labelEl, inputEl)
{
	var labelText = labelEl.textContent;
	parentEl = inputEl.parentNode;
	inputEl.placeholder = labelText;
	labelEl.parentNode.removeChild(labelEl);
}

NCSFieldStyle.prototype.removeBrAfter = function(element)
{
	var parentEl = element.parentNode;

	while(element.nextSibling.localName == "br")
		parentEl.removeChild(element.nextSibling);
}

NCSFieldStyle.prototype.swap = function(newEl, oldEl, copyId)
{
	copyId = copyId || true;
	if(copyId)
		newEl.id = oldEl.id;

	var parentEl = oldEl.parentNode;
	parentEl.insertBefore(newEl, oldEl);
	parentEl.removeChild(oldEl);
}

NCSFieldStyle.prototype.stylize = function(field)
{
	var containerEl = field.edit();

	var fieldClass = get_class(field);

	// or depending on type.
	// TODO: read the field style

	var containerId = containerEl.id;
	var labelId = field.getLabelId();
	var commentId = field.getCommentId();
	var inputId = field.getInputId();

	var labelEl = this.getElement(containerEl, labelId);
	var commentEl = this.getElement(containerEl, commentId);
	var inputEl = this.getElement(containerEl, inputId);

	var labelText = labelEl.textContent;
	var brEl;
	var parentEl;

	if(fieldClass == "RBQField")
	{
		this.blueifyLabel(labelEl);
		this.styleInput(inputEl, 12, 12);
		parentEl = inputEl.parentNode;
		parentEl.insertBefore(createEl("br"), inputEl);
		parentEl.insertBefore(createEl("br"), inputEl);
	}

	else if(fieldClass == "MultiSelectionField")
	{
		this.blueifyLabel(labelEl);
		// don't touch the rest for now...
	}

	else if(fieldClass == "ProfileUrlField")
	{
		var labelContainerId = field.getLabelContainerId();
		var labelContainerEl = this.getElement(containerEl, labelContainerId);

		var prefixId = field.getUrlPrefixId();
		var urlPrefixEl = this.getElement(labelContainerEl, prefixId);
		var prefixText = urlPrefixEl.textContent;
		var prefixTextEl = document.createTextNode(prefixText);		
		var labelTextEl = document.createTextNode(labelText);
		var urlContainerEl = createEl("div");

		containerEl = document.createElement("span");

		labelEl = createEl("div");
		labelEl.className = "fluid FLOW_dialogue_texte";
		labelEl.appendChild(labelTextEl);

		containerEl.appendChild(labelEl);
		containerEl.appendChild(createEl("br"));
		containerEl.appendChild(createEl("br"));

		urlPrefixEl = createEl("div");
		urlPrefixEl.className = "fluid CPP3_texte_wwwvraipro";
		urlPrefixEl.appendChild(prefixTextEl);
		this.styleInput(inputEl);
		inputEl.className = "form CPP3_nom_profil";

		urlContainerEl.className = "CPP3_wwwvraipro";
		urlContainerEl.appendChild(urlPrefixEl);
		urlContainerEl.appendChild(inputEl);

		containerEl.appendChild(urlContainerEl);

		commentEl.parentNode.removeChild(commentEl);
		containerEl.appendChild(commentEl);
	}
	else if(fieldClass == "TriangleValeursField")
	{
		parentEl = labelEl.parentNode;
		parentEl.insertBefore(createEl("br"), labelEl.nextSibling);
		parentEl.insertBefore(createEl("br"), labelEl.nextSibling);
	}
	else if(fieldClass == "YearsExperienceField")
	{
		var labelDiv = createEl("div");
		labelDiv.className = "CPP6_texte_annees_exp";	
		labelDiv.appendChild(document.createTextNode(labelEl.textContent));	
		this.swap(labelDiv, labelEl);		
		this.styleInput(inputEl, 4, 2);
		inputEl.className = "CPP6_champ_annes_exp";
		containerEl.className = "fluid CPP6_wrapper_experience";
	}
	else if(fieldClass == "FlexibleMultiSelectionField")
	{
		this.blueifyLabel(labelEl);

		var moreContainerId = field.getMoreContainerId();
		var moreLabelId = field.getMoreLabelId();
		var moreButtonId = field.getMoreButtonId();
		var moreInputId = field.getMoreInputId();

		var moreContainerEl = this.getElement(containerEl, moreContainerId);
		var moreLabelEl = this.getElement(containerEl, moreLabelId);
		var moreButtonEl = this.getElement(containerEl, moreButtonId);
		var moreInputEl = this.getElement(containerEl, moreInputId);

		if(moreLabelEl != null && moreLabelEl.parentNode == moreContainerEl)
		{
			moreContainerEl.removeChild(moreLabelEl);
			moreInputEl.placeholder = moreLabelEl.textContent;
		}

		moreContainerEl.className = "fluid CPP8_wrapper_ajouter";
		removeAllChilds(moreContainerEl);

		moreInputEl.size = 35;
		moreInputEl.maxLength = 50;
		moreInputEl.className = "CPP8_ajouter_atout";
		moreInputEl.placeholder = "ajouter";
		removeFromParent(moreInputEl);

		moreButtonEl.className = "CPP8_bouton_ajouter_atout";
		moreButtonEl.value = "+";
		removeFromParent(moreButtonEl);

		var moreSubContEl = createEl('div');
		moreSubContEl.className = "fluid CPP8_souswrapper_ajouter";
		
		moreContainerEl.appendChild(moreSubContEl);
		moreSubContEl.appendChild(moreInputEl);
		moreSubContEl.appendChild(moreButtonEl);
	}
	else if(fieldClass == "FreeFormMultiValueField")
	{
		this.blueifyLabel(labelEl);

		var fieldEl = field.getFieldEl();
		removeFromParent(fieldEl);

		var btnEl = field.getBtnEl();
		removeFromParent(btnEl);
		btnEl.value = "+";
		
		fieldEl.className = "CPP8_ajouter_atout";
		fieldEl.placeholder = "... une de vos spécialités";
		btnEl.className = "CPP8_bouton_ajouter_atout";

		var addContainerDiv = createEl("div");
		addContainerDiv.className = "fluid CPP8_wrapper_ajouter";

		var addSubContDiv = createEl("div");
		addSubContDiv.className = "fluid CPP8_souswrapper_ajouter";

		addContainerDiv.appendChild(addSubContDiv);
		addSubContDiv.appendChild(fieldEl);
		addSubContDiv.appendChild(btnEl);

		removeNextSiblings(commentEl);

		containerEl.insertBefore(addContainerDiv, commentEl.nextSibling);
	}
	else if(fieldClass == "AttributedMultiSelectionField")
	{
		this.blueifyLabel(labelEl);

		var addBtnEl = field.getAddBtnEl();
		removeFromParent(addBtnEl);

		var attrLabelEl = field.getAttributeLabelEl();
		removeFromParent(attrLabelEl);

		var selectEl = field.getSelectEl();
		removeFromParent(selectEl);

		addBtnEl.className = "CPP8_bouton_ajouter_atout";
		selectEl.className = "CPP8_ajouter_atout";		
		labelEl.className = "CPP5_ou_non_CCQ";

		var addContainerDiv = createEl("div");
		addContainerDiv.className = "fluid CPP8_wrapper_ajouter";

		var addSubContDiv = createEl("div");
		addSubContDiv.className = "fluid CPP8_souswrapper_ajouter";

		addContainerDiv.appendChild(addSubContDiv);
		addSubContDiv.appendChild(selectEl);
		addSubContDiv.appendChild(attrLabelEl);
		addSubContDiv.appendChild(addBtnEl);

		removeNextSiblings(commentEl);
		if(inputEl.firstChild == null)
		{
			inputEl.appendChild(createEl("br"));
			inputEl.appendChild(createEl("br"));
		}

		containerEl.insertBefore(addContainerDiv, commentEl.nextSibling);
	}
	else if(fieldClass == "MultiFileUploadField")
	{
		this.blueifyLabel(labelEl);
	}
	else
	{
		// COMMON FIELDS
		if(inputEl != undefined)
		{
			if(inputEl.localName == "input");
			{
				this.labelAsPlaceHolder(labelEl, inputEl);				
				this.styleInput(inputEl, 32);
				this.removeBrAfter(inputEl);		
			}
			
			if(inputEl.localName == 'textarea')
			{
				inputEl.className = "description_projet";				
				inputEl.placeholder = labelText;

				if(field.field == "mission_statement")
				{
					var otherLabelEl = createEl("div");					
					otherLabelEl.appendChild(document.createTextNode("Une phrase que vous diriez pour vous présenter à un nouveau client"));
					inputEl.parentNode.insertBefore(otherLabelEl, inputEl);
					inputEl.className = "description_projet";
				}
			}
		}
	}

	if(commentEl != undefined)
		this.redifyComment(commentEl);

	return containerEl;
}