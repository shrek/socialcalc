
package controls

import java.io._

import freemarker.template._

import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
  
import org.eclipse.jetty.server.handler.AbstractHandler

import org.eclipse.jetty.server.Request
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.NCSARequestLog;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.server.handler.RequestLogHandler;
import org.eclipse.jetty.server.handler.HandlerCollection;

import org.eclipse.jetty.util.log.Log;

import controls._
import models._

object MyHandler extends AbstractHandler {

  val controls = Map("/sheet" -> SheetControl)

  val defaultControl = SheetControl

  def findControl(path:String):Option[Control] = {
    for (url <- controls.keys) {
      if (path.startsWith(url)) {
	return Some(controls(url))
      }
    }
    return None
  }
  
  override def handle(target: String, baseRequest: Request, req: HttpServletRequest, resp: HttpServletResponse): Unit = {
    
    // if its a resource, forget it

    val path = req.getPathInfo()

    Log.debug("servlet path:"+req.getPathInfo())

    // do a prefix matcher later
    findControl(path) match {
      case Some(x) => x.handle(req, resp)
                      baseRequest.setHandled(true)
		      return
      case None => Log.debug("no control found")
    }

    // otherwise fall through

    val staticResources = List(".js",".css",".gif",".html")

    staticResources.find(path.endsWith) match {
      case Some(x) => 
	{
	  Log.debug("matched "+x)
	  baseRequest.setHandled(false)
	}
      case None =>     
	{
	  // default handler
	  SheetControl.handle(req,resp)
	  baseRequest.setHandled(true)
	}
    }      

  }
}


object MyServer {

  val viewDir = "./src/main/resources/views/"

  val ftlCfg = new Configuration()
  //val ftlCfg = new ScalaFreemarkerConfiguration()

  // Data Store
  //
  // There are 3 options 
  //
  // 1. File Backed Io         -- this is the simplest
  // 2. Db Backed Io           -- supports various Dbs using Squeryl ORM
  // 3. Cassandra backed Io    -- backed by the cassandra NoSql

  //val fileIo = new CascalFileIo("user-files")
  val fileIo = DirectFileIo
  //val fileIo = DbFileIo


  def main(args: Array[String]) {

    ftlCfg.setDirectoryForTemplateLoading(new File(viewDir));
    ftlCfg.setObjectWrapper(new DefaultObjectWrapper());

    var server = new Server(8080)

    var fileHandler = new ResourceHandler()
    fileHandler.setResourceBase("..")
    fileHandler.setDirectoriesListed(false)


    var defaultHandler = new DefaultHandler()
    var myHandler = MyHandler

    var appHandlers = new HandlerList()

    appHandlers.addHandler(myHandler)
    appHandlers.addHandler(fileHandler)
    appHandlers.addHandler(defaultHandler)

    var log = new RequestLogHandler();
    log.setRequestLog(new NCSARequestLog(File.createTempFile("demo","log").getAbsolutePath()));
    
    var handlers = new HandlerCollection();

    handlers.setHandlers(Array(appHandlers,log));

    server.setHandler(handlers)

    Log.debug("serving " + fileHandler.getBaseResource());

    server.start()

    server.join()
  }

}

