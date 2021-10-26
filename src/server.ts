// Create express app
import express from "express"
import * as _ from "lodash"
// import bodyParser from "bodyParser"

import db from "./database"

const app = express()
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// Server port
const HTTP_PORT: number = parseInt(process.env.PORT as string, 10) || 8000

// Start server
app.listen(HTTP_PORT, () => {
  console.log(`Server running on port ${HTTP_PORT}`)
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

  const genome = req.query.genome // .toLowerCase()
  const assembly = req.query.assembly // .toLowerCase()
  const track = req.query.track // .toLowerCase()
  const version = req.query.version // .toLowerCase()

  const trackSql =
    "select id FROM tracks WHERE genome LIKE ? AND assembly = ? AND track = ? AND version = ?"
  const trackParams = [genome, assembly, track, version]

  db.get(
    trackSql,
    trackParams,
    (err: { message: string }, row: { id: number }) => {
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }

      const trackId = row.id

      let sql = ""
      let params = []

      if ("name" in req.query) {
        const name = _.get(req.query, "name", "BCL6") as string

        sql =
          "select json FROM gene_names, genes WHERE gene_names.track_id = ? AND name LIKE ? AND genes.id = gene_names.gene_id"
        params = [trackId, `%${name}%`]
      } else {
        // Default to BCL6 chr3:187,721,381-187,745,468
        const chr = _.get(req.query, "chr", "chr3")
        const start = parseInt(
          _.get(req.query, "start", "187721370") as string,
          10
        )
        const end = parseInt(_.get(req.query, "end", "187745800") as string, 10)

        // res.json({ message: req.query, loc: `${chr}:${start}-${end}`})

        sql =
          "select json from genes where track_id = ? AND chr = ? AND start >= ? AND end <= ?"
        params = [trackId, chr, start, end]
      }

      db.all(
        sql,
        params,
        (err2: { message: string }, rows: { json: string }[]) => {
          if (err2) {
            res.status(400).json({ error: err2.message })
            return
          }

          // parse JSON from each row and create new array to convert back to json
          res.json({
            genome,
            assembly,
            track,
            version,
            genes: rows.map((row2: { json: string }) => JSON.parse(row2.json)),
          })
        }
      )
    }
  )
})

// Insert here other API endpoints

// Default response for any other request
app.use((req, res) => res.status(404))
