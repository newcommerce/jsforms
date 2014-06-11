// ----------------------------------------
// TriangeValeursField
// ----------------------------------------

function TriangleValeursField(modelField1, modelField2, modelField3, label, width, circleRadius, circle1Color, circle2Color, circle3Color, triangleColor, valueColor)
{
	this['width'] = width = width || 150;
	this['height'] = Math.round(Math.sqrt(width*width - (width/2)*(width/2)));
	this['circleRadius'] = circleRadius = circleRadius || 10;
	this.circle1Color = circle1Color = circle1Color || "#0000ff"; // blue
	this.circle2Color = circle2Color = circle2Color || "#ff9900"; // orange
	this.circle3Color = circle3Color = circle3Color || "#36b812"; // green
	
	this['triangleColor'] = triangleColor = triangleColor || "#333333";
	this['valueColor'] = valueColor = valueColor || "#ffffff";
	this['activeTouches'] = [];

	this.construct('trianglevaleursfield', modelField1, label, 10, 10);	

	this.modelField1 = modelField1;
	this.modelField2 = modelField2;
	this.modelField3 = modelField3;

	this['mouseDown'] = false;
	this['triangleX'] = width/2;
	this['triangleY'] = height/2;

	this.drawRectangle();
	this.drawCircles();
}

TriangleValeursField.inherits(NCSFormField);

TriangleValeursField.prototype.getInputEl = function()
{
	var maxDist = this.getMaxDist();

	var axis1 = (1-(parseInt(this.getModelValue(this.modelField1)) / 100)) * maxDist;
	var axis2 = (1-(parseInt(this.getModelValue(this.modelField2)) / 100)) * maxDist;
	var axis3 = (1-(parseInt(this.getModelValue(this.modelField3)) / 100)) * maxDist;

	var point1 = this.getPoint1Center();
	var point2 = this.getPoint2Center();
	var point3 = this.getPoint3Center();

	var intersect = intersectCircles(point1.x, point1.y, axis1, point2.x, point2.y, axis2, point3.x, point3.y, axis3);
	if(intersect != undefined && ("x" in intersect) && ("y" in intersect))
	{
		this.mouseX = intersect.x;
		this.mouseY = intersect.y;
	}
	else
	{
		this.mouseX = this.width/2;
		this.mouseY = this.height/2;	
	}

	this.validate();
	this.drawClickTarget();
	this.drawValues();

	return this.canvasContainer;
}

TriangleValeursField.prototype.getInputId = function()
{
	return this.getContainerId()+"_canvas_container";
}

TriangleValeursField.prototype.getTriangleCanvasId = function()
{
	return this.getContainerId()+"_canvas_triangle";
}

TriangleValeursField.prototype.getBarsCanvasId = function()
{
	return this.getContainerId()+"_canvas_bars";
}

TriangleValeursField.prototype.createInputField = function()
{ 
	var containerId = this.getContainerId();
	width = this.width;
	height = this.height;

	var canvasTriangle = this['canvasTriangle'] = createEl("canvas");
	var canvasBars = this['canvasBars'] = createEl("canvas");
	var canvasContainer = this['canvasContainer'] = createEl("div");

	canvasTriangle.id = this.getTriangleCanvasId();
	canvasTriangle.width = width;
	canvasTriangle.height = height;

	canvasBars.id = this.getBarsCanvasId();
	canvasBars.width = width;
	canvasBars.height = height;

	canvasContainer.id = this.getInputId();
	canvasContainer.appendChild(canvasTriangle);
	canvasContainer.appendChild(canvasBars);

	var windowVar = this.windowVar;

	// MOUSE EVENTS
	canvasTriangle.addEventListener("mousedown", function(event) { window[windowVar].canvasMouseDown(event); }, false);
	canvasTriangle.addEventListener("mousemove", function(event) { window[windowVar].canvasMouseDown(event); }, false);
	canvasTriangle.addEventListener("mouseup", function(event) { window[windowVar].canvasMouseDown(event); }, false);

	// TOUCH EVENTS
	canvasTriangle.addEventListener("touchstart", function(event) { window[windowVar].canvasTouchStart(event); }, false);
	canvasTriangle.addEventListener("touchend", function(event) { window[windowVar].canvasTouchEnd(event); }, false);
	canvasTriangle.addEventListener("touchcancel", function(event) { window[windowVar].canvasTouchCancel(event); }, false);
	canvasTriangle.addEventListener("touchleave", function(event) { window[windowVar].canvasTouchEnd(event); }, false);
	canvasTriangle.addEventListener("touchmove", function(event) { window[windowVar].canvasTouchMove(event); }, false);

}

