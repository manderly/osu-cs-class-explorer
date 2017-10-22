/**
 * Main application file
 */

'use strict';

import express from 'express';
import sqldb from './sqldb';
import config from './config/environment';
import http from 'http';
import seedDatabaseIfNeeded from './config/seed';

// Setup server
var app = express();
var server = http.createServer(app);
var fs = require('fs');
var moment = require('moment');
const underscore = require('underscore');
var gsjson = require('google-spreadsheet-to-json');

require('./config/express').default(app);
require('./routes').default(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    buildCourseData();
    //every 2 minutes - for testing purposes for now
    setInterval(buildCourseData, 120*1000);
  });
}

sqldb.sequelize.sync()
  .then(seedDatabaseIfNeeded)
  .then(startServer)
  .catch(function(err) {
    console.log('Server failed to start due to error: %s', err);
  });

var creds_json = {
  client_email: 'osu-class-explorer@api-project-700272715173.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD6+utHi5OD99dB\nInomCT/EmxBU4WEAcqoDB9mO1YzikejZF7P4Y63FnavXHfNWlCBkmCLM/yGXoWD+\nEwRB2n2bPztF6I193xIAGn80BVAYB+1PEDjkQkYP8WP+Vob5j/yAOhOJI47WTn/J\nhtUXI6TcDrGfUKWN73rL8ZYp6ZAWnykMSeNQ/6GI+pqaJ6zA35syLMzF1PtwMEu6\neGZDvU/OHrUQ++6sAQ8H4uDOoFa5Ex9B+iO6A4iXvm0EjZDQ3NXgoDAzYH1k91kk\nI6yYT7YPwWwl6pf14GYgat4LegXRb/wkqeyssP9nKb3MVLCJvpO9jqeZ6lAC/6vX\nUluiDtJxAgMBAAECggEADkQ1O7RUmMC9w9RDMd5umVUYZ//F9xvde8W+ZVjwnMgv\nHoiDNJpLbF9Yn1YysOwjfX5bo5AY22z7JcQkVr82Cr0s2A3mnZYgmICJFKac6XnJ\nYLg3CKwW/hTiUoi9/EmF0I7kkYQDvH06tLSZMCsYteDQslH38C4Ryo4fc19VP0DU\n58Z9JKHRwEo75F+oKA+kdk8VHfsDH5BtzDfXCuRR48N+Xc1TJDqZtbe2YCK2Ur5y\n+zxz7xE5UDHMlnKQgGj+T/22XcKNRe0WnHPCyET204RaZEIZT4CHY5ZJVdZ+vAHy\naovS9OximV1HpogP11PBkGrsuG+QVcfBXDJpS4E2gQKBgQD/VbwdyQDPIVxI/7S6\nwmbnWU9dGJScm6uIK872EDGHvMQFzpHPQkTN5sb8S1UaoBWB7kj1fJ/XW/usG0lC\nNg5DqIIuUXKY0TPW89jMu3cvDYNfPzv/wy4hBL61i6c4Ed5o9pm5/trOpirZCNfL\n7a1ZgGuK9WlYh7JfH/ioAnWrgQKBgQD7okfFCIYsEBASF0YZh/qyKIQSefuAo5QV\nuOfyNeIiKU1g51cNgPRSC/Yyt46rDUbe619b4GA8CM1Y0tHQ5L2KEG4kwmWq/fy0\nvdqdRZY4RD9jWtxftm3Q6dJqDq46MOzrseJhG4gh9BwIpMXk8HtjhLjCd4zxolHQ\nBkKH789e8QKBgQDFXp1qHKy+b5gpaVdnocvveu7JFK4TnJVsTgjN1dijhvuzTWkS\nX7RVwNUBwq2HRkU5yVqmP+5Ch3y0Hed0Adrm28O9UAIYNGYw+w8Turk3Kufo4TVc\nz5/BsCxGoyvgQJe+ZRiRWHoEkRe/6oD8xr1f2M/Ie0kyQLpVo54PKM+SgQKBgGog\nLxSyW6QJwj1fA3mRF/I7lDgWqjO+yZ2/tlM41n6B3NiZuOVBFcnksZkCQXFy0AkE\nS9t77hpju/dSMptfXXD1LP7j3e0X4ZR43dKmnoxsfC9zCq5zSi1p8Aw61NBGAiYF\nh+xcqDVptskOdUfxBJkcSK/7q73dL5QEj9q1EUiBAoGAbNdJkhFI38ubgTka7Pwx\naGq7i2SBFXoqXuyCawoyGr95fI68SYSKUO8D3fCmi5KqzhyeOG+Y0uDtXITYS02u\n9bjreiKHBqELfCOGGHpJch54QhcZYmNAt4f96DmwCiVo8r74ktE6obhBlPi6AGfW\nhRYpRSVAVIgK/3tXAIub6hw=\n-----END PRIVATE KEY-----\n'
};

