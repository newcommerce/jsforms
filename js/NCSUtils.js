var PHP_DIR = "/scripts/";
var JS_DIR = "/js/";
var TEMPLATE_DIR = "/templates/";

function getElementIn(containerEl, id)
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

function disableElementTextSelection(element)
{
  var textSelectors = ['-webkit-touch-callout', '-webkit-user-select', '-khtml-user-select','-moz-user-select','-ms-user-select','user-select'];

    var key;
    var selector;
    for(key in textSelectors)
    {
      selector = textSelectors[key];
      element.style[selector] = "none";
    }
}

function array_search(source, key, value)
{
  var total = source.length; 
  for(var i = 0; i < total; i++)
  {
    if(source[i][key] == value)
      return source[i];
  }

  return null;
}

function array_get_idx(source, key, value)
{
  var total = source.length; 
  for(var i = 0; i < total; i++)
  {
    if(source[i][key] == value)
      return i;
  }

  return -1; 
}

function getEl(id)
{
  return document.getElementById(id);
}

function createEl(type)
{
  return document.createElement(type);
}

function createText(str)
{
  return document.createTextNode(str);
}

function removeFromParent(element)
{
  if(element.parentNode != null)
    element.parentNode.removeChild(element);
}

function removeAllChilds(element)
{
  while(element.firstChild != null)
    element.removeChild(element.firstChild);
}

function removeNextSiblings(element)
{
  while(element.parentNode != null && element.nextSibling != null)
    element.parentNode.removeChild(element.nextSibling);
}

function get_class (obj) {
  // http://kevin.vanzonneveld.net
  // +   original by: Ates Goral (http://magnetiq.com)
  // +   improved by: David James
  // +   improved by: David Neilsen
  // *     example 1: get_class(new (function MyClass() {}));
  // *     returns 1: "MyClass"
  // *     example 2: get_class({});
  // *     returns 2: "Object"
  // *     example 3: get_class([]);
  // *     returns 3: false
  // *     example 4: get_class(42);
  // *     returns 4: false
  // *     example 5: get_class(window);
  // *     returns 5: false
  // *     example 6: get_class(function MyFunction() {});
  // *     returns 6: false
  if (obj && typeof obj === 'object' &&
      Object.prototype.toString.call(obj) !== '[object Array]' &&
      obj.constructor && obj !== this.window) {
    var arr = obj.constructor.toString().match(/function\s*(\w+)/);

    if (arr && arr.length === 2) {
      return arr[1];
    }
  }

  return false;
}

function getAjax(windowVar, success, failure, progress)
{
	var ajax = new XMLHttpRequest();
  if(success != undefined)
  {
  	 ajax.addEventListener("load", function(event)
     { 
       var destObj = window[windowVar];
       destObj[success](event);
     });
  }
  if(failure != undefined)
  {
	   ajax.addEventListener("error", function(event) 
     { 
        var destObj = window[windowVar];
        destObj[failure](event);
     });
  }
  if(progress != undefined)
  {
     ajax.upload.addEventListener("progress", function(event)
     { 
        var destObj = window[windowVar];
        destObj[progress](event);        
      });
  }

	return ajax;
}

function ajaxPost(windowVar, success, failure, url, postObj, progress)
{
  url = PHP_DIR + url;
	var ajax = getAjax(windowVar, success, failure, progress);

	var formdata = new FormData();
	var key = "";
  var keys = Object.keys(postObj);
  var i = 0;
  for(i = 0; i < keys.length; i++)
  {
    key = keys[i];
    formdata.append(key, postObj[key]);
  }

	ajax.open("POST", url);
	ajax.send(formdata);

  return ajax;
}

function ajaxGetTemplate(windowVar, success, failure, url)
{
  url = TEMPLATE_DIR + url;
  var ajax = getAjax(windowVar, success, failure);  
  ajax.open("GET", url);  
  ajax.setRequestHeader('Content-type', 'text/html');
  ajax.send();
  return ajax;
}

function ajaxGet(windowVar, success, failure, url, getObj)
{
  url = PHP_DIR + url;
	var ajax = getAjax(windowVar, success, failure);	
	url += "?";
	var key = "";
  var keys = Object.keys(getObj);
  var i = 0;
  for(i = 0; i < keys.length; i++)
  {
    key = keys[i];
		url += key+"="+encUC(getObj[key])+"&";
  }
  url = url.slice(0, -1);

	ajax.open("GET", url);  
	ajax.send();
  return ajax;
}

function ajaxPostJSON(windowVar, success, failure, url, jsonObj)
{
  url = PHP_DIR + url;
	var ajax = getAjax(windowVar, success, failure);	
	ajax.open("POST", url);
	ajax.setRequestHeader('Content-Type', "application/json");
	ajax.send(JSON.stringify(jsonObj));
  return ajax;
}