function copyTouch(touch)
{
	return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function getTouchX(touch, element)
{
	return touch.pageX - getOffsetLeft(element);	
}

function getTouchY(touch, element)
{
	return touch.pageY - getOffsetTop(element);
}

TriangleValeursField.prototype.getTouchIdx = function(touchId)
{
	for(var i = 0; i < this.activeTouches.length; i++)
	{
		if(this.activeTouches[i].identifier == touchId)
			return i;
	}

	return -1;
}

TriangleValeursField.prototype.canvasTouchStart = function(event)
{
	event.preventDefault();
	var touch;
	var canvas = this.canvasTriangle;

	this.mouseDown = true;

	var touches = event.changedTouches;
	for(var i = 0; i < touches.length; i++)
	{
		touch = touches[i];
		this.activeTouches.push(copyTouch(touch));
		touchIdx = this.getTouchIdx(touch.identifier);
		if(touchIdx == 0)
		{
			var ptx = getTouchX(touch, canvas);
			var pty = getTouchY(touch, canvas);

			this.updatePoint(ptx, pty);
		}
	}
}

TriangleValeursField.prototype.canvasTouchEnd = function(event)
{
	event.preventDefault();
	var touch;
	var canvas = this.canvasTriangle;

	var touches = event.changedTouches;
	var touchIdx;
	for(var i = 0; i < touches.length; i++)
	{
		touch = touches[i];
		touchIdx = this.getTouchIdx(touch.identifier);
		this.activeTouches.splice(touchIdx, 1);
		if(touchIdx == 0)
		{
			var ptx = getTouchX(touch, canvas);
			var pty = getTouchY(touch, canvas);
			this.updatePoint(ptx, pty);
		}
	}

	this.mouseDown = this.activeTouches.length != 0;	
}

TriangleValeursField.prototype.canvasTouchCancel = function(event)
{
	event.preventDefault();
	var touches = event.changedTouches;
	for(var i = 0; i < touches.length; i++)
	{
		touchIdx = this.getTouchIdx(touch.identifier);
		this.activeTouches.splice(touchIdx, 1);
	}

	this.mouseDown = this.activeTouches.length != 0;	
}

TriangleValeursField.prototype.canvasTouchMove = function(event)
{
	event.preventDefault();
	var touch;
	var canvas = this.canvasTriangle;
	var touches = event.changedTouches;
	var touchIdx;
	for(var i = 0; i < touches.length; i++)
	{
		touch = touches[i];
		touchIdx = this.getTouchIdx(touch.identifier);
		this.activeTouches.splice(touchIdx, 1, copyTouch(touch));
		if(touchIdx == 0)
		{
			var ptx = getTouchX(touch, canvas);
			var pty = getTouchY(touch, canvas);
			this.updatePoint(ptx, pty);
		}
	}
}

TriangleValeursField.prototype.updatePoint = function(ptx, pty)
{
	var point1 = this.getPoint1Center();
	var point2 = this.getPoint2Center();
	var point3 = this.getPoint3Center();

	if(pointInTriangle(ptx, pty, point1.x, point1.y, point2.x, point2.y, point3.x, point3.y))
	{
		this.mouseX = ptx;
		this.mouseY = pty;
		this.clearCanvas(this.canvasTriangle);
		this.drawRectangle();
		this.drawCircles();
		this.drawClickTarget();

		this.edited = true;
		// validate calculates values
		this.validate();

		// validate needs to be called first before drawing values
		this.clearCanvas(this.canvasBars);
		this.drawValues();
	}
}


TriangleValeursField.prototype.canvasMouseDown = function(event)
{ 
	if(event.type == "mousedown")
	{
		this.mouseDown = true;
		event.preventDefault();
	}

	if(!this.mouseDown)
		return;

	//alert("mouse down");
	var canvas = event.srcElement || event.target;	
	var mouseX = getTouchX(event, canvas);
	var mouseY = getTouchY(event, canvas);
	this.updatePoint(mouseX, mouseY);	

	if(event.type == 'mouseup')
		this.mouseDown = false;
}

TriangleValeursField.prototype.validate = function()
{
	this.valid = true;
	this.valueAccepted();
}

TriangleValeursField.prototype.getMaxDist = function()
{
	return this.width - this.circleRadius*2;
}

TriangleValeursField.prototype.valueAccepted = function()
{
	var maxDist = this.getMaxDist();
	var mouseCenter = {x:this.mouseX, y:this.mouseY};

	var d1 = calcDist(this.getPoint1Center(), mouseCenter);
	var d2 = calcDist(this.getPoint2Center(), mouseCenter);
	var d3 = calcDist(this.getPoint3Center(), mouseCenter);

	var value1 = Math.ceil((1 - d1 / maxDist) * 100);
	var value2 = Math.ceil((1 - d2 / maxDist) * 100);
	var value3 = Math.ceil((1 - d3 / maxDist) * 100);

	this.setModelValue(this.modelField1, value1);
	this.setModelValue(this.modelField2, value2);
	this.setModelValue(this.modelField3, value3);

	if("step" in this && this.step != undefined)
		this.step.fieldValid(this);
}

TriangleValeursField.prototype.getPoint1Center = function()
{
	return { x : this.circleRadius,
	         y : this.height-this.circleRadius};
}

TriangleValeursField.prototype.getPoint2Center = function()
{
	return { x : this.width - this.circleRadius, 
		     y : this.height - this.circleRadius};
}

TriangleValeursField.prototype.getPoint3Center = function()
{
	return { x : this.width/2,
	         y : this.circleRadius };
}

TriangleValeursField.prototype.clearCanvas = function(canvas)
{
	if(canvas.getContext)
		canvas.getContext("2d").clearRect(0,0,this.width,this.height);
}

TriangleValeursField.prototype.drawClickTarget = function()
{
	var canvas = this.canvasTriangle;
	var mouseX = this.mouseX;
	var mouseY = this.mouseY;

	if(canvas.getContext)
	{
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = this.valueColor;	
		ctx.beginPath();
		ctx.arc(mouseX, mouseY, this.circleRadius, 0, 2*Math.PI);
		ctx.fill();
	}		
}

TriangleValeursField.prototype.drawRectangle = function()
{
	var canvas = this['canvasTriangle'];	
	var point1Center = this.getPoint1Center();
	var point2Center = this.getPoint2Center();
	var point3Center = this.getPoint3Center();

	if(canvas.getContext) 
	{ 
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = this.triangleColor;
		ctx.beginPath();
		ctx.moveTo(point1Center.x, point1Center.y);
		ctx.lineTo(point2Center.x, point2Center.y);
		ctx.lineTo(point3Center.x, point3Center.y);
		ctx.fill();			
	}
}

TriangleValeursField.prototype.drawCircles = function()
{
	var canvas = this['canvasTriangle'];	
	var point1Center = this.getPoint1Center();
	var point2Center = this.getPoint2Center();
	var point3Center = this.getPoint3Center();

	if(canvas.getContext)
	{
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = this.circle1Color;
		ctx.beginPath();
		ctx.arc(point1Center.x, point1Center.y,this.circleRadius, 0, 2*Math.PI);
		ctx.fill();

		ctx.fillStyle = this.circle2Color;
		ctx.beginPath();
		ctx.arc(point2Center.x, point2Center.y, this.circleRadius, 0, 2*Math.PI);
		ctx.fill();

		ctx.fillStyle = this.circle3Color;
		ctx.beginPath();
		ctx.arc(point3Center.x, point3Center.y, this.circleRadius, 0, 2*Math.PI);
		ctx.fill();
	}
}

TriangleValeursField.prototype.drawValues = function()
{
	var value1 = this.getModelValue(this.modelField1);
	var value2 = this.getModelValue(this.modelField2);
	var value3 = this.getModelValue(this.modelField3);

	var padding = this.circleRadius*1.7;
	var barWidth = (this.width - 4 * padding)/3;

	var bar1X = padding;
	var bar2X = padding*2 + barWidth;
	var bar3X = padding*3 + barWidth*2;

	var bar1Height = value1/100 * height;
	var bar2Height = value2/100 * height;
	var bar3Height = value3/100 * height;

	var bar1Y = this.height - bar1Height;
	var bar2Y = this.height - bar2Height;
	var bar3Y = this.height - bar3Height;

	var canvas = this.canvasBars;
	if(canvas.getContext)
	{
		var ctx = canvas.getContext("2d");		

		ctx.beginPath();
		ctx.rect(bar1X, bar1Y, barWidth, bar1Height);
		ctx.fillStyle = this.circle1Color;
		ctx.fill();

		ctx.beginPath();
		ctx.rect(bar2X, bar2Y, barWidth, bar2Height);
		ctx.fillStyle = this.circle2Color;
		ctx.fill();

		ctx.beginPath();
		ctx.rect(bar3X, bar3Y, barWidth, bar3Height);
		ctx.fillStyle = this.circle3Color;
		ctx.fill();
	}
}
