import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
var jsonToPivotjson = require("json-to-pivot-json");

export class MainController {

  awesomeThings = [];
  rawCourseDataGroupedByName = {};
  courses = {};
  reviewCount = 0;
  selectedCourse = null;

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
        let key;
        //response is an array of 322 or so objects, not sorted
        //iterate through all 322+ objects, and sort with the class name as the pivot
        this.underscore.each(response.data, ((course) => {
          key = course['whatCourseDidYouTake?'].substring(0,6).split(' ').join('');
          //if this class isn't in the data object yet, add it
          if (!this.courses[key]) {
            this.classNames.push(course['whatCourseDidYouTake?']);
            this.courses[key] = {
              'fullName':course['whatCourseDidYouTake?'],
              'tips':[],
              'difficulty':[],
              'timeSpent':[]
            };
          } else {
            //tips are optional, so only push when there's a tip (not undefined)
            if (course['whatTipsWouldYouGiveStudentsTakingThisCourse?']) {
              this.courses[key].tips.push(course['whatTipsWouldYouGiveStudentsTakingThisCourse?']);
              this.reviewCount ++;
            }
            this.courses[key].difficulty.push(course['howHardWasThisClass?']);
            this.courses[key].timeSpent.push(course['howMuchTimeDidYouSpendOnAverage(perWeek)ForThisClass?']);
          }
        }));
      });
  }

  selectCourse() {
    console.log("Selected course is currently", this.selectedCourse);
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
