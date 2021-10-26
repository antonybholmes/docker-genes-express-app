"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3_1 = __importDefault(require("sqlite3")); // require('sqlite3').verbose()
var DBSOURCE = "genedb.sqlite3";
var db = new sqlite3_1.default.Database(DBSOURCE, function (err) {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }
});
exports.default = db;
