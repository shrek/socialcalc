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
	this.renameDialogId = "sheetRenameDialog";
	
	this.sheetshtml = '<div id="fooBar" style="padding:6px;background-color:#80A9F3;"></div>';

	this.buttonshtml = 
'<form>'+
'<div id="workbookControls" style="padding:6px;background-color:#80A9F3;">'+
'<input type="button" value="add sheet" onclick="SocialCalc.WorkBookControlAddSheet(true)" class="smaller">'+
'<input type="button" value="delete sheet" onclick="SocialCalc.WorkBookControlDelSheet()" class="smaller">'+
'<input type="button" value="rename sheet" onclick="SocialCalc.WorkBookControlRenameSheet()" class="smaller">'+
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
   control.workbook.RenameWorkBookSheet(oldname, ele.value);
}
