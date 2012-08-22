var express = require('express');
var i18n = require('connect-i18n');
var ejs = require('ejs');
var Localize = require('localize');
var dateFormat = require('dateformat');

var app = express.createServer();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(i18n());
	app.use(function (req, res, next) {
	  if (['en-us', 'zh-cn'].indexOf(req.locales[0]) === -1) {
	    req.locales[0] = 'en-us';
	  }
	  next();
	});
});

// static application data
var schedule =require('./schedule.js').talks;
var sponsors =require('./sponsors.js').sponsors;

schedule.sort(function(a, b) {
    return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0);
});

function filterSchedule(schedule, dateString) {
	var results = [];
	for (var key in schedule) {
    var talk = schedule[key]; 

    if (dateFormat(talk.date, "UTC:mm/dd") == dateFormat(new Date(dateString), "UTC:mm/dd")) {
	    talk.start_time = dateFormat(talk.date, "UTC:hh:MM"); 
  	  talk.end_time = dateFormat(new Date(talk.date.getTime() + (talk.duration * 60000)), "UTC:hh:MM");

    	results.push(talk);
    }
  }
  return results;
}

app.get("/", function(req, res) {
  res.render('index', {
    viewname: 'index',
    schedule: schedule,
    sponsors: sponsors,
    locale: req.locales[0],
    dateFormat: dateFormat,
    filterSchedule: filterSchedule
  });
});

app.get("/schedule/:item", function(req, res) {
	var item = req.params.item;
	
	var wanted_talk = null;

	for(var key in schedule) {
		var talk = schedule[key];

		if(talk.speaker && talk.speaker.twitter == item){
				wanted_talk = schedule[key];
			}
	}

	if(!wanted_talk) {
		res.redirect('/');
	}
	else {
		res.render('single', {
	    viewname: 'single',
	    item: wanted_talk
	   });
	}
});

app.listen(process.env.VCAP_APP_PORT || process.argv[2] || process.env.PORT || 3000);