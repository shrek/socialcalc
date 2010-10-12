
//
// Workbook is a collection of sheets that are worked upon together
// 
// The WorkBook class models and manages the collection of sheets
//
// Author: Ramu Ramamurthy
//
//

var SocialCalc;
if (!SocialCalc) {
	alert("Main SocialCalc code module needed");
    SocialCalc = {};
}

// Constructor:

SocialCalc.WorkBook = function(spread) {
	this.spreadsheet = spread; // this is the spreadsheet control
   	this.defaultsheetname = null;
	this.sheetArr = {};  // misnomer, this is not really an array
}

// Methods

SocialCalc.WorkBook.prototype.InitializeWorkBook = function(defaultsheet) {
	return SocialCalc.InitializeWorkBook(this, defaultsheet);
}
SocialCalc.WorkBook.prototype.AddNewWorkBookSheet = function(sheetname,oldsheetname) {return SocialCalc.AddNewWorkBookSheet(this, sheetname,oldsheetname);};
SocialCalc.WorkBook.prototype.ActivateWorkBookSheet = function(sheetname,oldsheetname) {return SocialCalc.ActivateWorkBookSheet(this,sheetname,oldsheetname);};
SocialCalc.WorkBook.prototype.DeleteWorkBookSheet = function(sheetname,oldsheetname) {return SocialCalc.DeleteWorkBookSheet(this,sheetname,oldsheetname);};
SocialCalc.WorkBook.prototype.CreateSaveWorkBook = function() {return SocialCalc.CreateSaveWorkBook(this);};
SocialCalc.WorkBook.prototype.LoadWorkBook = function(savestr) {return SocialCalc.LoadWorkBook(this, savestr);};
SocialCalc.WorkBook.prototype.RenameWorkBookSheet = function(oldname, newname) {return SocialCalc.RenameWorkBookSheet(this, oldname, newname);};


SocialCalc.InitializeWorkBook = function InitializeWorkBook(workbook, defaultsheet) {

   	workbook.defaultsheetname = defaultsheet;
	
	var spreadsheet = workbook.spreadsheet;
	var defaultsheetname = workbook.defaultsheetname;
	
    // Initialize the Spreadsheet Control and display it

	SocialCalc.Formula.SheetCache.sheets[defaultsheetname] = {sheet: spreadsheet.sheet, name: defaultsheetname}; 

   	workbook.sheetArr[defaultsheetname] = {};
   	workbook.sheetArr[defaultsheetname].sheet = spreadsheet.sheet;
   	workbook.sheetArr[defaultsheetname].context = spreadsheet.context;
	
	// if these were properties of the sheet, then we wouldnt need to do this !
   	workbook.sheetArr[defaultsheetname].editorprop = {};
   	workbook.sheetArr[defaultsheetname].editorprop.ecell = null;
   	workbook.sheetArr[defaultsheetname].editorprop.range = null;
   	workbook.sheetArr[defaultsheetname].editorprop.range2 = null;
}


