import sqlite3 from "sqlite3" //require('sqlite3').verbose()

const DBSOURCE = "genedb.sqlite3"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }
});


export default db