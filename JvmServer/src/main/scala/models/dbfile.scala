//
// Author: Ramu Ramamurthy
//

package models


import java.sql.SQLException
import org.squeryl.annotations.{Column}
import org.squeryl.tests.QueryTester
import java.util.Date
import java.text.SimpleDateFormat
import org.squeryl.dsl.{GroupWithMeasures}
import org.squeryl.dsl._
import ast.TypedExpressionNode
import org.squeryl._

import org.squeryl.PrimitiveTypeMode._

class FileDbObject extends KeyedEntity[Int] {
  var id: Int = 0
}

class DbFile(var fname:String,
             var user:String,
             var data:Array[Byte]) extends FileDbObject

/*Note that MySql Adapter must change blob type to long blob*/

object DbFileSchema extends Schema {


  val files = table[DbFile]

  
  //drop 
  //create

  def writeToFile(user:String, fname:String, data:String) : Unit = {

    val matchfiles = files.where(f => f.fname === fname and f.user  === user)
    if (matchfiles.toList.length == 0)
      files.insert(new DbFile(fname,user,data.getBytes()))
    else {
      val matchf = matchfiles.single
      matchf.data = data.getBytes()
      files.update(matchf)
    }
      
  }
  
  def deleteFile(user: String, fname:String) : Unit = {


    val matchfiles = from(files) ( f =>
      where (f.fname === fname and f.user === user)
      select(f)
    )
    files.delete(matchfiles)
  }

  def readFromFile(user: String, fname:String) : String = {

    val matchfiles = from(files) ( f =>
      where (f.fname === fname and f.user === user)
      select(f)
    )
    if (matchfiles.toList.length == 0)
      ""
    else {
      val file = matchfiles.single
      new String(file.data)
    }
  }

  def getFiles(user:String) : Array[String] = {  

    val matchfiles = from(files) ( f =>
      where (f.user === user)
      select(f)
      orderBy(f.fname asc)
    )
    matchfiles.map(f => f.fname).toArray[String]
  }
}


