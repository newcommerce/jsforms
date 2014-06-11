// ----------------------------------------
// NCSFieldStyle
// ----------------------------------------

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

NCSFieldStyle.prototype.stylizeByClass = function(field, fieldClass, containerEl)
{
	return false;
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

	if(this.stylizeByClass(field, fieldClass, containerEl))
	{
		// we're happy!
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


// ----------------------------------------
// VraiProStyle
// ----------------------------------------

function VraiProStyle(brCount)
{
	this['brCount'] = brCount || 3;	
}

VraiProStyle.inherits(NCSFieldStyle);

VraiProStyle.prototype.blueifyLabel = function(labelEl)
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


VraiProStyle.prototype.redifyComment = function(commentEl)
{
	commentEl.className = "fluid message_confirmation";

	var parentEl = commentEl.parentNode;
	for(var i = 0; i < this.brCount; i++)
		parentEl.appendChild(document.createElement("br"));
}

VraiProStyle.prototype.styleInput = function(inputEl, size, maxLength)
{
	size = size || 18;
	maxLength = maxLength || 30;

	inputEl.size = size;
	inputEl.maxLength = maxLength;
	inputEl.className = "form";
}

// ----------------------------------------
// VraiProCPPStyle
// ----------------------------------------

function VraiProAPCStyle(brCount)
{
	this['brCount'] = brCount || 3;
}

VraiProAPCStyle.inherits(VraiProStyle);

VraiProAPCStyle.prototype.stylizeByClass = function(field, fieldClass, containerEl)
{
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

	if(fieldClass == "SingleSelectIconField")
	{
		var optionsContEl = field.getOptionsContainerEl();
		field.setOptionStylizer(this);				
	}
	else
		return false;

	return true;
}

VraiProAPCStyle.prototype.stylizeOption = function(field, optionEl)
{
	var fieldClass = get_class(field);
	if(fieldClass == "SingleSelectIconField")
	{
		optionEl.className = "bouton APC_wrapper_grand_icone1";

		if(optionEl.firstChild != null)
		{
			optionEl.firstChild.className = "fluid APC_iconholder_grand";
			if(optionEl.firstChild.nextSibling != null)
				optionEl.firstChild.nextSibling.className = "fluid APC_texte_grand_icone";
		}
	}

	return optionEl;
}


// ----------------------------------------
// VraiProCPPStyle
// ----------------------------------------

function VraiProCPPStyle(brCount)
{
	this['brCount'] = brCount || 3;
}

VraiProCPPStyle.inherits(VraiProStyle);

VraiProCPPStyle.prototype.addBoardCharac = function(boardEl, valueEl, title)
{
	var characEl = createEl("div");
	characEl.className = "fluid Tri_wrapper_caracteristique";
	var titleEl = createEl("div");
	titleEl.className = "fluid Tri_texte";
	titleEl.appendChild(document.createTextNode(title));
	characEl.appendChild(titleEl);
	characEl.appendChild(valueEl);
	boardEl.appendChild(characEl);
	valueEl.className = "fluid Tri_pourc";
}

VraiProCPPStyle.prototype.stylizeByClass = function(field, fieldClass, containerEl)
{
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

	if(fieldClass == "TriangleValeursBoardField")
	{
		// remove next siblings if they already existed.		
		var boardElId = "triangle_board_container";
		var boardEl = this.getElement(containerEl, boardElId);
		if(boardEl != undefined)
			containerEl.removeChild(boardEl);

		this.blueifyLabel(labelEl);

		boardEl = createEl("div");
		boardEl.className = "fluid Tri_wrapper_resultats";
		boardEl.id = boardElId;

		var val1El = field.getBoardValue1El();
		var val2El = field.getBoardValue2El();
		var val3El = field.getBoardValue3El();

		removeFromParent(val1El);
		removeFromParent(val2El);
		removeFromParent(val3El);

		this.addBoardCharac(boardEl, val1El, "Qualité");
		this.addBoardCharac(boardEl, val2El, "Rapidité");
		this.addBoardCharac(boardEl, val3El, "Économie");

		containerEl.insertBefore(boardEl, field.getCanvasContainerEl());
	}
	else if(fieldClass == "RBQField")
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
		var inputEl = field.getInputEl(); // input text
		var labelContainerEl = field.getLabelContainerEl(); // div
		var preLabelEl = field.getPreLabelEl(); // span
		var labelEl = field.getLabelEl(); 

		// div (container)
			// div class='fluid FLOW_dialogue_texte'
			// br
			// br
			// div class="CPP3_wwwvraipro"
				// div class='fluid CPP3_texte_wwwvraipro'
					// www.vraipro.ca/
				// input text class='form CPP3_nom_profil'
			// div class='fluid message_confirmation'

		removeFromParent(labelEl);
		removeFromParent(labelContainerEl);
		removeFromParent(preLabelEl);
		removeFromParent(inputEl);		

		removeAllChilds(containerEl);
		removeAllChilds(labelContainerEl);

		containerEl.appendChild(labelEl);
		labelEl.className = "fluid FLOW_dialogue_texte";

		containerEl.appendChild(createEl("br"));
		containerEl.appendChild(createEl("br"));
		containerEl.appendChild(labelContainerEl);
		labelContainerEl.className = "CPP3_wwwvraipro";

		preLabelEl.className = "fluid CPP3_texte_wwwvraipro";
		labelContainerEl.appendChild(preLabelEl);
		labelContainerEl.appendChild(inputEl);
		inputEl.className = "form CPP3_nom_profil";
		inputEl.size = 17;
		inputEl.maxLength = 30;

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
		return false;

	return true;

}