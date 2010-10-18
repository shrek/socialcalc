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

SocialCalc.TestWorkBookSaveStr = ""

// Constructor:

SocialCalc.WorkBookControl = function(book, divid, defaultsheetname) {

	this.workbook = book;
	this.div = divid;
	this.defaultsheetname = defaultsheetname;
	this.sheetButtonArr = {};
    this.sheetCnt = 0;
    this.numSheets = 0;
    this.currentSheetButton = null;
	this.renameDialogId = "sheetRenameDialog";
	
	this.sheetshtml = '<div id="fooBar" style="padding:6px;background-color:#80A9F3;"></div>';

	this.buttonshtml = 
'<form>'+
'<div id="workbookControls" style="padding:6px;background-color:#80A9F3;">'+
'<input type="button" value="add sheet" onclick="SocialCalc.WorkBookControlAddSheet(true)" class="smaller">'+
'<input type="button" value="delete sheet" onclick="SocialCalc.WorkBookControlDelSheet()" class="smaller">'+
'<input type="button" value="rename sheet" onclick="SocialCalc.WorkBookControlRenameSheet()" class="smaller">'+
'<input type="button" value="save workbook" onclick="SocialCalc.WorkBookControlSaveSheet()" class="smaller">'+
'<input type="button" value="new workbook" onclick="SocialCalc.WorkBookControlNewBook()" class="smaller">'+
'<input type="button" value="load workbook" onclick="SocialCalc.WorkBookControlLoad()" class="smaller">'+
'<input type="button" value="copy sheet" onclick="SocialCalc.WorkBookControlCopySheet()" class="smaller">'+
'<input type="button" value="paste sheet" onclick="SocialCalc.WorkBookControlPasteSheet()" class="smaller">'+
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
		var curname = control.currentSheetButton.value;
		delete control.sheetButtonArr[name];
		
		foo.removeChild(current);
		control.currentSheetButton = null;
		// delete the sheets
		control.workbook.DeleteWorkBookSheet(name, curname);
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

SocialCalc.WorkBookControlAddSheetButton = function(sheetname, sheetid) {
	
	var control = SocialCalc.GetCurrentWorkBookControl();
	
	//Create an input type dynamically.
	var element = document.createElement("input");

	var name = null;

	if (sheetid != null) {
		name = sheetid
	} else {
		name = "sheet"+ (control.sheetCnt+1).toString();
		control.sheetCnt = control.sheetCnt + 1;	
	}

	//Assign different attributes to the element.
	element.setAttribute("type", "button");
	if (sheetname == null) {
		element.setAttribute("value", name);
	} else {
		element.setAttribute("value", sheetname);
	}
	element.setAttribute("id", name);
    element.setAttribute("name", name);
	
	var fnname = "SocialCalc.WorkBookControlActivateSheet("+"'"+name+"'"+")";
	
	element.setAttribute("onclick",fnname);
	
	control.sheetButtonArr[name] = element;
	
	
	var foo = document.getElementById("fooBar");

	//Append the element in page (in span).
	foo.appendChild(element);

	control.numSheets = control.numSheets + 1;
	
	return element;
}

SocialCalc.WorkBookControlAddSheet = function(addworksheet, sheetname){

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	// first add the button
	var element = SocialCalc.WorkBookControlAddSheetButton(sheetname);
	
	// then change the highlight
	
	var old="sheet1";
	if (control.currentSheetButton != null) {
		control.currentSheetButton.setAttribute("style", "");
		old = control.currentSheetButton.id;
	}
	
	element.setAttribute("style","background-color:lightgreen");
	control.currentSheetButton = element;
	var newsheetid = element.id;

	
	// create the sheet
	if (addworksheet) {
		control.workbook.AddNewWorkBookSheet(newsheetid, old, false);
	}
	
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
	
	var sheetsave = {};

	sheetsave.numsheets = control.numSheets;
	sheetsave.currentid = control.currentSheetButton.id;
	sheetsave.currentname = control.currentSheetButton.value;

	sheetsave.sheetArr = {}
	for (var sheet in control.sheetButtonArr) {
		var sheetstr = control.workbook.SaveWorkBookSheet(sheet);
		sheetsave.sheetArr[sheet] = {}
		sheetsave.sheetArr[sheet].sheetstr = sheetstr;
		sheetsave.sheetArr[sheet].name = control.sheetButtonArr[sheet].value;
	}
	
	SocialCalc.TestWorkBookSaveStr = JSON.stringify(sheetsave);
	alert(SocialCalc.TestWorkBookSaveStr);
}

SocialCalc.WorkBookControlLoad = function(){


	var sheetsave = JSON.parse(SocialCalc.TestWorkBookSaveStr);
	//alert(sheetsave.currentid+","+sheetsave.currentname)
	
	// first create a new workbook
	var control = SocialCalc.GetCurrentWorkBookControl();
	
	SocialCalc.WorkBookControlCreateNewBook();
	
	// at this point there is one sheet, and 1 button
	// create the sequence of buttons, and sheets
	
	var newbuttons = 0
	var sheetid = null;
	var currentsheetid = sheetsave.currentid;
	for (var sheet in sheetsave.sheetArr) {
		if (newbuttons > sheetsave.numsheets) {
			break;
		}
		//alert("button="+newbuttons)
		if (newbuttons == 0) {
			// set the first button's name correctly
			sheetid = control.currentSheetButton.id;
			control.currentSheetButton.value = sheetsave.sheetArr[sheet].name;
			// set the sheet data for the first sheet which already exists
			control.workbook.LoadRenameWorkBookSheet(sheetid, sheetsave.sheetArr[sheet].sheetstr.savestr, control.currentSheetButton.value)
			// need to also set the formula cache
			newbuttons = newbuttons + 1
			continue;
		}
		sheetid = "sheet"+(control.sheetCnt+1).toString()
		control.sheetCnt = control.sheetCnt+1
		SocialCalc.WorkBookControlAddSheetButton(sheetsave.sheetArr[sheet].name, sheetid)
		// create the sheet
		control.workbook.AddNewWorkBookSheetNoSwitch(sheetid, sheetsave.sheetArr[sheet].name, sheetsave.sheetArr[sheet].sheetstr.savestr)
	
		newbuttons = newbuttons + 1
		
		if (sheet == sheetsave.currentid) {
			currentsheetid = sheet
		}
		
	}
	control.workbook.spreadsheet.DoOnResize()
	// activate the current sheet
	SocialCalc.WorkBookControlActivateSheet(currentsheetid);
}


SocialCalc.WorkBookControlRenameSheet = function(){

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	// do a popup to get the new name of the sheet
	// the popup has an input element with submit, and cancel buttons
	var	element = document.getElementById(control.renameDialogId);
   if (element) return;
   
   var currentsheet = control.currentSheetButton.value;
   var str = '<div style="padding:6px 0px 4px 6px;">'+
         '<span style="font-size:smaller;">'+'Rename-'+ currentsheet + '</span><br>'+
         '<input type="text" id="newSheetName" style="width:380px;" value="'+'"><br>'+'</div>';

   str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
         '<input type="button" value="Submit" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetSubmit();">&nbsp;'+
         '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetHide();"></div>';

   var main = document.createElement("div");
   main.id = control.renameDialogId;

   main.style.position = "absolute";

   var vp = SocialCalc.GetViewportInfo();

   main.style.top = (vp.height/3)+"px";
   main.style.left = (vp.width/3)+"px";
   main.style.zIndex = 100;
   main.style.backgroundColor = "#FFF";
   main.style.border = "1px solid black";

   main.style.width = "400px";

   main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlRenameSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
      '<div style="background-color:#DDD;">'+str+'</div>';

	//alert(main.innerHTML);

   SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
                  MouseUp: SocialCalc.DragFunctionPosition,
                  Disabled: null, positionobj: main});

   control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);

   var ele = document.getElementById("newSheetName");
   ele.focus();
   SocialCalc.CmdGotFocus(ele);
   
}

