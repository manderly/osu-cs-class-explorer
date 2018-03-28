/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 */

'use strict';

import {summaries} from '../../static/descriptions';
const underscore = require('underscore');
var moment = require('moment');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('promise-async');

/* Uncomment fs for file-writing capabilities. This code can be used to export a json file of the
   spreadsheet data. */
//var fs = require('fs');

//import {buildCourseData} from '../../app';

let courseData;

/*  Use the buildCourseData method to open Google spreadsheet, parse
    the data into an organized json format, and then keep it on the server
    so multiple users can view it.

    The course data is refreshed every 12 hours, or whenever the server is reset.
*/

//initial data build
setTimeout(buildData, 5 * 1000);
//and then rebuild every 12 hours
setInterval(buildData, 43200 * 1000);

/*
For development purposes, I have my own local copy of the OSU spreadsheet:

My own spreadsheetId: '1pdnIGycCQ5UZGIDNQBQd5hj2qVooxkbhZxbIx7Sn1nc'
OSU subreddit spreadsheetId: '1MFBGJbOXVjtThgj5b6K0rv9xdsC1M2GQ0pJVB-8YCeU'
*/
var doc = new GoogleSpreadsheet('1MFBGJbOXVjtThgj5b6K0rv9xdsC1M2GQ0pJVB-8YCeU');
var sheet;

let courses = {};
let courseNames = [];
let reviewCount = 0;

/* Refactored on 3/26/2018 to fix the "missing reviews when multiple
  reviews are on the same line" bug.
  This method takes the entire row and handles cases where second and
  third reviews exist on the same line of the spreadsheet.
  Pass it the row and the "postfix" (empty string, '_2', or '_3') */
function processReview(row, postfix) {
  let key;
  let whatCourseDidYouTake = `whatcoursedidyoutake${postfix}`;
  let whatTipsWouldYouGive = `whattipswouldyougivestudentstakingthiscourse${postfix}`;
  let howHardWasThisClass = `howhardwasthisclass${postfix}`;
  let howMuchTime = `howmuchtimedidyouspendonaverageperweekforthisclass${postfix}`;

  //use the course name as a key, like "CS162"
  key = row[whatCourseDidYouTake].substring(0, 6).split(' ')
    .join('');

  //handle the 419 to 467 course number change
  if (key == 'CS419') {
    key = 'CS467';
  }

  //ecmascript 6 destructuring protects against empty data coming back
  const summary = summaries[key] || {};
  const {description = '', proctoredTests = '', book = '', bookLink = '', prereqs = '', groupWork = ''} = summary;

  //if this class isn't in the data object yet, add it
  if (!courses[key]) {
    let courseName = row[whatCourseDidYouTake];

    //handle the 419 to 467 change of number and name
    if (courseName == 'CS 419 - Software Projects') {
      courseName = 'CS 467 - Online Capstone Project';
    }

    //push courseName into courseNames array
    courseNames.push(courseName);

    //make an empty object for this key
    courses[key] = {
      fullName: courseName,
      shortName: key,
      tips: [],
      difficulty: [0, 0, 0, 0, 0],
      timeSpent: [0, 0, 0, 0],
      pairings: {},
      commonPairingsNames: [],
      commonPairingsCounts: [],
      description,
      proctoredTests,
      book,
      bookLink,
      prereqs,
      groupWork
    };
  }

  /* Make a new tip object and get the timestamp so we can display the tip's age */
  let tip = {};
  if (row[whatTipsWouldYouGive]) {
    //push the tip and the date of that tip
    //let rawTimestamp = getJsDateFromExcel(row['timestamp']);
    let rawTimestamp = row.timestamp;
    tip = {
      tip: row[whatTipsWouldYouGive],
      timestamp: moment(rawTimestamp, 'MM/DD/YYYY HH:mm:ss').format('MMMM YYYY')
    };
    courses[key].tips.unshift(tip);
    reviewCount++;
  }

  /* Build the difficulty array, which has 5 elements: [0, 0, 0, 0, 0]
  Difficulty score from user can be 1, 2, 3, 4, or 5
  Conveniently, if we find, say, a score of 2, we can -1 from that 2 to figure out which index to increase by 1
  */
  let courseDifficulty = row[howHardWasThisClass];
  courses[key].difficulty[courseDifficulty - 1] = courses[key].difficulty[courseDifficulty - 1] + 1;

  /* Build the timeSpent array, which has 4 elements: [1, 2, 3, 4]
  look at the the timeSpent string ("0-5 hours", "6-12 hours", "13-18 hours", "18+ hours")
  and increase the matching index.
  */
  let courseTimeSpent = row[howMuchTime];
  if (courseTimeSpent === '0-5 hours') {
    courses[key].timeSpent[0] = courses[key].timeSpent[0] + 1;
  } else if (courseTimeSpent === '6-12 hours') {
    courses[key].timeSpent[1] = courses[key].timeSpent[1] + 1;
  } else if (courseTimeSpent === '13-18 hours') {
    courses[key].timeSpent[2] = courses[key].timeSpent[2] + 1;
  } else if (courseTimeSpent === '18+ hours') {
    courses[key].timeSpent[3] = courses[key].timeSpent[3] + 1;
  }

  /* Update the course pairings object

  How this works:

  Each course checks its neighbors and increments their counts in its own pairings object if it finds them.
  '' checks _2 and _3
  _2 checks '' and _3
  _3 checks '' and _2
  Since we need the pairing data to be present on all members of a possible pair (or triplet)

  The pairings object looks like this inside a course's data:
  CS161: {
    pairings: {
      225: 3,
      999: 1
    }
  }

  Later, we pick out the most frequent pairings and display those to the user.
*/

  let companion1 = '';
  let companion2 = '';
  let companion3 = '';

  if (postfix == '') {
    //on the first course, so check #2 and #2
    if (row.didyoutakeasecondcoursethisquarter == 'Yes') {
      companion2 = row.whatcoursedidyoutake_2.substring(0, 6).split(' ').join('');

      if (!courses[key].pairings[companion2]) {
        courses[key].pairings[companion2] = 1; //init
      } else {
        courses[key].pairings[companion2] += 1; //increment
      }
    }

    if (row.didyoutakeathirdcoursethisquarter == 'Yes') {
      companion3 = row.whatcoursedidyoutake_3.substring(0, 6).split(' ').join('');

      if (!courses[key].pairings[companion3]) {
        courses[key].pairings[companion3] == 1;
      } else {
        courses[key].pairings[companion3] += 1;
      }
    }
  } else if (postfix == '_2') {
      //grab #1 and check if #3 exists
      companion1 = row.whatcoursedidyoutake.substring(0, 6).split(' ').join('');

      if (!courses[key].pairings[companion1]) {
        courses[key].pairings[companion1] = 1;
      } else {
        courses[key].pairings[companion1] += 1;
      }

      if (row.didyoutakeathirdcoursethisquarter == 'Yes') {
        companion3 = row.whatcoursedidyoutake_3.substring(0, 6).split(' ').join('');

        if (!courses[key].pairings[companion3]) {
          courses[key].pairings[companion3] = 1;
        } else {
          courses[key].pairings[companion3] += 1;
        }
      }
  } else if (postfix == '_3') {
      //grab #1 and #2
      companion1 = row.whatcoursedidyoutake.substring(0, 6).split(' ').join('');
      if (!courses[key].pairings[companion1]) {
        courses[key].pairings[companion1] = 1;
      } else {
        courses[key].pairings[companion1] += 1;
      }

      companion2 = row.whatcoursedidyoutake_2.substring(0, 6).split(' ').join('');
      if (!courses[key].pairings[companion2]) {
        courses[key].pairings[companion2] = 1;
      } else {
        courses[key].pairings[companion2] += 1;
      }
  }
}

