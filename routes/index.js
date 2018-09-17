/**
 * http://usejsdoc.org/
 */
var express = require('express');
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('../dbconfig/dbconfig.js');

/* GET home page. */
var router = express.Router();
router.get('/', function(req, res, next) {
  	//res.send({message: 'OK'});
	
  
	var doconnect = function(cb) {
		  oracledb.getConnection(dbConfig, cb);
		};

	var dorelease = function(conn) {
	  conn.close(function (err) {
	    if (err){
	      console.error(err.message);}
	  });
	};

	// Default Array Output Format
	var doquery_array = function (conn, cb) {
	  conn.execute(
	    "select person_name from Person",
	    [],	    
	    function(err, result) {
	      if (err) {
	        return cb(err, conn);
	      } else {
	        console.log("----- Person Table (default ARRAY output format) --------");
	        console.log(result.rows);		       
	        return cb(null, conn);
	      }
	    });
	};

	// Optional Object Output Format
	var doquery_object = function (conn, cb) {
	  conn.execute(
	    "select * from Person",
	    {}, // A bind variable parameter is needed to disambiguate the following options parameter
	  
	    // otherwise you will get Error: ORA-01036: illegal variable name/number
	    { outFormat: oracledb.OBJECT }, // outFormat can be OBJECT or ARRAY.  The default is ARRAY
	    function(err, result) {
	      if (err) {
	        return cb(err, conn);
	      } else {
	        console.log("----- Person Table (OBJECT output format) --------");
	        console.log(result.rows);
	        res.render('../views/index', { persons: result.rows });
	        return cb(null, conn);
	      }
	    });	  
	};

	async.waterfall(
	  [
	    doconnect,
	    //doquery_array,
	    doquery_object,
	    //res.render('index', { persons: result })
	    //res.render('index', { title: 'Express' })
	  ],
	  function (err, conn) {
	    if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
	    if (conn) { 
	    	dorelease(conn);
	    	console.log("Connection Closed");
	    	
	    	//res.send({message: 'OK'});	    	
	    }	      
	  });
	
});

module.exports = router;