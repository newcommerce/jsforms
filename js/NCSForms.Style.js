// ----------------------------------------
// NCSFieldStyle
// ----------------------------------------

function NCSFieldStyle(brCount)
{
	this['brCount'] = brCount || 3;
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

NCSFieldStyle.prototype.stylize = function(field, fieldIndex)
{
	var containerEl = field.edit();

	var fieldClass = get_class(field);

	// or depending on type.
	// TODO: read the field style

	var containerId = containerEl.id;
	var labelId = field.getLabelId();
	var commentId = field.getCommentId();
	var inputId = field.getInputId();

	var labelEl = getElementIn(containerEl, labelId);
	var commentEl = getElementIn(containerEl, commentId);
	var inputEl = getElementIn(containerEl, inputId);

	var labelText = labelEl.textContent;
	var brEl;
	var parentEl;

	if(this.stylizeByClass(field, fieldClass, containerEl, fieldIndex))
	{
		// if first element, add a few br's?
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

VraiProStyle.prototype.stylizeTriangleValeursBoard = function(containerEl, field)
{
	var containerId = containerEl.id;
	var labelId = field.getLabelId();
	var commentId = field.getCommentId();
	var inputId = field.getInputId();

	var labelEl = getElementIn(containerEl, labelId);
	var commentEl = getElementIn(containerEl, commentId);
	var inputEl = getElementIn(containerEl, inputId);

	var labelText = labelEl.textContent;
	var brEl;
	var parentEl;

	
	// remove next siblings if they already existed.		
	var boardElId = "triangle_board_container";
	var boardEl = getElementIn(containerEl, boardElId);
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

	this.addBoardCharac(boardEl, val1El, "Qualité", "fluid Tri_wrapper_caracteristique_qualite");
	this.addBoardCharac(boardEl, val2El, "Rapidité", "fluid Tri_wrapper_caracteristique_rapidite");
	this.addBoardCharac(boardEl, val3El, "Économie", "fluid Tri_wrapper_caracteristique_economie");

	containerEl.insertBefore(boardEl, field.getCanvasContainerEl());
	containerEl.insertBefore(createEl("br"), boardEl);
	containerEl.insertBefore(createEl("br"), boardEl);
	containerEl.insertBefore(createEl("br"), field.getCanvasContainerEl());
	containerEl.insertBefore(createEl("br"), field.getCanvasContainerEl());
}

VraiProStyle.prototype.addBoardCharac = function(boardEl, valueEl, title, boardClass)
{
	var characEl = createEl("div");
	characEl.className = boardClass;
	var titleEl = createEl("div");
	titleEl.className = "fluid Tri_texte";
	titleEl.appendChild(document.createTextNode(title));
	characEl.appendChild(titleEl);
	characEl.appendChild(valueEl);
	boardEl.appendChild(characEl);
	valueEl.className = "fluid Tri_pourc";
}


// ----------------------------------------
// VraiProAPCStyle
// ----------------------------------------

function VraiProAPCStyle(brCount)
{
	this['brCount'] = brCount || 3;
}

VraiProAPCStyle.inherits(VraiProStyle);

VraiProAPCStyle.prototype.stylizeByClass = function(field, fieldClass, containerEl, fieldIndex)
{
	var containerId = containerEl.id;
	var labelId = field.getLabelId();
	var commentId = field.getCommentId();
	var inputId = field.getInputId();

	var labelEl = getElementIn(containerEl, labelId);
	var commentEl = getElementIn(containerEl, commentId);
	var inputEl = getElementIn(containerEl, inputId);

	var labelText = labelEl.textContent;
	var brEl;
	var parentEl;

	if(fieldClass == "SingleSelectIconField")
	{
		var optionsContEl = field.getOptionsContainerEl();
		field.setOptionStylizer(this);	
		containerEl.className = "fluid APC_wrapper_alignement";	
	}
	else if(fieldClass == "NCSTabbedMultiSelection")
	{
		this.blueifyLabel(labelEl);
	}
	else if(fieldClass == "NameField")
	{
		if(field.field == "title")
		{
			inputEl.placeholder = "Titre";
			inputEl.className = "form APP3_titre";
			inputEl.maxLength = 40;
		}		

		this.redifyComment(commentEl);
			
	}
	else if(fieldClass == "TextAreaField")
	{
		this.redifyComment(commentEl);
		inputEl.className = "description_projet";
		inputEl.maxLength = 300;
		inputEl.placeholder = "description: matériaux, dimensions, etc";
	}
	else if(fieldClass == "MultiFileUploadField" || fieldClass == "TypedMultiFileUploadField")
	{
		var editContainerEl = field.getEditContainerEl();
		var fileInputEl = field.getFileInputEl();
		var buttonInputEl = field.getButtonInputEl();
		var progressEl = field.getProgressEl();
		progressEl.className = "mini_barre_progres";
		var resultsContainerEl = field.getResultsContainerEl();

		removeAllChilds(containerEl);

		containerEl.appendChild(resultsContainerEl);
		containerEl.appendChild(commentEl);
		var actionEl = createEl("div");
		actionEl.className = "fluid APC_barre_grise";
		containerEl.appendChild(actionEl);
		actionEl.appendChild(editContainerEl);	
		resultsContainerEl.className = "fluid APC6_espace_photos_ajoutees";

	}
	else if(fieldClass == "TriangleValeursBoardField")
	{
		this.stylizeTriangleValeursBoard(containerEl, field);
	}
	else if(fieldClass == "DateField")
	{
		removeAllChilds(containerEl);
		var labelText = labelEl.textContent;
		labelEl = createEl("div");
		labelEl.appendChild(createText(labelText));
		labelEl.className = "fluid FLOW_dialogue_texte";

		if(field.field == "start_date")
		{
			containerEl.appendChild(createEl("br"));
			containerEl.appendChild(createEl("br"));
		}

		containerEl.appendChild(labelEl);

		if(field.field == "start_date")
		{
			containerEl.appendChild(createEl("br"));
			containerEl.appendChild(createEl("br"));
		}

		containerEl.appendChild(inputEl);
		inputEl.className = 'form';
		inputEl.size = 24;
		if(field.field == "start_date")
			inputEl.placeholder = "peut commencer...";
		else if(field.field == "end_date")
			inputEl.placeholder = "doit être terminé avant...";

		containerEl.appendChild(commentEl);
		this.redifyComment(commentEl);
		var jsEl = createEl("script");
		jsEl.type = "text/javascript";
		jsEl.appendChild(createText("$(function() {	$( \"#"+field.getInputId()+"\" ).datepicker({ dateFormat: \"yy-mm-dd\", onSelect: function(event) { window['"+field.windowVar+"'].keyUp(event); }}); });"));
		containerEl.appendChild(jsEl);
	}
	else if(fieldClass == "SingleSelectRadioField")
	{
		removeAllChilds(containerEl);
		inputEl = field.getInputEl();
		inputEl.className = "APC9_budget";

		var childEl = inputEl.firstChild;

		do
		{
			if(childEl.localName == "label")
				childEl.class = "APC9_texte_budget";

			childEl = childEl.nextSibling;

		} while(childEl != null);

		var labelText = labelEl.textContent;
		labelEl = createEl("div");
		labelEl.appendChild(createText(labelText));
		labelEl.className = "fluid FLOW_dialogue_texte";
		containerEl.appendChild(labelEl);
		containerEl.appendChild(inputEl);
		containerEl.appendChild(commentEl);
		containerEl.className = "fluid APC_dialogue";

	}
	else
		return false;

	return true;
}

VraiProAPCStyle.prototype.stylizeOption = function(field, optionEl)
{
	var fieldClass = get_class(field);
	if(fieldClass == "SingleSelectIconField")
		this.setOptionStyles(optionEl, "bouton APC_wrapper_grand_icone1", "fluid APC_iconholder_grand", "fluid APC_texte_grand_icone");
	else if(fieldClass == "MultiSelectIconField")
		this.setOptionStyles(optionEl, "fluid APC_wrapper_petit_icone", "fluid APC_iconholder_petit", "fluid APC_texte_petit_icone");
	else if(fieldClass == "SingleSelectRadioField")
		optionEl.className = "APC9_texte_budget";
	
	return optionEl;
}

VraiProAPCStyle.prototype.setOptionStyles = function(optionEl, style1, style2, style3)
{
	optionEl.className = style1;

	if(optionEl.firstChild != null)
	{
		optionEl.firstChild.className = style2;
		if(optionEl.firstChild.nextSibling != null )
			optionEl.firstChild.nextSibling.className = style3;
	}
}


// ----------------------------------------
// VraiProCPPStyle
// ----------------------------------------

function VraiProCPPStyle(brCount)
{
	this['brCount'] = brCount || 3;
}

VraiProCPPStyle.inherits(VraiProStyle);

VraiProCPPStyle.prototype.stylizeByClass = function(field, fieldClass, containerEl, fieldIndex)
{
	var containerId = containerEl.id;
	var labelId = field.getLabelId();
	var commentId = field.getCommentId();
	var inputId = field.getInputId();

	var labelEl = getElementIn(containerEl, labelId);
	var commentEl = getElementIn(containerEl, commentId);
	var inputEl = getElementIn(containerEl, inputId);

	var labelText = labelEl.textContent;
	var brEl;
	var parentEl;

	if(fieldClass == "TriangleValeursBoardField")
	{
		this.stylizeTriangleValeursBoard(containerEl, field);
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

		var moreContainerEl = getElementIn(containerEl, moreContainerId);
		var moreLabelEl = getElementIn(containerEl, moreLabelId);
		var moreButtonEl = getElementIn(containerEl, moreButtonId);
		var moreInputEl = getElementIn(containerEl, moreInputId);

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


// ----------------------------------------
// VraiProAPPStyle
// ----------------------------------------

function VraiProAPPStyle(brCount)
{
	this['brCount'] = brCount || 3;
}

VraiProAPPStyle.inherits(VraiProStyle);


function VraiProAPPStyle(brCount)
{
	this['brCount'] = brCount || 1;
}

VraiProAPPStyle.inherits(VraiProStyle);

VraiProAPPStyle.prototype.stylizeByClass = function(field, fieldClass, containerEl, fieldIndex)
{
	var containerId = containerEl.id;
	var labelId = field.getLabelId();
	var commentId = field.getCommentId();
	var inputId = field.getInputId();

	var labelEl = getElementIn(containerEl, labelId);
	var commentEl = getElementIn(containerEl, commentId);
	var inputEl = getElementIn(containerEl, inputId);

	var labelText = labelEl.textContent;
	var brEl;
	var parentEl;

	if(fieldClass == "SingleSelectRadioField")
	{
		containerEl.className = "APP3_SECTEUR";		
		var optionsContEl = field.getOptionsContainerEl();
		field.setOptionStylizer(this);	
		containerEl.className = "fluid APC_wrapper_alignement";	
		// remove BR between options

	}
	else if(fieldClass == "NCSTabbedMultiSelection")
	{
		this.blueifyLabel(labelEl);
	}	
	else if(fieldClass == "SingleSelectionField")
	{	
		inputEl.className = "form APP3_nature_dintervention";
	}
	else if(fieldClass == "NameField")
	{
		inputEl.className = "APP3_titre";
		inputEl.size = 35;
		inputEl.maxLength = 40;
		inputEl.placeholder = "Titre de votre projet (optionnel)";
		containerEl.removeChild(labelEl);
	}
	else if(fieldClass == "TextAreaField")
	{
		inputEl.className = "description_projet";
		inputEl.maxLength = 300;
		inputEl.placeholder = "détails; matériaux, précisions, etc";
		containerEl.removeChild(labelEl);
	}
	else
		return false;

	return true;
}

VraiProAPPStyle.prototype.stylizeOption = function(field, optionEl)
{
	var fieldClass = get_class(field);
	if(fieldClass == "SingleSelectRadioField")
	{
	/*	if(field.nextSibling.typeName.toLowerCase() == "br")
			field.parentNode.removeChild(field.nextSibling);
		field.className = "APP3_secteurs_residentiel_commercial_0";*/
	}

	return optionEl;
}

VraiProAPPStyle.prototype.setOptionStyles = function(optionEl, style1, style2, style3)
{
	optionEl.className = style1;

	if(optionEl.firstChild != null)
	{
		optionEl.firstChild.className = style2;
		if(optionEl.firstChild.nextSibling != null )
			optionEl.firstChild.nextSibling.className = style3;
	}
}