
package controls



//import java.io._

import freemarker.template._

import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

import org.eclipse.jetty.util.log.Log;

import org.eclipse.jetty.util.ajax.JSON;

import models._

// handles users and sheets

// from sweet scala -- look at it for a proper freemarker scala adapter
class JMap[A,B] extends java.util.HashMap[A,B]
/** Campanion class the produce java map instance. */
object JMap{
  def apply[A, B](tuples: (A,B)*): JMap[A,B] = {
    val map = new JMap[A,B]
    for((k,v) <- tuples) map.put(k,v)
    map
  }
  //TODO: we should look more on java.util.AbstractMap to actually implement this like JList.
  def apply[A, B](imap: scala.collection.Map[A,B]): JMap[A,B] = {
    val map = new JMap[A,B]
    for((k,v) <- imap) map.put(k,v)
    map 
  }
}


// Base class for any control
abstract class Control {
  val urlpath:String

  def handle(req: HttpServletRequest, resp: HttpServletResponse) : Unit = {
    req.getMethod() match {
      case "GET" => doGet(req, resp)
      case "POST" => doPost(req, resp)
      case _ => Log.debug("unknown request") // do something here
    }
  }


  def doGet(req: HttpServletRequest, resp: HttpServletResponse):Unit
  def doPost(req: HttpServletRequest, resp: HttpServletResponse):Unit
}

//
// a simple control for creating/editing/saving/viewing SocialCalc 
// sheets
//
object SheetControl extends Control {

  val urlpath = "/sheet"


  // View the sheet 
  private def viewSheet(user:String, 
			fname: String,
			req: HttpServletRequest, 
			resp: HttpServletResponse) : Unit = {

    val sheetstr = MyServer.fileIo.readFromFile(user, fname)    
    
    val root = new scala.collection.mutable.HashMap[String,Any]();

    root.put("sheetstr",sheetstr)
    root.put("fname",fname)
    root.put("username",user)
    root.put("titlestr","Spreadsheets")


    val jmap = JMap(root)

    if (req.getParameter("print") == null) {
      jmap.put("print","no")      
    } else {
      jmap.put("print","yes")      
    }

    val temp = MyServer.ftlCfg.getTemplate("viewsheet.html");

    val out = resp.getWriter()
    temp.process(jmap,out)
    out.flush()

  }

  // Edit the sheet
  private def editSheet(user:String, fname:String, resp: HttpServletResponse) : Unit = {

    val sheetstr = MyServer.fileIo.readFromFile(user, fname)

    val root = new scala.collection.mutable.HashMap[String,Any]();

    root.put("sheetstr",sheetstr)
    root.put("fname",fname)
    root.put("username",user)
    root.put("titlestr","Spreadsheets")


    val jmap = JMap(root)


    val temp = MyServer.ftlCfg.getTemplate("editsheet.html");

    val out = resp.getWriter()
    temp.process(jmap,out)
    out.flush()

  }

  // delete the sheet
  private def deleteSheet(user:String, fname:String, resp: HttpServletResponse) : Unit = {
    MyServer.fileIo.deleteFile(user, fname)
  }

  

  // list all sheets 

  def allPages(user:String, resp: HttpServletResponse) : Unit = {

    val root = new scala.collection.mutable.HashMap[String,Any]();

    val files = MyServer.fileIo.getFiles(user)
    
    root.put("dir",files)
    root.put("username",user)
    root.put("titlestr","Spreadsheets")

    val jmap = JMap(root)

    val temp = MyServer.ftlCfg.getTemplate("allpages.html");
    val out = resp.getWriter()
    temp.process(jmap,out)
    out.flush()
  }

  
  // implements GET

  def doGet(req: HttpServletRequest, resp: HttpServletResponse) : Unit = {

    Log.debug("====")


    var user = "demo"
    //
    // Uncomment the following if UserControl is available
    //
    // UserControl.findUser(req, resp) match {
    // case Some(x) => user = x; Log.debug("found user:"+x)
    // case None => Log.debug("No user found !!")
    // UserControl.authenticateUser(req, resp, urlpath)
    //return
    //}

    val viewsheet = req.getParameter("view")
    if (viewsheet == "yes") {
      Log.debug("view existing file: "+req.getParameter("pagename"))
      viewSheet(user, req.getParameter("pagename"), req, resp)      
    }
    else {
      allPages(user, resp)
    }
  }


  // implements POST

  def doPost(req: HttpServletRequest, resp: HttpServletResponse) : Unit = {

    Log.debug("----")

    val params = req.getParameterMap();
    Log.debug(JSON.toString(params))

    
    var user = "demo"
    //
    // Uncomment the following if UserControl is available
    //
    /*
    UserControl.findUser(req, resp) match {
	case Some(x) => user = x; Log.debug("found user:"+x)
	case None => UserControl.authenticateUser(req, resp, urlpath)
		     return
    }
    */

    val newpagename = req.getParameter("newpagename")
    
    if (newpagename != null) {    
      if (newpagename != "") {
	editSheet(user, newpagename, resp)
      } else {
	resp.sendRedirect(urlpath)	
      }

      return
    }

    val pagename = req.getParameter("pagename")

    val cancelsheet = req.getParameter("cancelspreadsheet")
    if (cancelsheet != null) {
      Log.debug("canceling sheet: "+pagename)
      resp.sendRedirect(urlpath)
      return
    }

    val savesheet = req.getParameter("savespreadsheet")
    if (savesheet != null) {
      Log.debug("save existing file: "+pagename)
      MyServer.fileIo.writeToFile(user, pagename, req.getParameter("newstr"))
      resp.sendRedirect(urlpath)
      return
    }

    val editsheet = req.getParameter("edit")
    if (editsheet == "yes") {
      Log.debug("edit existing file: "+pagename)
      editSheet(user, pagename, resp)      
      return
    }

    val viewsheet = req.getParameter("view")
    if (viewsheet == "yes") {
      Log.debug("view existing file: "+pagename)
      viewSheet(user, pagename, req, resp)      
      return
    }

    val delsheet = req.getParameter("delete")
    if (delsheet == "yes") {
      Log.debug("delete existing file: "+pagename)
      deleteSheet(user, pagename, resp)      
      resp.sendRedirect(urlpath)
      return
    }

    if (req.getParameter("doneview") == "Done") {
      resp.sendRedirect(urlpath)
      return
    }

    resp.sendRedirect(urlpath)

  }

}

