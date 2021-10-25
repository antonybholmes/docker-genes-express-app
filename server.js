// Create express app
import express from "express"
//import bodyParser from "bodyParser"

import db from "./database.js"

const app = express()
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// Server port
const HTTP_PORT = 8080
// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Ok" })
})

app.get("/search", (req, res) => {
  if (!("genome" in req.query)) {
    req.query.genome = "Human"
  }

  if (!("assembly" in req.query)) {
    req.query.assembly = "GRCh38"
  }

  if (!("track" in req.query)) {
    req.query.track = "GENCODE"
  }

  if (!("version" in req.query)) {
    req.query.version = "v27.basic"
  }

  const genome = req.query.genome //.toLowerCase()
  const assembly = req.query.assembly //.toLowerCase()
  const track = req.query.track //.toLowerCase()
  const version = req.query.version //.toLowerCase()

  const track_sql =
    "select id FROM tracks WHERE genome LIKE ? AND assembly = ? AND track = ? AND version = ?"
  const track_params = [genome, assembly, track, version]

  db.get(track_sql, track_params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message })
      return
    }

    const trackId = row.id

    let sql = ""
    let params = []

    if ("name" in req.query) {
      sql =
        "select json FROM gene_names, genes WHERE gene_names.track_id = ? AND name LIKE ? AND genes.id = gene_names.gene_id"
      params = [trackId, `%${req.query.name}%`]
    } else {
      // Default to BCL6 chr3:187,721,381-187,745,468
      if (!("chr" in req.query)) {
        req.query.chr = "chr3"
      }

      if (!("start" in req.query)) {
        req.query.start = "187721370"
      }

      if (!("end" in req.query)) {
        req.query.end = "187745800"
      }

      const chr = req.query.chr
      const start = parseInt(req.query.start)
      const end = parseInt(req.query.end)

      //res.json({ message: req.query, loc: `${chr}:${start}-${end}`})

      sql =
        "select json from genes where track_id = ? AND chr = ? AND start >= ? AND end <= ?"
      params = [trackId, chr, start, end]
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }

      // parse JSON from each row and create new array to convert back to json
      res.json({
        genome: genome,
        assembly: assembly,
        track: track,
        version: version,
        data: rows.map((row) => JSON.parse(row.json)),
      })
    })
  })
})

// Insert here other API endpoints

// Default response for any other request
app.use(function (req, res) {
  res.status(404)
})
