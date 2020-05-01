var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var express= require('express')
const bodyParser = require('body-parser');
const uuid = require('uuid'); 
var cors = require('cors');
var schedule = require('node-schedule');
var moment = require('moment');

const config = require('./config');

var app = express();
app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const twilioClient = require('twilio')(config.twilioSID, config.twilioTOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;



function createEntry(userinfo){
    MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
    var db = client.db('tenty');
    db.collection('usermaster').insertOne(userinfo, function (err, result) {
      assert.equal(err, null);
      console.log("Inserted a document into the families collection.");
      console.log(result);
    });
  });
}


function startTracking(){
  let hr = moment().getHour();
    // to start running at that hour 
    let trackerFormat = hr + ' ' + '* * *';

  var dailyJob = schedule.scheduleJob(trackerFormat, function(){
        // query to increament day counter in db  by 1
        //stop dailyjob if conuter reaches to 

        
  });

  var j = schedule.scheduleJob('3 * * * * *', function(){
    console.log('j ');
    console.log(j);
    console.log('The answer to life, the universe, and everything!');
  
  });
				//set interval for 24 hrs
					// set interval hourly
						
					// trigger push for symptoms check for time in between 8-12
					// trigger push for symptoms check for time in between 1-5
					// trigger push for symptoms check for time in between 6-10
					
				// Track by cnt, break if cnt reaches 14
				// alert if no response recived for an hour			 
}


 startTracking();

function sendTestMessage() {
  console.log("Sending message ");

  twilioClient.messages.create({
    to: "",
    from: "",
    body: "Hi !",
  }).then(function () {
    console.log("Success !")
  }).catch(function (err) {
      console.log("Error :|");
      console.log(err);
  });
}

// sendTestMessage();

app.post('/start-tracking',(req,res)=>{

//1. Entry in a database 
//2. Send welcome notes 
//3. Initiate tracking for 14 days

});

/**
app.listen(3000, function() {
  console.log('Your app is listening on port 3000');
});
 */