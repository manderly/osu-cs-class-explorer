import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';

export class MainController {

  awesomeThings = [];
  courses = {};
  reviewCount = 0;
  selectedCourseName = null; //course name from the select
  displayCourse = null; //course to display

  newThing = '';
  courseNames = [];

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  /* Desired data structure:
  courses: {
    CS161: {
      fullName: "CS161 Intro to Computer Science",
      tips: [{tip: "sdasda", timestamp: 1234.1234}, {tip: "wow such hard",...} ]
    },
    CS162: {
      ...
    }
   */

  $onInit() {
    //uses static data for now
    this.$http.get('/api/things')
      .then(response => {
        console.log("this response came in:", response);
        this.courses = response.data.courses;
        this.courseNames = response.data.courseNames;
        this.reviewCount = response.data.reviewCount;
        console.log("course data fresh from a json file:", this.courses);
      });
  }

  displayThisCourse() {
    //get the CS123 code
    let courseKey = this.selectedCourseName.substring(0,6).split(' ').join('');
    console.log("the course key is now", courseKey);
    this.displayCourse = this.courses[courseKey];
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