/* The pairing data must be done once every single row has been processed individually.
    For each course in courses, find its most commonly paired-with classes. Take the top 4
    (or however many are available if less than 4) and put them into arrays on the course object
    for use by the front-end bar chart.
*/
function processPairingData() {
  //Each course has a pairings object to process
  for (var key in courses) {
    /* This step builds the arrays that are used on the front-end to display the pairings data.
        The arrays must be structured like this:
        commonPairingsNames: ['','',''],
        commonPairingsCounts: [0,0,0]

        1. Sort the courses into an array of pairs, sorted in descending order (highest first).
        2. Grab the first 4 elements and split them off into the two separate arrays read by the chart.
    */

    let sorted = [];
    for (var companion in courses[key].pairings) {
      sorted.push([companion, courses[key].pairings[companion]]);
    }

    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });

    //bar chart just displays the top 4, so just grab those
    //(if there are that many, otherwise use as many as there are)
    let barsToShow = 4;
    if (sorted.length < barsToShow) {
      barsToShow = sorted.length;
    }

    for (var i = 0; i < barsToShow; i++) {
      console.log("Pushing " + sorted[i][0] + " into " + courses[key].commonPairingsNames);
      courses[key].commonPairingsNames.push(sorted[i][0]);
      courses[key].commonPairingsCounts.push(sorted[i][1]);
    }

  }
}