function intersectCircles(x0, y0, r0, x1, y1, r1, x2, y2, r2)
{
	var EPSILON = 5;
    var a, dx, dy, d, h, rx, ry;
    var point2_x, point2_y;

    /* dx and dy are the vertical and horizontal distances between
    * the circle centers.
    */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));

    /* Check for solvability. */
    if (d > (r0 + r1))
    {
        /* no solution. circles do not intersect. */
        return undefined;
    }
    if (d < Math.abs(r0 - r1))
    {
        /* no solution. one circle is contained in the other */
        return undefined;
    }

    /* 'point 2' is the point where the line through the circle
    * intersection points crosses the line between the circle
    * centers.
    */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

    /* Determine the coordinates of point 2. */
    point2_x = x0 + (dx * a/d);
    point2_y = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
    * intersection points.
    */
    h = Math.sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
    * point 2.
    */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    var intersectionPoint1_x = point2_x + rx;
    var intersectionPoint2_x = point2_x - rx;
    var intersectionPoint1_y = point2_y + ry;
    var intersectionPoint2_y = point2_y - ry;

    /* Lets determine if circle 3 intersects at either of the above intersection points. */
    dx = intersectionPoint1_x - x2;
    dy = intersectionPoint1_y - y2;
    var d1 = Math.sqrt((dy*dy) + (dx*dx));

    dx = intersectionPoint2_x - x2;
    dy = intersectionPoint2_y - y2;
    var d2 = Math.sqrt((dy*dy) + (dx*dx));

    if(Math.abs(d1 - r2) < EPSILON) {
        return {x: intersectionPoint1_x, y: intersectionPoint1_y};
    }
    else if(Math.abs(d2 - r2) < EPSILON) {
        return {x: intersectionPoint2_x, y: intersectionPoint2_y};
    }
    else {
        return undefined;
    }
}

function sequence(name, obj)
{
	if(window['sequence'] == undefined)
		window['sequence'] = new Array();

	if(window['sequence'][name] == undefined)
		window['sequence'][name] = 0;

	var id = ++window['sequence'][name];

	if(obj != undefined)
	{
		var winVar = name + "_" + id;
		window[winVar] = obj;
	}

	return id;
}

function encUC(uc)
{
	return encodeURIComponent(uc);
}

function calcDist(point1, point2)
{
	var d1X = point1.x - point2.x;
	var d1Y = point1.y - point2.y;
	return Math.sqrt(d1X*d1X + d1Y * d1Y);
}

function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3)
{
    o1 = getOrientationResult(x1, y1, x2, y2, px, py);
	o2 = getOrientationResult(x2, y2, x3, y3, px, py);
	o3 = getOrientationResult(x3, y3, x1, y1, px, py);
	return (o1 == o2) && (o2 == o3);
}

function getOrientationResult(x1, y1, x2, y2, px, py)
{
    var orientation = ((x2 - x1) * (py - y1)) - ((px - x1) * (y2 - y1));
    if (orientation > 0)
        return 1;
    else if (orientation < 0)
        return -1;
    else 
        return 0;
}

function getOffsetLeft( elem )
{
    var offsetLeft = 0;
    do {
      if ( !isNaN( elem.offsetLeft ) )
          offsetLeft += elem.offsetLeft;
    } while( elem = elem.offsetParent );
    return offsetLeft;
}

function getOffsetTop( elem )
{
	var offsetTop = 0;
	do {
		if(!isNaN(elem.offsetTop))
			offsetTop += elem.offsetTop;
	} while( elem = elem.offsetParent );
	return offsetTop;
}

function EventDispatcher()
{
  this.events = {};
}

EventDispatcher.prototype.addEventListener = function(name, handler)
{
  if(this.events == undefined)
    this.events = {};
    if (this.events.hasOwnProperty(name))
        this.events[name].push(handler);
    else
        this.events[name] = [handler];
}

EventDispatcher.prototype.removeEventListener = function(name, handler)
{
  if(this.events == undefined)
    this.events = {};

    /* This is a bit tricky, because how would you identify functions?
       This simple solution should work if you pass THE SAME handler. */
    if (!this.events.hasOwnProperty(name))
        return;

    var index = this.events[name].indexOf(handler);
    if (index != -1)
        this.events[name].splice(index, 1);
}

EventDispatcher.prototype.dispatchEvent = function(name, args) 
{
  if(this.events == undefined)
    this.events = {};

    if (!this.events[name] == undefined)
        return;

    if (!args || !args.length)
        args = [];

    if(name in this.events && this.events[name] instanceof Array)
    {
      var evs = this.events[name];
      var len = evs.length;
      for (var i = 0; i < len; i++) {
          evs[i].apply(null, args);
      }
    }
}

EventDispatcher.prototype.generateWindowVar = function(type)
{
  this['type'] = type;
  var innerId = this['inner_id'] = sequence(type);
  this['windowVar'] = type+"_"+innerId;
  window[this.windowVar] = this;  
  return this.windowVar;
}

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('inherits', function (parent) {
  for(key in parent.prototype)
    this.prototype[key] = parent.prototype[key];
});

Function.prototype.swiss = function(parent, properties)
{
  for(key in properties)
  {
    var property = properties[key];
    if(property in parent.prototype)
      this.prototype[property] = parent.prototype[property];
  }

}

function isElement(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrom)
    return obj instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have. (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }
}

function removeAppendStyle(element, style)
{
  if(style == "")
    return;

  var className = element.className;
  if(className.indexOf(" "+style) > -1)
    className = className.replace(" " + style, "");

  element.className = className;
}

function addAppendStyle(element, style)
{
  if(style == "")
    return;

  var className = element.className;
  if(className.indexOf(" "+style) == -1)
    className += " "+style;

  element.className = className;
}