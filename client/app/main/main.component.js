import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
var jsonToPivotjson = require("json-to-pivot-json");

export class MainController {

  awesomeThings = [];
  courseData = {};

  newThing = '';
  classNames = [];

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
    this.underscore = require('underscore');
  }

  /*
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
        //all class data
        //todo: refactor boilerplate naming
        this.awesomeThings = response.data;
        console.log(this.awesomeThings);
        //first group all the data by course name
        this.courses = this.underscore.chain(this.awesomeThings)
          .groupBy('whatCourseDidYouTake?')
          .value();

        console.log("courses grouped by name:", this.courses);

        //get the "CS161" name from each course and build objects out of these
        this.underscore.each(this.courses, ((courses) => {
          this.underscore.each(courses, ((course) => {
            let str = course['whatCourseDidYouTake?'].substring(0,6).split(' ').join('');
              this.courseData[str] = {'fullName':course['whatCourseDidYouTake?']}
          }))
        }));
        console.log(this.courseData);

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
