/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {buildCourseData} from '../../app';

/*  These things run when the server is started.
    Use the buildCourseData method in app.js to open spreadsheet, parse
    the data into an organized json format, and then keep it on the server
    so multiple users can view it.

    The course data is refreshed every 6 hours, or whenever the server is reset.
*/

//initial data build
setTimeout(buildData, 5 * 1000);
//and then rebuild every 12 hours
setInterval(buildData, 43200 * 1000);

let courseData;

function buildData() {
  buildCourseData().then((resp) => {
    courseData = JSON.parse(resp);
  });
}

export function index(req, res) {
  return res.status(200).json({courseData});
}
