var mysql = require('mysql');

var db_connet = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '',
	database : 'first_app'
});

var select = function(tablname, columns, condition, callback){

	var query = 'SELECT '+columns+' FROM '+tablname+' WHERE '+condition;
	// console.log(query);
	db_connet.query(query, function(err, data){

		if(err){
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

var insert = function(tablname, columns, values, callback){

	var columns_str = values_str = '(';

	columns.forEach(function(currentValue, index, arr){
		columns_str += '`'+currentValue+'`,';
	    values_str += '"'+values[index]+'",';
	});

	columns_str = columns_str.replace(/,\s*$/, "");
	values_str = values_str.replace(/,\s*$/, "");

	columns_str += ')';
	values_str += ')';

	var query = 'INSERT INTO '+tablname+' '+columns_str+' VALUES '+values_str;
	// console.log(query);
	db_connet.query(query, function(err, data){

		if(err){
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

var update = function(tablname, columns, values, condition, callback){

	var update_str = '';

	columns.forEach(function(currentValue, index, arr){
		update_str += '`'+currentValue+'`="'+values[index]+'",';
	});

	update_str = update_str.replace(/,\s*$/, "");

	var query = 'UPDATE '+tablname+' SET '+update_str+' WHERE '+condition;
	console.log(query);
	db_connet.query(query, function(err, data){

		if(err){
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
};

module.exports = {
	select : select,
	insert : insert,
	update : update,
	db_connection : db_connet
};