var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var express= require('express')
const bodyParser = require('body-parser');
const uuid = require('uuid'); 
var cors = require('cors');
var schedule = require('node-schedule');
var moment = require('moment');
const Nexmo = require('nexmo');
const config = require('./config');


const nexmo = new Nexmo({ apiKey: config.nexmoapiKey,apiSecret: config.nexmoapiSecret });
const from = 'Vonage SMS API';

var app = express();
app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


/** 
function createEntry(userinfo){
    userinfo['dayTrack'] = 0;
    userinfo['SOSno'] = "ContactNo";
    userinfo['hourSlot1'] = "";
    userinfo['hourSlot2'] = "";
    userinfo['hourSlot3'] = "";
    userinfo['UID'] = uuid.v1();
    userinfo['alert'] = false;

    MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
    var db = client.db('tenty');
    db.collection('usermaster').insertOne(userinfo, function (err, result) {

      console.log("Inserted a document into the families collection.");
      console.log(result);
      return true
    });
  });
}
*/


app
  .route('/delivery')
  .get(handleInboundSms)
  .post(handleInboundSms);
 


  function handleInboundSms(request, response) {
    const params = Object.assign(request.query, request.body)
    let msg = "FST-A";
    MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
      var db = client.db("tenty");  
      db.collection('usermaster').update({"UID":"54373370-8c44-11ea-be66-4d23daf64644"},{$set:{"hourSlot1":moment()}},function(err,result){
        //send sms to SOS as missed response for slot 1
      });
  });
    response.status(204).send();
  }

function sendSMS(contactNo,text){
  nexmo.message.sendSms(from,contactNo,text);
}

function incByOne(UID){
  MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
    var db = client.db('tenty');  
  db.collection('usermaster').update({"UID":UID},{$inc:{dayTrack:1}},function(err,result){
      console.log("Incremented by 1 ");
    });
  });
}

function startTracking(userinfo){
  console.log("started Tracking ");
  let startTime = new Date(moment());
  let endTime = new Date(moment().add(14,'days'));
  let rule = new schedule.RecurrenceRule();
  rule.hour = moment().hour();
  var eachDayTrackingJob = schedule.scheduleJob({ start: startTime, end: endTime, rule: rule }, function(){
    let hourSlot1 = [8,9,10,11],hourSlot2 = [12,13,14,15],hourSlot3 = [16,17,18,19];
        
    // query to increament day counter in db  by 1 - done  
            incByOne(userinfo.UID);

            MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
              var db = client.db("tenty");  
                db.collection("usermaster").find({"UID":userinfo.UID}).toArray(function(err,res){
                    userinfo = res[0];
                    if(userinfo.dayTrack == 14){
                      eachDayTrackingJob.cancel();
                    }
                });
            });



        let rule1 = new schedule.RecurrenceRule();
        let pickedHour1 = hourSlot1[Math.floor(Math.random()*10%4)]; 
        rule1.hour = pickedHour1;
        var trackjob1 = schedule.scheduleJob(rule1, function(){
          // Logic to send sms 
          let msg = "Hey, " + userinfo.firstName + "for tracking day no. " + userinfo.dayTrack +',reply within hour to message with code for symptoms - FST-A:Fever,FST-B:cough,FST-C:Tiredness,'
          sendSMS(userinfo.contactNo,msg);

          let checkRule = new schedule.RecurrenceRule();
          checkRule.hour = pickedHour1 + 1;
          var checkJob = schedule.scheduleJob(checkRule, function(){
              //check if alert recived for user,
              MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
                var db = client.db("tenty");  
                  db.collection("usermaster").find({"UID":userinfo.UID}).toArray(function(err,res){
                      if(res[0].hourSlot1 == ""){
                        db.collection('usermaster').update({"UID":userinfo.UID},{$set:{alert:true}},function(err,result){
                          //send sms to SOS as missed response for slot 1
                          // sendSMS(userinfo.SOSno,'Alert !, missing responsefor slot 1 from suspect'+userinfo.firstName);
                        });
                      }
                  });
              });
          });

        });

        let rule2 = new schedule.RecurrenceRule();
        let pickedHour2 = hourSlot2[Math.floor(Math.random()*10%4)]; 
        rule2.hour = pickedHour2;
        var trackjob2 = schedule.scheduleJob(rule2, function(){
          
          // Logic to send sms 
          let msg = "Hey, " + userinfo.firstName + "for tracking day no. " + userinfo.dayTrack +',reply within hour to message with code for symptoms - FST-A:Fever,FST-B:cough,FST-C:Tiredness,'
          sendSMS(userinfo.contactNo,msg);

          let checkRule = new schedule.RecurrenceRule();
          checkRule.hour = pickedHour2 + 1;
          var checkJob = schedule.scheduleJob(checkRule, function(){
              //check if alert recived for user,
              MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
                var db = client.db("tenty");  
                  db.collection("usermaster").find({"UID":userinfo.UID}).toArray(function(err,res){
                      if(res[0].hourSlot1 == ""){
                        db.collection('usermaster').update({"UID":userinfo.UID},{$set:{alert:true}},function(err,result){
                          //send sms to SOS as missed response for slot 1
                        // sendSMS(userinfo.SOSno,'Alert !, missing responsefor slot 2 from suspect'+userinfo.firstName);

                        });
                      }
                  });
              });
          });
        });

        /**
        let rule3 = new schedule.RecurrenceRule();
        rule3.hour = hourSlot3[Math.floor(Math.random()*10%4)];
        var trackjob3 = schedule.scheduleJob(rule3, function(){
          // Logic to send sms
          // alert if no response recived for an hour
        });
 */

  });						 
}

app.get('/test',function(req,res){
  res.send('<h1>Working !</h1>');
});


app.get('/get-suspects',function(req,res){
  MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
    var db = client.db('tenty');  
  db.collection('usermaster').find().toArray(function(err,cols){
      res.send({"status":200,"data":cols});
    });
  });
});

app.post('/start-tracking',function(req,res){
  

req.body['dayTrack'] = 0;
req.body['SOSno'] = "ContactNo";
req.body['hourSlot1'] = "";
req.body['hourSlot2'] = "";
req.body['hourSlot3'] = "";
req.body['UID'] = uuid.v1();
req.body['startedTrackingAt'] = moment();
req.body['alert'] = false;
    
    MongoClient.connect("mongodb+srv://" + config.mongouser + ":" + config.mongopwd + "@firstcluster-gw5fe.mongodb.net/test?retryWrites=true&w=majority", function (err, client) {
    var db = client.db('tenty');
    db.collection('usermaster').insertOne(req.body, function (err, result) {

      // console.log("Inserted a document");
      // console.log(result);
      startTracking(req.body);

      nexmo.message.sendSms(from, req.body.contactNo,'Welcolme to tenty ! I am your companion to fight against COVID-19');
                                                                                                            
      res.send({statusCode:200,msg:"SUCCESS !"})
    });
  });

});


app.listen(3000, function() {
  console.log('listening on port 3000');
});
 