import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
var jsonToPivotjson = require("json-to-pivot-json");

export class MainController {

  awesomeThings = [];
  rawCourseDataGroupedByName = {};
  courses = {};

  newThing = '';
  classNames = [];

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
    this.underscore = require('underscore');
  }

  /* Desired data structure:
  courses: {
    CS161: {
      fullName: "CS161 Intro to Computer Science",
      reviews: ["sdasda", "wow such hard", "easy"]
    },
    CS162: {
      ...
    }
   */

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        //todo: refactor boilerplate naming

        //first, group all the data by course name
        this.rawCourseDataGroupedByName = this.underscore.chain(response.data)
          .groupBy('whatCourseDidYouTake?')
          .value();
        console.log("courses grouped by name:", this.rawCourseDataGroupedByName);

        //second, craft the "CS161" name from each course and build objects with "CS161" as key
        //todo: maybe this can be made more efficient
        this.underscore.each(this.rawCourseDataGroupedByName, ((courses) => {
          console.log("raw course data:", courses);
          let key = '';
          let tips = [];
          let difficulty = [];
          let timeSpent = [];
          this.underscore.each(courses, ((course) => {
            console.log("What's in this one course?", course);
            key = course['whatCourseDidYouTake?'].substring(0,6).split(' ').join('');
            //tips are optional, so only push when there's a tip (not undefined)
            if (course['whatTipsWouldYouGiveStudentsTakingThisCourse?']) {
              tips.push(course['whatTipsWouldYouGiveStudentsTakingThisCourse?']);
            }
            difficulty.push(course['howHardWasThisClass?']);
            timeSpent.push(course['howMuchTimeDidYouSpendOnAverage(perWeek)ForThisClass?']);
            //add the course data object for this particular course (and repeat)
              this.courses[key] = {
                'fullName':course['whatCourseDidYouTake?'],
                'tips':tips,
                'difficulty':difficulty,
                'timeSpent':timeSpent
              };
          }))
        }));
        console.log("final data structure:", this.courses);

        var options = {
          row: "whatCourseDidYouTake?"
        };
        this.classNames = jsonToPivotjson(response.data, options);
      });
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }
}

export default angular.module('osuCsClassExplorerApp.main', [ngRoute])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
