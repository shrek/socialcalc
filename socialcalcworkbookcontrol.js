//
// Workbook Control controls workbook actions (add/del/rename etc) and can appear at the
// bottom of the screen (?). Right now its just a proof of concept 
// and appears at the top of the screen
//
// Author: Ramu Ramamurthy
//
//

var SocialCalc;
if (!SocialCalc) {
	alert("Main SocialCalc code module needed");
    SocialCalc = {};
}

SocialCalc.CurrentWorkbookControlObject = null; 

// Constructor:

SocialCalc.WorkBookControl = function(book, divid, defaultsheetname) {

	this.workbook = book;
	this.div = divid;
	this.defaultsheetname = defaultsheetname;
	this.sheetButtonArr = {};
    this.sheetCnt = 0;
    this.numSheets = 0;
    this.currentSheetButton = null;
	this.sheetshtml = '<div id="fooBar" style="padding:6px;background-color:#80A9F3;"></div>';

	this.buttonshtml = 
'<form>'+
'<div id="workbookControls" style="padding:6px;background-color:#80A9F3;">'+
'<input type="button" value="add sheet" onclick="SocialCalc.WorkBookControlAddSheet(true)" class="smaller">'+
'<input type="button" value="del sheet" onclick="SocialCalc.WorkBookControlDelSheet()" class="smaller">'+
'<input type="button" value="save workbook" onclick="SocialCalc.WorkBookControlSaveSheet()" class="smaller">'+
'</div>'+
'</form>';

	SocialCalc.CurrentWorkbookControlObject = this;
	
}

// methods
SocialCalc.WorkBookControl.prototype.GetCurrentWorkBookControl = function() {return SocialCalc.GetCurrentWorkBookControl();};
SocialCalc.WorkBookControl.prototype.InitializeWorkBookControl = function() {return SocialCalc.InitializeWorkBookControl(this);};

SocialCalc.GetCurrentWorkBookControl = function() {
	return SocialCalc.CurrentWorkbookControlObject;
}

SocialCalc.InitializeWorkBookControl = function(control) {
	var element = document.createElement("div");
	element.innerHTML = control.sheetshtml;
	var foo = document.getElementById(control.div);
	foo.appendChild(element);
	var element2 = document.createElement("div");
	element2.innerHTML = control.buttonshtml;
	foo.appendChild(element2);
	SocialCalc.WorkBookControlAddSheet(false); // this is for the default sheet
}

SocialCalc.WorkBookControlDelSheet = function() {
	
	var control = SocialCalc.GetCurrentWorkBookControl();
	
	if (control.numSheets == 1) {
		// disallow
		alert("cant delete only sheet!");
		return;
	}
	if (control.currentSheetButton != null) {
		var foo = document.getElementById("fooBar");
		var current = document.getElementById(control.currentSheetButton.id);
		
		var name = current.id;
		delete control.sheetButtonArr[name];
		
		foo.removeChild(current);
		control.currentSheetButton = null;
		// delete the sheets
		control.workbook.DeleteWorkBookSheet(name);
		control.numSheets = control.numSheets-1;
	}
	
	// reset current sheet
	for (var sheet in control.sheetButtonArr) {
		if (sheet != null) {
			control.currentSheetButton = control.sheetButtonArr[sheet];
			control.currentSheetButton.setAttribute("style","background-color:lightgreen");
			break;
		}
	}
	if (control.currentSheetButton != null) {
		control.workbook.ActivateWorkBookSheet(control.currentSheetButton.id, null);
	}
}

SocialCalc.WorkBookControlAddSheet = function(addworksheet){

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	//Create an input type dynamically.
	var element = document.createElement("input");


	var name = "sheet"+ (control.sheetCnt+1).toString();

	//Assign different attributes to the element.
	element.setAttribute("type", "button");
	element.setAttribute("value", name);
	element.setAttribute("id", name);
    element.setAttribute("name", (control.sheetCnt+1).toString());
	
	var fnname = "SocialCalc.WorkBookControlActivateSheet("+"'"+name+"'"+")";
	
	element.setAttribute("onclick",fnname);
	
	control.sheetButtonArr[name] = element;
	control.sheetCnt = control.sheetCnt + 1;
	
	var old="sheet1";
	if (control.currentSheetButton != null) {
		control.currentSheetButton.setAttribute("style", "");
		old = control.currentSheetButton.id;
	}
	
	element.setAttribute("style","background-color:lightgreen");
	control.currentSheetButton = element;
	
	var foo = document.getElementById("fooBar");

	//Append the element in page (in span).
	foo.appendChild(element);

	// create the sheet

	if (addworksheet) {
		control.workbook.AddNewWorkBookSheet(name, old);
	}	
	
	control.numSheets = control.numSheets + 1;
	
}
	
SocialCalc.WorkBookControlActivateSheet = function(name) {

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	var foo = document.getElementById(name);
	foo.setAttribute("style","background-color:lightgreen");

    var old = control.currentSheetButton.id;
	if (control.currentSheetButton.id != foo.id) {
		control.currentSheetButton.setAttribute("style", "");
	}
	
	control.currentSheetButton = foo;

	control.workbook.ActivateWorkBookSheet(name, old);
	
}

SocialCalc.WorkBookControlSaveSheet = function(){

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	control.workbook.CreateSaveWorkBook();
	
}