/* Open the spreadsheet and extract its data */
function buildCourseData() {
  let json;
  async.series([
    function setAuth(step) {
      /* eslint-disable camelcase, max-len */
      var credsJson = {
        client_email: 'osu-class-explorer@api-project-700272715173.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD6+utHi5OD99dB\nInomCT/EmxBU4WEAcqoDB9mO1YzikejZF7P4Y63FnavXHfNWlCBkmCLM/yGXoWD+\nEwRB2n2bPztF6I193xIAGn80BVAYB+1PEDjkQkYP8WP+Vob5j/yAOhOJI47WTn/J\nhtUXI6TcDrGfUKWN73rL8ZYp6ZAWnykMSeNQ/6GI+pqaJ6zA35syLMzF1PtwMEu6\neGZDvU/OHrUQ++6sAQ8H4uDOoFa5Ex9B+iO6A4iXvm0EjZDQ3NXgoDAzYH1k91kk\nI6yYT7YPwWwl6pf14GYgat4LegXRb/wkqeyssP9nKb3MVLCJvpO9jqeZ6lAC/6vX\nUluiDtJxAgMBAAECggEADkQ1O7RUmMC9w9RDMd5umVUYZ//F9xvde8W+ZVjwnMgv\nHoiDNJpLbF9Yn1YysOwjfX5bo5AY22z7JcQkVr82Cr0s2A3mnZYgmICJFKac6XnJ\nYLg3CKwW/hTiUoi9/EmF0I7kkYQDvH06tLSZMCsYteDQslH38C4Ryo4fc19VP0DU\n58Z9JKHRwEo75F+oKA+kdk8VHfsDH5BtzDfXCuRR48N+Xc1TJDqZtbe2YCK2Ur5y\n+zxz7xE5UDHMlnKQgGj+T/22XcKNRe0WnHPCyET204RaZEIZT4CHY5ZJVdZ+vAHy\naovS9OximV1HpogP11PBkGrsuG+QVcfBXDJpS4E2gQKBgQD/VbwdyQDPIVxI/7S6\nwmbnWU9dGJScm6uIK872EDGHvMQFzpHPQkTN5sb8S1UaoBWB7kj1fJ/XW/usG0lC\nNg5DqIIuUXKY0TPW89jMu3cvDYNfPzv/wy4hBL61i6c4Ed5o9pm5/trOpirZCNfL\n7a1ZgGuK9WlYh7JfH/ioAnWrgQKBgQD7okfFCIYsEBASF0YZh/qyKIQSefuAo5QV\nuOfyNeIiKU1g51cNgPRSC/Yyt46rDUbe619b4GA8CM1Y0tHQ5L2KEG4kwmWq/fy0\nvdqdRZY4RD9jWtxftm3Q6dJqDq46MOzrseJhG4gh9BwIpMXk8HtjhLjCd4zxolHQ\nBkKH789e8QKBgQDFXp1qHKy+b5gpaVdnocvveu7JFK4TnJVsTgjN1dijhvuzTWkS\nX7RVwNUBwq2HRkU5yVqmP+5Ch3y0Hed0Adrm28O9UAIYNGYw+w8Turk3Kufo4TVc\nz5/BsCxGoyvgQJe+ZRiRWHoEkRe/6oD8xr1f2M/Ie0kyQLpVo54PKM+SgQKBgGog\nLxSyW6QJwj1fA3mRF/I7lDgWqjO+yZ2/tlM41n6B3NiZuOVBFcnksZkCQXFy0AkE\nS9t77hpju/dSMptfXXD1LP7j3e0X4ZR43dKmnoxsfC9zCq5zSi1p8Aw61NBGAiYF\nh+xcqDVptskOdUfxBJkcSK/7q73dL5QEj9q1EUiBAoGAbNdJkhFI38ubgTka7Pwx\naGq7i2SBFXoqXuyCawoyGr95fI68SYSKUO8D3fCmi5KqzhyeOG+Y0uDtXITYS02u\n9bjreiKHBqELfCOGGHpJch54QhcZYmNAt4f96DmwCiVo8r74ktE6obhBlPi6AGfW\nhRYpRSVAVIgK/3tXAIub6hw=\n-----END PRIVATE KEY-----\n'
      };
      /* eslint-enable camelcase, max-len */
      doc.useServiceAccountAuth(credsJson, step);
    },

    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        //console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        //console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
        step();
      });
    },

    function processAllRows(step) {
      sheet.getRows({
        offset: 1,
        limit: 9999,
        orderby: 'col1'
      }, function(err, rows) {
        //now process each row into something we can use
        //console.log('Read ' + rows.length + ' rows');
        underscore.each(rows, row => {
          processReview(row, '');
          if (row.didyoutakeasecondcoursethisquarter == 'Yes') {
            processReview(row, '_2');
          }
          if (row.didyoutakeathirdcoursethisquarter == 'Yes') {
            processReview(row, '_3');
          }
        });

        processPairingData();

        var lastBuiltTimestamp = moment();

        let appData = {
          courses,
          courseNames,
          reviewCount,
          lastBuilt: lastBuiltTimestamp
        };

        //stringify and write to file
        json = JSON.stringify(appData);
        //Alternative implementation: coursedata.json is written to a local file and re-used
        //fs.writeFile('coursedata.json', json, 'utf8', dataDoneCallback);
        step();
      });
    }
  ],
  function() {
    courseData = JSON.parse(json);
  });
}

//credit: https://gist.github.com/christopherscott/2782634
function getJsDateFromExcel(excelDate) {
  // JavaScript dates can be constructed by passing milliseconds
  // since the Unix epoch (January 1, 1970) example: new Date(12312512312);
  // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
  // 2. Convert to milliseconds.
  return new Date((excelDate - (25567 + 1)) * 86400 * 1000);
}

/* Set courseData to the result of running buildCourseData */
function buildData() {
  buildCourseData();
}

export function index(req, res) {
  return res.status(200).json({courseData});
}