SocialCalc.AddNewWorkBookSheet = function AddNewWorkBookSheet(workbook, sheetnamestr,oldsheetnamestr) {
	
	var spreadsheet = workbook.spreadsheet;
	
	//alert("create new sheet "+sheetnamestr+" old="+oldsheetnamestr+" def="+workbook.defaultsheetname);
	
	spreadsheet.sheet = new SocialCalc.Sheet();
				
	SocialCalc.Formula.SheetCache.sheets[sheetnamestr] = {sheet: spreadsheet.sheet, name: sheetnamestr};
				
	spreadsheet.sheet.sheetname = sheetnamestr;
	spreadsheet.context = new SocialCalc.RenderContext(spreadsheet.sheet);

	spreadsheet.sheet.statuscallback = SocialCalc.EditorSheetStatusCallback;
    spreadsheet.sheet.statuscallbackparams = spreadsheet.editor;
				
    workbook.sheetArr[sheetnamestr] = {};
	workbook.sheetArr[sheetnamestr].sheet = spreadsheet.sheet;
	workbook.sheetArr[sheetnamestr].context = spreadsheet.context;
	
	workbook.sheetArr[sheetnamestr].editorprop = {};
	workbook.sheetArr[sheetnamestr].editorprop.ecell = null;
	workbook.sheetArr[sheetnamestr].editorprop.range = null;
	workbook.sheetArr[sheetnamestr].editorprop.range2 = null;

	workbook.sheetArr[oldsheetnamestr].editorprop.ecell = spreadsheet.editor.ecell;
	workbook.sheetArr[oldsheetnamestr].editorprop.range = spreadsheet.editor.range;
	workbook.sheetArr[oldsheetnamestr].editorprop.range2 = spreadsheet.editor.range2;

				
	spreadsheet.context.showGrid = true;
   	spreadsheet.context.showRCHeaders = true;
	spreadsheet.editor.context = spreadsheet.context;

	spreadsheet.editor.ecell = {coord: "A1", row: 1, col: 1};
	spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";
	
	spreadsheet.editor.range = {hasrange: false};
	spreadsheet.editor.range2 = {hasrange: false};	

	spreadsheet.editor.FitToEditTable();
	spreadsheet.editor.ScheduleRender();	
	
}

SocialCalc.ActivateWorkBookSheet = function ActivateWorkBookSheet(workbook, sheetnamestr, oldsheetnamestr) {

	var spreadsheet = workbook.spreadsheet;
	
	//alert("activate "+sheetnamestr+" old="+oldsheetnamestr);
	
	spreadsheet.sheet = workbook.sheetArr[sheetnamestr].sheet;
	spreadsheet.context = workbook.sheetArr[sheetnamestr].context;

	spreadsheet.editor.context = spreadsheet.context;

	if (oldsheetnamestr != null) {
		workbook.sheetArr[oldsheetnamestr].editorprop.ecell = spreadsheet.editor.ecell;
	}
	spreadsheet.editor.ecell = workbook.sheetArr[sheetnamestr].editorprop.ecell;
	
	if (oldsheetnamestr != null) {
		workbook.sheetArr[oldsheetnamestr].editorprop.range = spreadsheet.editor.range;
	}
	spreadsheet.editor.range = workbook.sheetArr[sheetnamestr].editorprop.range;
			   
	if (oldsheetnamestr != null) {
		workbook.sheetArr[oldsheetnamestr].editorprop.range2 = spreadsheet.editor.range2;
	}
	spreadsheet.editor.range2 = workbook.sheetArr[sheetnamestr].editorprop.range2;
			   		   
	//spreadsheet.editor.ScheduleRender();
	spreadsheet.ExecuteCommand('recalc', '');
}   

SocialCalc.DeleteWorkBookSheet = function DeleteWorkBookSheet(workbook, name) {
	
	//alert("delete "+name);
	
	delete workbook.sheetArr[name].context;
	delete workbook.sheetArr[name].sheet;
	delete workbook.sheetArr[name];
	// take sheet out of the formula cache
	delete SocialCalc.Formula.SheetCache.sheets[name]
}

// create a serialization of the savestr+editor settings+audit of all sheets,
// and some additional metadata about which sheet is active etc
// use JSON to serialize ?
SocialCalc.CreateSaveWorkBook = function CreateSaveWorkBook(workbook) {
	// this is just a start
	var arr = []
	for (var sheet in workbook.sheetArr) {
		if (sheet != null) {
			arr.push(workbook.sheetArr[sheet].sheet.CreateSheetSave());
		}
	}
	alert(arr);
} 

SocialCalc.LoadWorkBook = function LoadWorkBook(workbook, savestr) {
	alert("not implemented yet");
}

SocialCalc.RenameWorkBookSheet = function RenameWorkBookSheet(workbook, oldname, newname) {
	alert("not implemented yet");
}
