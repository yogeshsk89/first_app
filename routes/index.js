var express = require('express');
var random = require('random-number');
var dateTime = require('node-datetime');
var db_conection = require('./connection.js');
var router = express.Router();

var gen = random.generator({
	min:  0,
	max:  1000,
	integer: true
});

/* GET home page. */
router.get('/', function(req, res, next) {

	// console.log(req.session);
	if(req.session.user_id)
	{
		res.redirect('/profile');
	}
	else
	{
		res.render('index', { title: 'Login', success: req.session.success, errors: req.session.errors});
		delete req.session.errors;
	}	
});

router.post('/login_action', function(req, res, next){

	req.checkBody('email_id', 'Email id is required').notEmpty();
	req.checkBody('email_id', 'A valid email is required').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){

		req.session.errors = errors;
      	req.session.success = false;
      	res.redirect('/');
	} else {
		db_conection.select('users', 'id, CONCAT(fname, " ", lname) as fullname', '`email_id`="'+req.body.email_id+'" AND `password`="'+req.body.password+'"', function(err, data){

			if(err){
				console.log(err);
			} else {
				
				if(data.length > 0){

					req.session.user_id = data[0]['id'];
					req.session.username = data[0]['fullname'];
					res.redirect('/profile');
				} else {
					res.redirect('/');
				}
			}
		});
	}
});

router.get('/register', function(req, res, next) {

	if(req.session.user_id)
	{
		res.redirect('/profile');
	}
	else
	{
		res.render('register_form', { title: 'User Register', success: req.session.success, errors: req.session.errors});
		delete req.session.errors;
	}
});

router.post('/register_action', function(req, res, next){

	req.checkBody('fname', 'first name is required').notEmpty();
	req.checkBody('lname', 'Last name is required').notEmpty();
	req.checkBody('email_id', 'Email id is required').notEmpty();
	req.checkBody('email_id', 'A valid email is required').isEmail();
	req.checkBody('mobile_no', 'Mobile No is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

	var file_name = req.files.filetoupload;

	var errors = req.validationErrors();
	
	if(errors){

		req.session.errors = errors;
      	req.session.success = false;
      	res.redirect('/register');

	} else {

		db_conection.insert('users', ['fname','lname','email_id','mobile_no','password'], [req.body.fname, req.body.lname, req.body.email_id, req.body.mobile_no, req.body.password], function(err, data){

			if(err){
				console.log(err);
			} else {

				var last_user_id = data.insertId;

				file_name.mv("public/uploads/"+ file_name.name, function(err){

					if(err){
						console.log(err);
					} else {
						
						db_conection.update('users', ['profile_pic'], [file_name.name], 'id='+last_user_id, function(err2, data2){

							if(err) {
								console.log(err2);
							} else {
								console.log(data2);
							}
						});
					}
				})

				res.redirect('/');
			}
		});
	}
});

router.get('/profile', function(req, res, next) {
	// console.log(req.session);
	if(req.session.user_id)
	{
		db_conection.select('users', 'id, fname, lname, email_id, mobile_no, profile_pic, password', 'id='+req.session.user_id, function(err, data){

			if(err){
				console.log(err)
			} else {
				res.render('my_profile', { title: 'My Profile', user_id : req.session.user_id, username: req.session.username, fname:data[0]['fname'], lname:data[0]['lname'], email_id:data[0]['email_id'], mobile_no:data[0]['mobile_no'], profile_pic:data[0]['profile_pic'], password:data[0]['password'], success: req.session.success, errors: req.session.errors});
				delete req.session.errors;
			}
		})	
	}
	else
	{
		res.redirect('/');
	}
});

router.post('/update_profile_action', function(req, res, next){

	//generate random number and datetime stamp for image name
	var random_number = gen();
	var dt = dateTime.create();
	var formatted = dt.format('Y-m-d-H:M:S');

	//set validation rules
	req.checkBody('fname', 'first name is required').notEmpty();
	req.checkBody('lname', 'Last name is required').notEmpty();
	req.checkBody('email_id', 'Email id is required').notEmpty();
	req.checkBody('email_id', 'A valid email is required').isEmail();
	req.checkBody('mobile_no', 'Mobile No is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors()

	if(errors){

		req.session.errors = errors;
      	req.session.success = false;
      	res.redirect('/profile');

	} else {

		if(req.body.user_id) {
			var profile_pic_name ;

			if(req.files.filetoupload){

				var file_name = req.files.filetoupload;
				profile_pic_name = formatted+'-'+random_number+'.jpg';
				// var previos_name_array = file_name.name.split('.');

				file_name.mv("public/uploads/"+ profile_pic_name, function(err){
					
					if(err){
						console.log(err);
						profile_pic_name = '';
					}
				});

			} else {

				if(req.body.previous_image){
					profile_pic_name = req.body.previous_image;
				} else {
					profile_pic_name = '';
				}
			}

			db_conection.update('users', ['fname','lname','email_id','mobile_no','password', 'profile_pic'], [req.body.fname, req.body.lname, req.body.email_id, req.body.mobile_no, req.body.password, profile_pic_name], 'id='+req.body.user_id, function(err, data){

				if(err){
					console.log(err);
				} else {
					res.redirect('/profile');
				}
			});

		} else {
			redirect('/profile');
		}
	}
});

router.get('/logout', function(req, res){

	req.session.destroy(function(err) {
		res.redirect('/');
	})
});

module.exports = router;
