/**
 * http://usejsdoc.org/
 */
var express = require('express');
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('../dbconfig/dbconfig.js');

/* GET home page. */
var router = express.Router();
router.get('/:person_uuid', function(req, res, next) {
  //res.render('index', { title: 'Express' });
	var person_uuid = req.params.person_uuid;
	console.log('Person_uuid : ' + person_uuid);
	res.send({message: 'OK'});
  
  var doconnect = function(cb) {
	  oracledb.getConnection(
	    {
	      user          : dbConfig.user,
	      password      : dbConfig.password,
	      connectString : dbConfig.connectString
	    },
	    cb);
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
	    "select p.person_name,t.task_name,pt.task_status from Person p,Task t,Person_Task pt where p.person_uuid = pt.person_uuid and t.task_uuid = pt.task_uuid and p.person_uuid = :person_uuid",
	    [person_uuid],	    
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
	    "select p.person_name,t.task_name,pt.task_status from Person p,Task t,Person_Task pt where p.person_uuid = pt.person_uuid and t.task_uuid = pt.task_uuid and p.person_uuid = :person_uuid",
	    //{}, // A bind variable parameter is needed to disambiguate the following options parameter
	    [person_uuid],
	    // otherwise you will get Error: ORA-01036: illegal variable name/number
	    { outFormat: oracledb.OBJECT }, // outFormat can be OBJECT or ARRAY.  The default is ARRAY
	    function(err, result) {
	      if (err) {
	        return cb(err, conn);
	      } else {
	        console.log("----- Person Table (OBJECT output format) --------");
	        console.log(result.rows);
	        return cb(null, conn);
	      }
	    });
	};

async.waterfall(
	  [
	    doconnect,
	    doquery_array,
	    doquery_object
	  ],
	  function (err, conn) {
	    if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
	    if (conn) { dorelease(conn); }	      
	  });
	
});

module.exports = router;