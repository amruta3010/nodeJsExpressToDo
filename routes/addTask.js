/**
 * http://usejsdoc.org/
 */
var express = require('express');
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('../dbconfig/dbconfig.js');

var router = express.Router();
//router.post('/:person_uuid&:task_name&:task_status', function(req, res, next) {
router.post('/:person_uuid&:task_name&:task_status', function(req, res, next) {
	res.send({message: 'OK'});
	var personUuid = req.params.person_uuid;
	var taskName = req.params.task_name;
	var taskStatus = req.params.task_status;
	
	var task ={
		task_uuid: 'T11', //should be auto generated
		task_name: taskName
	};
	
	var person_task ={
		person_uuid: personUuid,
		task_uuid: 'T11',
		task_status: taskStatus
	};
	
	var doconnect = function(cb) {
		  oracledb.getConnection(dbConfig, cb);
		};

	var dorelease = function(conn) {
		  conn.close(function (err) {
		    if (err){
		      console.error(err.message);
		    }
		  });
		};


	var doinsertTask = function(conn, cb) {
		  var sql = "INSERT INTO Task VALUES (:a, :b)";

		  var binds = [
		    { a: task.task_uuid, b: task.task_name }
		    //,{ a: 2, b: "Test 2 (Two)" }
		    
		  ];

		  // bindDefs is optional for IN binds but it is generally recommended.
		  // Without it the data must be scanned to find sizes and types.
		  var options = {
		    autoCommit: true,
		    /*bindDefs: {
		      a: { type: oracledb.NUMBER },
		      b: { type: oracledb.STRING, maxSize: 15 }
		    } */};

		  conn.executeMany(sql, binds, options, function (err, result) {
		    if (err){
		      return cb(err, conn);
		    }
		    else {
		      console.log("Task Result is:", result);
		      return cb(null, conn);
		    }
		  });
		};
		
		var doinsertPersonTask = function(conn, cb) {
			  var sql = "INSERT INTO Person_task VALUES (:a, :b, :c)";

			  var binds = [
			    { a: person_task.person_uuid, b: person_task.task_uuid, c: person_task.task_status }
			    //,{ a: 2, b: "Test 2 (Two)" },			  
			  ];

			  // bindDefs is optional for IN binds but it is generally recommended.
			  // Without it the data must be scanned to find sizes and types.
			  var options = {
			    autoCommit: true,
			    /*bindDefs: {
			      a: { type: oracledb.NUMBER },
			      b: { type: oracledb.STRING, maxSize: 15 }
			    }*/ };

			  conn.executeMany(sql, binds, options, function (err, result) {
			    if (err){
			      return cb(err, conn);
			    }
			    else {
			      console.log("Person_Task Result is:", result);
			      return cb(null, conn);
			    }
			  });
			};

	async.waterfall(
		  [
		    doconnect,
		    doinsertTask,
		    doinsertPersonTask
		  ],
		  function (err, conn) {
		    if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
		    if (conn) { dorelease(conn);}
		  });
});

module.exports = router;

