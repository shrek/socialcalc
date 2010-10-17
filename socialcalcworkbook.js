
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
	this.clipsheet = {}; // for copy paste of sheets
}

// Methods

SocialCalc.WorkBook.prototype.InitializeWorkBook = function(defaultsheet) {
	return SocialCalc.InitializeWorkBook(this, defaultsheet);
}
SocialCalc.WorkBook.prototype.AddNewWorkBookSheet = function(sheetname,oldsheetname, fromclip) {return SocialCalc.AddNewWorkBookSheet(this, sheetname,oldsheetname, fromclip);};
SocialCalc.WorkBook.prototype.ActivateWorkBookSheet = function(sheetname,oldsheetname) {return SocialCalc.ActivateWorkBookSheet(this,sheetname,oldsheetname);};
SocialCalc.WorkBook.prototype.DeleteWorkBookSheet = function(sheetname,cursheetname) {return SocialCalc.DeleteWorkBookSheet(this,sheetname,cursheetname);};
SocialCalc.WorkBook.prototype.SaveWorkBookSheet = function(sheetid) {return SocialCalc.SaveWorkBookSheet(this, sheetid);};
SocialCalc.WorkBook.prototype.LoadWorkBookSheet = function(sheetid, savestr) {return SocialCalc.LoadWorkBookSheet(this, sheetid, savestr);};
SocialCalc.WorkBook.prototype.RenameWorkBookSheet = function(oldname, newname) {return SocialCalc.RenameWorkBookSheet(this, oldname, newname);};
SocialCalc.WorkBook.prototype.CopyWorkBookSheet = function(sheetid) {return SocialCalc.CopyWorkBookSheet(this, sheetid);};
SocialCalc.WorkBook.prototype.PasteWorkBookSheet = function(newid, oldid) {return SocialCalc.PasteWorkBookSheet(this, newid, oldid);};
SocialCalc.WorkBook.prototype.RenderWorkBookSheet = function() {return SocialCalc.RenderWorkBookSheet(this);};

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
	
	workbook.clipsheet.savestr = null;
	workbook.clipsheet.copiedfrom = null;
	workbook.clipsheet.editorprop = {};
}


SocialCalc.AddNewWorkBookSheet = function AddNewWorkBookSheet(workbook, sheetnamestr,oldsheetnamestr, fromclip) {
	
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

	if (oldsheetnamestr != null) {
		workbook.sheetArr[oldsheetnamestr].editorprop.ecell = spreadsheet.editor.ecell;
		workbook.sheetArr[oldsheetnamestr].editorprop.range = spreadsheet.editor.range;
		workbook.sheetArr[oldsheetnamestr].editorprop.range2 = spreadsheet.editor.range2;
	}

				
	spreadsheet.context.showGrid = true;
   	spreadsheet.context.showRCHeaders = true;
	spreadsheet.editor.context = spreadsheet.context;

	if (!fromclip) {
		spreadsheet.editor.ecell = {
			coord: "A1",
			row: 1,
			col: 1
		};
		
		spreadsheet.editor.range = {
			hasrange: false
		};
		spreadsheet.editor.range2 = {
			hasrange: false
		};
	}
	
	// set highlights
	spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";
	
	if (fromclip) {
		// this is the result of a paste sheet
		//alert("from clip");
		
		if (workbook.clipsheet.savestr != null) {
			//alert("sheetdata = "+workbook.clipsheet.savestr);
			spreadsheet.sheet.ParseSheetSave(workbook.clipsheet.savestr);
		}
				
		spreadsheet.editor.ecell = workbook.clipsheet.editorprop.ecell;
		spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";
	
		// range is not pasted ??!??
	
	}
	
	spreadsheet.editor.FitToEditTable();
	spreadsheet.editor.ScheduleRender();	
	//spreadsheet.ExecuteCommand('recalc', '');
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
			   	
	// reset highlights ??
					   
	//spreadsheet.editor.ScheduleRender();
	spreadsheet.ExecuteCommand('recalc', '');
}   

SocialCalc.DeleteWorkBookSheet = function DeleteWorkBookSheet(workbook, oldname, curname) {
	
	//alert("delete "+oldname+","+curname);
	
	delete workbook.sheetArr[oldname].context;
	delete workbook.sheetArr[oldname].sheet;
	delete workbook.sheetArr[oldname];
	// take sheet out of the formula cache
	delete SocialCalc.Formula.SheetCache.sheets[curname];
}


