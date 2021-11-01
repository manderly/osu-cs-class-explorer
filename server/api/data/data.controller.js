/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 */

'use strict';

import {summaries} from '../../static/descriptions';
const underscore = require('underscore');
var moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');
var async = require('promise-async');

const ignoreArr = process.env.ignoreArr.split(',').map((e) => parseInt(e));

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

const originalSpreadsheetID = '1MFBGJbOXVjtThgj5b6K0rv9xdsC1M2GQ0pJVB-8YCeU';
const newSpreadsheetID = '1ZkqM80Ubcixvs2sH9pp5FtngbcuCjS3H4g2a_65lhng';

/* 8/2021 update: Copy the official spreadsheet into my own, then rewrite header row cells with unique strings so the spreadsheet scraper works. */
var originalDoc = new GoogleSpreadsheet(originalSpreadsheetID);
var newDoc = new GoogleSpreadsheet(newSpreadsheetID);

var credsJson = {
  client_email: process.env.client_email,
  private_key: process.env.private_key,
};

var originalSheet;
var newSheet;

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
  let whatCourseDidYouTake = `course${postfix}`;
  let whatTipsWouldYouGive = `tips${postfix}`;
  let howHardWasThisClass = `difficulty${postfix}`;
  let howMuchTime = `time${postfix}`;

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
    let rawTip = row[whatTipsWouldYouGive];
    tip = {
      tip: rawTip,
      timestamp: moment(rawTimestamp, 'MM/DD/YYYY HH:mm:ss').format('MMMM YYYY')
    };

    if (ignoreArr.includes(row._rowNumber)) {
      // do nothing;
    } else {
      courses[key].tips.unshift(tip);
      reviewCount++;
    }
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

  if (postfix == '1') {
    //on the first course, so check #2 and #2
    if (row.secondBool == 'Yes') {
      companion2 = row.course2.substring(0, 6)
      .split(' ')
      .join('');
      if (!courses[key].pairings[companion2]) {
        courses[key].pairings[companion2] = 1; //init
      } else {
        courses[key].pairings[companion2] += 1; //increment
      }
    }

    if (row.thirdBool == 'Yes') {
      companion3 = row.course3.substring(0, 6)
      .split(' ')
      .join('');

      if (!courses[key].pairings[companion3]) {
        courses[key].pairings[companion3] == 1;
      } else {
        courses[key].pairings[companion3] += 1;
      }
    } else if (postfix == '2') {
      //grab #1 and check if #3 exists
      companion1 = row.course1.substring(0, 6)
      .split(' ')
      .join('');

      if (!courses[key].pairings[companion1]) {
        courses[key].pairings[companion1] = 1;
      } else {
        courses[key].pairings[companion1] += 1;
      }

    if (row.thirdBool == 'Yes') {
        companion3 = row.course3.substring(0, 6)
        .split(' ')
        .join('');

        if (!courses[key].pairings[companion3]) {
          courses[key].pairings[companion3] = 1;
        } else {
          courses[key].pairings[companion3] += 1;
        }
      }
    } else if (postfix == '3') {
      //grab #1 and #2
      companion1 = row.course1.substring(0, 6)
      .split(' ')
      .join('');

      if (!courses[key].pairings[companion1]) {
        courses[key].pairings[companion1] = 1;
      } else {
        courses[key].pairings[companion1] += 1;
      }

      companion2 = row.course2.substring(0, 6)
      .split(' ')
      .join('');
      if (!courses[key].pairings[companion2]) {
        courses[key].pairings[companion2] = 1;
      } else {
        courses[key].pairings[companion2] += 1;
      }
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
      courses[key].commonPairingsNames.push(sorted[i][0]);
      courses[key].commonPairingsCounts.push(sorted[i][1]);
    }
  }
}

/* Open the spreadsheet and extract its data */
function buildCourseData() {
  courses = {};
  courseNames = [];
  reviewCount = 0;
  let json;

  async.series([
    /* Authenticate with original spreadsheet... */ 
    function authOriginalDoc(step) {
      originalDoc.useServiceAccountAuth({
        client_email: credsJson.client_email,
        private_key: credsJson.private_key,
      }).then(() => {
        originalDoc.loadInfo().then(() => {
          step();
        });
      });
    },
    /* ...then authenticate with personal spreadsheet that data gets copied into */
    function authNewDoc(step) {
      newDoc.useServiceAccountAuth({
        client_email: credsJson.client_email,
        private_key: credsJson.private_key,
      }).then(() => {
        newDoc.loadInfo().then(() => {
        step();
      });
    });
  },

  function copySheet(step) {
    // remove old sheet so they don't accumulate
    let deleteSheet = newDoc.sheetsByIndex[1];
    if (deleteSheet) {
      deleteSheet.delete();
    }
    // get the "live" sheet from the originalDoc
    originalSheet = originalDoc.sheetsByIndex[0];
    // copy it into my own doc so I can modify the header cell text
    originalSheet.copyToSpreadsheet(newSpreadsheetID).then(() => {
      newDoc.loadInfo().then(() => {
        newSheet = newDoc.sheetsByIndex[1]; // sheet 0 is the blank default one
        step();
      });
    });
  },

  function updateHeaderCellNames(step) {
    /* August 2021: Header cells with duplicate strings are not supported by GoogleSpreadsheets package,
    so this step renames the header cells with unique strings which are also more convenient for parsing. */
    newSheet.setHeaderRow([
      'timestamp',
      'course1',
      'difficulty1',
      'time1',
      'tips1',
      'when1',
      'secondBool',
      'course2',
      'difficulty2',
      'time2',
      'tips2',
      'thirdBool',
      'course3',
      'difficulty3',
      'time3',
      'tips3',
    ]).then(() => {
      step();
    });
  },

  function processAllRows(step) {
    newSheet.getRows({
      offset: 1,
      limit: 9999,
      orderby: 'col1'
    }).then(rows => {
      //now process each row into something we can use
      //console.log('Read ' + rows.length + ' rows');
      underscore.each(rows, row => {
        processReview(row, '1');
        if (row.secondBool == 'Yes') {
          processReview(row, '2');
        }
        if (row.thirdBool == 'Yes') {
          processReview(row, '3');
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

      console.log('pizza\'s done');
      step();
    });
  }],
  function() {
    courseData = JSON.parse(json);
  });
}

/* Set courseData to the result of running buildCourseData */
function buildData() {
  buildCourseData();
}

export function index(req, res) {
  return res.status(200).json({courseData});
}
