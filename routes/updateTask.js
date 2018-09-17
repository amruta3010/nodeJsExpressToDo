/**
 * http://usejsdoc.org/
 */
var express = require('express');
var async = require('async');
var oracledb = require('oracledb');
var bodyParser = require("body-parser");
var dbConfig = require('../dbconfig/dbconfig.js');



var router = express.Router();
//router.post('/:person_uuid&:task_uuid&:task_name&:task_status', function(req, res, next) {
router.post('/', function(req, res, next) {
	res.send({message: 'OK'});
	
	var add_params =  JSON.parse(req.params.addParams);
	//var personUuid = req.params.person_uuid;
	//var taskUuid = req.params.task_uuid;
	//var taskName = req.params.task_name;
	//var taskStatus = req.params.task_status;
	console.log(add_params);
	
	var task ={
		task_uuid: add_params.task_uuid,
		task_name: add_params.task_name
	};
	
	var person_task ={
		person_uuid: add_params.person_uuid,
		task_uuid: add_params.task_uuid,
		task_status: add_params.task_status
	};
	
	var doconnect = function(cb) {
		console.log(task);
		console.log(person_task);
		oracledb.getConnection(dbConfig, cb);
		};

	var dorelease = function(conn) {
		  conn.close(function (err) {
		    if (err){
		      console.error(err.message);
		    }
		  });
		};


	var doupdateTask = function(conn, cb) {
		  var sql = "UPDATE Task  SET task_name = :b  WHERE task_uuid = :a";

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
		
		var doupdatePersonTask = function(conn, cb) {
			  var sql = "UPDATE Person_Task  SET task_status = :c  WHERE task_uuid = :b and person_uuid = :a";

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
		    doupdateTask,
		    doupdatePersonTask
		  ],
		  function (err, conn) {
		    if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
		    if (conn) { dorelease(conn);}
		  });
});

module.exports = router;