//this spreadsheet is my own copy, but ideally this code will
//use the osu subreddit spreadsheet that is not owned by me
//my own spreadsheetId: '1pdnIGycCQ5UZGIDNQBQd5hj2qVooxkbhZxbIx7Sn1nc',

function dataDoneCallback() {
  console.log("done writing json data at " + moment().format('LLLL'));
}

// Gets the entire spreadsheet as a giant json object
function buildCourseData() {
  console.log("building course data...");
  gsjson({
     spreadsheetId: '1MFBGJbOXVjtThgj5b6K0rv9xdsC1M2GQ0pJVB-8YCeU',
     credentials: creds_json
   })
   .then((rawData) => {
     let key;
     let courses = {};
     let courseNames = [];
     let reviewCount = 0;
     //response is an array of 330+ objects, not sorted
     underscore.each(rawData, ((course) => {
       //use the course name as a key, like "CS162"
       key = course['whatCourseDidYouTake?'].substring(0, 6).split(' ').join('');

       //if this class isn't in the data object yet, add it
       if (!courses[key]) {
         courseNames.push(course['whatCourseDidYouTake?']);
         //make an empty object for this key
         courses[key] = {
           'fullName': course['whatCourseDidYouTake?'],
           'tips': [],
           'difficulty': [0, 0, 0, 0, 0],
           'timeSpent': [0, 0, 0, 0]
         };
       }

       //then push the data in
       let tip = {};
       if (course['whatTipsWouldYouGiveStudentsTakingThisCourse?']) {
         //push the tip and the date of that tip
         let rawTimestamp = getJsDateFromExcel(course['timestamp']);
         tip = {
           tip: course['whatTipsWouldYouGiveStudentsTakingThisCourse?'],
           timestamp: moment(rawTimestamp).format('MMMM YYYY')
         };
         courses[key].tips.unshift(tip);
         reviewCount++;
       }

       //build the difficulty array, which has 5 elements: [0, 0, 0, 0, 0]
       //Difficulty score from user can be 1, 2, 3, 4, or 5
       //Conveniently, if we find, say, a score of 2, we can -1 from that 2 to figure out which index to increase by 1
       let courseDifficulty = course['howHardWasThisClass?'];
       courses[key].difficulty[courseDifficulty - 1] = courses[key].difficulty[courseDifficulty - 1] + 1;

       //build the timeSpent array, which has 4 elements: [1, 2, 3, 4]
       //look at the the timeSpent string ("0-5 hours", "6-12 hours", "13-18 hours", "18+ hours")
       let courseTimeSpent = course['howMuchTimeDidYouSpendOnAverage(perWeek)ForThisClass?'];
       if (courseTimeSpent === "0-5 hours") {
         courses[key].timeSpent[0] = courses[key].timeSpent[0] + 1;
       } else if (courseTimeSpent === "6-12 hours") {
         courses[key].timeSpent[1] = courses[key].timeSpent[1] + 1;
       } else if (courseTimeSpent === "13-18 hours") {
         courses[key].timeSpent[2] = courses[key].timeSpent[2] + 1;
       } else if (courseTimeSpent === "18+ hours") {
         courses[key].timeSpent[3] = courses[key].timeSpent[3] + 1;
       }
     }));

     var lastBuiltTimestamp = moment().format('LLLL');

     let appData = {
       courses: courses,
       courseNames: courseNames,
       reviewCount: reviewCount,
       lastBuilt: lastBuiltTimestamp
     };

      //stringify and write to file
      var json = JSON.stringify(appData);
      //fs.writeFile('server/static/coursedata.json', json, 'utf8', dataDoneCallback);
      fs.writeFile('coursedata.json', json, 'utf8', dataDoneCallback);
   })
}


//credit: https://gist.github.com/christopherscott/2782634
function getJsDateFromExcel(excelDate) {

  // JavaScript dates can be constructed by passing milliseconds
  // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

  // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
  // 2. Convert to milliseconds.

  return new Date((excelDate - (25567 + 1))*86400*1000);
}

// Expose app
exports = module.exports = app;
