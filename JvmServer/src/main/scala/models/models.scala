//
// Author: Ramu Ramamurthy
//


package models

import java.io._
import scala.collection.mutable.HashMap
import org.eclipse.jetty.util.log.Log;


//
// Base class for all file IO
//
//
//
abstract class UserFileIO {
  def readFromFile(user:String, fname:String) : String
  def writeToFile(user:String, fname:String, data:String) : Unit
  def getFiles(user:String) : Array[String]
  def deleteFile(user:String, fname:String) : Unit
}

import org.squeryl.SessionFactory
import java.sql.{Connection, DriverManager}
import org.squeryl.adapters.{MySQLAdapter, PostgreSqlAdapter, H2Adapter, OracleAdapter}
import org.squeryl.{Session}
import org.squeryl.dsl._
import org.squeryl._
import org.squeryl.PrimitiveTypeMode._




//
// Implementation of FileIO using a DB -- Here we are using MySql
//
trait InnoDB extends MySQLAdapter {
  abstract override def writeCreateTable[T](t: Table[T], sw:
org.squeryl.internals.StatementWriter, schema: Schema) = {
    super.writeCreateTable(t, sw, schema)
    sw.write("Engine = InnoDB\n")
  }} 

object DbFileIo extends UserFileIO {

  def createMySQLTestConnection = {
    Class.forName("com.mysql.jdbc.Driver");

    val c = DriverManager.getConnection("jdbc:mysql://localhost/test?user=squeryl&password=squeryl")

    //com.mysql.jdbc.Driver defaults to TRANSACTION_REPEATABLE_READ
    c.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED)
    
    Session.create(c,new MySQLAdapter with InnoDB)
  }

  def initSessions = {
    SessionFactory.concreteFactory = Some(createMySQLTestConnection _)
  }

  def readFromFile(user:String, fname:String) : String = {
    var res = ""
    transaction {
      res = DbFileSchema.readFromFile(user, fname)
    }
    res
  }

  def writeToFile(user:String, fname:String, data:String) : Unit = {
    transaction {
      DbFileSchema.writeToFile(user, fname, data)
    }    
  }  

  def deleteFile(user: String, fname:String) : Unit = {
    transaction {
      DbFileSchema.deleteFile(user, fname)
    }        
  }

  def getFiles(user:String) : Array[String] = {  
    var retval = new Array[String](0)
    transaction {
      retval = DbFileSchema.getFiles(user)
    }
    retval
  }


}

//
// Implementation of FileIO directly on the filesystem
//
object DirectFileIo extends UserFileIO {

  val saveDir = "./src/main/resources/scdata/"

  def readFromFile(user: String, fname:String) : String = {
    try {
      scala.io.Source.fromFile(saveDir+fname).mkString    
    }
    catch {
      case _ => ""
    }
  }

  def deleteFile(user: String, fname:String) : Unit = {
    ()
  }

  def writeToFile(user:String, fname:String, data:String) : Unit = {
    Log.info("writing to file: "+saveDir+fname);
    Log.info(data)
    var bw = new BufferedWriter(new FileWriter(saveDir+fname))
    bw.write(data)
    bw.close()
  }

  // directory listing
  def getFiles(user:String) : Array[String] = {
    val dir = new File(saveDir)
    val files = dir.list()
    files
  }


}


/*
 *
 *
 * Implementation of FileIO using Cassandra 
 *
 *
 *
 *
 */

/*
import com.shorrockin.cascal.utils.Conversions._
import com.shorrockin.cascal.model._
import com.shorrockin.cascal.session._
import com.shorrockin.cascal.utils._
*/

/*
 *  Uncomment the following if using cassandra 
 *
 * 
object Cascal {

  val hosts  = Host("localhost", 9160, 250) :: Nil
  val params = new PoolParams(10, ExhaustionPolicy.Fail, 500L, 6, 2)
  lazy val pool = new SessionPool(hosts, params, Consistency.One)
    ()

/*
 def main(args:Array[String]) {
    pool.borrow { session =>
      session.insert("Keyspace1" \ "Standard2" \ "lakshmi" \ ("likes","music"))
    }
 }
 * */
}

*
* */


/*
 *
 *
 *
 * 
class CascalFileIo(keyprefix:String) extends UserFileIO {
  
  val keyspace = "Keyspace1" \\ "Super2" \ keyprefix

  def readFromFile(user: String, fname:String) : String = {
    var retval = ""
    Cascal.pool.borrow { session =>
      session.get(keyspace \ user \ fname) match {
	case Some(data) => retval = data.value
				   //Log.debug(data);
				   //Log.debug(data.name);
				   //Log.debug(data.value)
	case None => Log.info("file not found :" + fname); retval = ""
      }
    }
    retval
  }

  def writeToFile(user:String, fname:String, data:String) : Unit = {
    Cascal.pool.borrow { session =>
      session.insert(keyspace \ user \ (fname,data))
    }
    ()
  }

  // directory listing
  def getFiles(user:String) : Array[String] = {
    var retval = new Array[String](0)

    Cascal.pool.borrow { session =>
      val results = session.list(keyspace \ user )
      val fnames = results.map { col => string(col.name) }
      Log.info(fnames.toString())
      retval = fnames.toArray[String]
    }

    retval
  }

  def deleteFile(user: String, fname:String) : Unit = {
    Cascal.pool.borrow { session =>
      session.remove(keyspace \ user \ fname)
    }
  }


}
*/