SocialCalc.SaveWorkBookSheet = function CreateSaveWorkBook(workbook, sheetid) {

	var sheetstr = {}
	sheetstr.savestr = workbook.sheetArr[sheetid].sheet.CreateSheetSave();
	return sheetstr;
} 

SocialCalc.LoadWorkBookSheet = function LoadWorkBookSheet(workbook, sheetid, savestr) {
	
	workbook.sheetArr[sheetid].sheet.ResetSheet();
	workbook.sheetArr[sheetid].sheet.ParseSheetSave(savestr);
}

SocialCalc.RenderWorkBookSheet = function RenderWorkBookSheet(workbook) {
	workbook.spreadsheet.editor.ScheduleRender();
}

SocialCalc.RenameWorkBookSheetCell = function(formula, oldname, newname) {
 	var ttype, ttext, i, newcr;
   	var updatedformula = "";
   	var sheetref = false;
   	var scf = SocialCalc.Formula;
   	if (!scf) {
   		return "Need SocialCalc.Formula";
    }
   	var tokentype = scf.TokenType;
   	var token_op = tokentype.op;
   	var token_string = tokentype.string;
   	var token_coord = tokentype.coord;
   	var tokenOpExpansion = scf.TokenOpExpansion;

   	var parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);

   	for (i = 0; i < parseinfo.length; i++) {
   		ttype = parseinfo[i].type;
   		ttext = parseinfo[i].text;
		//alert(ttype+","+ttext);
		if ((ttype == tokentype.name) && (scf.NormalizeSheetName(ttext) == oldname) && (i < parseinfo.length)) {
   			if ((parseinfo[i + 1].type == token_op) && (parseinfo[i + 1].text == "!")) {
				updatedformula += newname;
			} else {
				updatedformula += ttext;
			}
	  	} else {
			updatedformula += ttext;
		}
   	}
	//alert(updatedformula);
	return updatedformula;
}

SocialCalc.RenameWorkBookSheet = function RenameWorkBookSheet(workbook, oldname, newname) {

	// for each sheet, fix up all the formula references
	//
	var oldsheet = SocialCalc.Formula.SheetCache.sheets[oldname].sheet;
	delete SocialCalc.Formula.SheetCache.sheets[oldname];
	SocialCalc.Formula.SheetCache.sheets[newname] = {sheet: oldsheet, name: newname};
	//
	// fix up formulas for sheet rename
	// if formulas should not be fixed up upon sheet rename, then comment out the following
	// block
	//
	for (var sheet in workbook.sheetArr) {
		//alert("found sheet-"+sheet)
		for (var cr in workbook.sheetArr[sheet].sheet.cells) { // update cell references to sheet name
			//alert(cr);
			var cell = workbook.sheetArr[sheet].sheet.cells[cr];
			//if (cell) alert(cell.datatype)
			if (cell && cell.datatype == "f") {
				cell.formula = SocialCalc.RenameWorkBookSheetCell(cell.formula, oldname, newname);
				if (cell.parseinfo) {
					delete cell.parseinfo;
				}
			}
		}
	}
	// recalculate
	workbook.spreadsheet.ExecuteCommand('recalc', '');
}

SocialCalc.CopyWorkBookSheet = function CopyWorkBookSheet(workbook, sheetid) {

	//alert("in copy "+sheetid);
    workbook.clipsheet.savestr = workbook.sheetArr[sheetid].sheet.CreateSheetSave();
	//alert("in copy save="+workbook.clipsheet.savestr);
    workbook.clipsheet.copiedfrom = sheetid;
    workbook.clipsheet.editorprop = {};
    workbook.clipsheet.editorprop.ecell = workbook.spreadsheet.editor.ecell;
    //workbook.clipsheet.editorprop.range = workbook.spreadsheet.editor.range;
	//workbook.clipsheet.editorprop.range2 = workbook.spreadsheet.editor.range2;
	//workbook.clipsheet.highlights = workbook.spreadsheet.context.highlights;
	
	alert("copied "+sheetid);
}

SocialCalc.PasteWorkBookSheet = function PasteWorkBookSheet(workbook, newsheetid, oldsheetid) {
	
	//alert(newsheetid+oldsheetid);
	workbook.AddNewWorkBookSheet(newsheetid, oldsheetid, true);
	
	// clear the clip ?
	
}