SocialCalc.WorkBookControlRenameSheetHide = function(){

   var control = SocialCalc.GetCurrentWorkBookControl();
   var spreadsheet = control.workbook.spreadsheet;

   var ele = document.getElementById(control.renameDialogId);
   ele.innerHTML = "";

   SocialCalc.DragUnregister(ele);

   SocialCalc.KeyboardFocus();

   if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
   }
}

SocialCalc.WorkBookControlRenameSheetSubmit = function(){

   // this handles all the rename action
   var ele = document.getElementById("newSheetName");
   //alert(ele.value);
   var control = SocialCalc.GetCurrentWorkBookControl();
   if (ele.value.length == 0) {
   	ele.focus();
   	return;
   }
   var oldname = control.currentSheetButton.value;
   var newname = ele.value;
   

   SocialCalc.WorkBookControlRenameSheetHide();
   // verify newname does not clash with any existing sheet name
   // if so reject
   for (var sheet in control.sheetButtonArr) {
		if (control.sheetButtonArr[sheet].value == newname) {
			alert(newname+" already exists");
			return;
		}
   }
   
   control.currentSheetButton.value = newname;
   
   // perform a rename for formula references to this sheet in all the 
   // sheets in the workbook
   control.workbook.RenameWorkBookSheet(oldname, ele.value, control.currentSheetButton.id);
}

SocialCalc.WorkBookControlCreateNewBook = function() {

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	// delete all the sheets except 1
	for (var sheet in control.sheetButtonArr) {
		if (sheet != control.currentSheetButton.id) {
			control.workbook.DeleteWorkBookSheet(control.sheetButtonArr[sheet].id, control.sheetButtonArr[sheet].value);
		}
	}
	// Reset that 1 sheet
	
	control.workbook.LoadRenameWorkBookSheet(control.currentSheetButton.id, "", control.workbook.defaultsheetname)
	
	
	// delete all the buttons except 1
	for (var sheet in control.sheetButtonArr) {
		if (sheet != control.currentSheetButton.id) {
			var foo = document.getElementById("fooBar");
			var current = document.getElementById(control.sheetButtonArr[sheet].id);
			
			var name = current.id;
			delete control.sheetButtonArr[name];
			
			foo.removeChild(current);
			control.numSheets = control.numSheets - 1;
		}
	}
	// rename that button
	control.currentSheetButton.value = control.workbook.defaultsheetname;	
}

SocialCalc.WorkBookControlNewBook = function() {
    var control = SocialCalc.GetCurrentWorkBookControl();
	SocialCalc.WorkBookControlCreateNewBook();
	control.workbook.RenderWorkBookSheet();
}

SocialCalc.WorkBookControlCopySheet = function(){

	//alert("in copy");

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	control.workbook.CopyWorkBookSheet(control.currentSheetButton.id);
	
	alert("copied sheet:"+control.currentSheetButton.value);
}

SocialCalc.WorkBookControlPasteSheet = function() {

	//alert("in paste");

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	var oldid = control.currentSheetButton.id;
	
	SocialCalc.WorkBookControlAddSheet(false);
	
	var newid = control.currentSheetButton.id;
	
	//alert(newid+oldid);
	
	control.workbook.PasteWorkBookSheet(newid, oldid);
	
}

