"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Create express app
var express_1 = __importDefault(require("express"));
var _ = __importStar(require("lodash"));
// import bodyParser from "bodyParser"
var database_1 = __importDefault(require("./database"));
var app = (0, express_1.default)();
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// Server port
var HTTP_PORT = parseInt(process.env.PORT, 10) || 8000;
// Start server
app.listen(HTTP_PORT, function () {
    console.log("Server running on port " + HTTP_PORT);
});
// Root endpoint
app.get("/", function (req, res) {
    res.json({ message: "Ok" });
});
app.get("/api/v1/search", function (req, res) {
    if (!("genome" in req.query)) {
        req.query.genome = "Human";
    }
    if (!("assembly" in req.query)) {
        req.query.assembly = "GRCh38";
    }
    if (!("track" in req.query)) {
        req.query.track = "GENCODE";
    }
    if (!("version" in req.query)) {
        req.query.version = "v27.basic";
    }
    var genome = req.query.genome; // .toLowerCase()
    var assembly = req.query.assembly; // .toLowerCase()
    var track = req.query.track; // .toLowerCase()
    var version = req.query.version; // .toLowerCase()
    var trackSql = "select id FROM tracks WHERE genome LIKE ? AND assembly = ? AND track = ? AND version = ?";
    var trackParams = [genome, assembly, track, version];
    database_1.default.get(trackSql, trackParams, function (err, row) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        var trackId = row.id;
        var sql = "";
        var params = [];
        if ("name" in req.query) {
            var name_1 = _.get(req.query, "name", "BCL6");
            sql =
                "select json FROM gene_names, genes WHERE gene_names.track_id = ? AND name LIKE ? AND genes.id = gene_names.gene_id";
            params = [trackId, "%" + name_1 + "%"];
        }
        else {
            // Default to BCL6 chr3:187,721,381-187,745,468
            var chr = _.get(req.query, "chr", "chr3");
            var start = parseInt(_.get(req.query, "start", "187721370"), 10);
            var end = parseInt(_.get(req.query, "end", "187745800"), 10);
            // res.json({ message: req.query, loc: `${chr}:${start}-${end}`})
            sql =
                "select json from genes where track_id = ? AND chr = ? AND start >= ? AND end <= ?";
            params = [trackId, chr, start, end];
        }
        database_1.default.all(sql, params, function (err2, rows) {
            if (err2) {
                res.status(400).json({ error: err2.message });
                return;
            }
            // parse JSON from each row and create new array to convert back to json
            res.json({
                genome: genome,
                assembly: assembly,
                track: track,
                version: version,
                genes: rows.map(function (row2) { return JSON.parse(row2.json); }),
            });
        });
    });
});
// Insert here other API endpoints
// Default response for any other request
app.use(function (req, res) { return res.status(404); });
