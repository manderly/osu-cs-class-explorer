import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';

export class MainController {

  awesomeThings = [];
  courses = {};
  reviewCount = 0;
  selectedCourse = null;

  newThing = '';
  courseNames = [];

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
        this.underscore.each(response.data, ((course) => {
          //use the course name as a key, like "CS162"
          key = course['whatCourseDidYouTake?'].substring(0,6).split(' ').join('');

          //if this class isn't in the data object yet, add it
          if (!this.courses[key]) {
            this.courseNames.push(course['whatCourseDidYouTake?']);
            //make an empty object for this key
            this.courses[key] = {
              'fullName': course['whatCourseDidYouTake?'],
              'tips': [],
              'difficulty': [],
              'timeSpent': []
            };
          }

          //then push the data in
          if (course['whatTipsWouldYouGiveStudentsTakingThisCourse?']) {
            this.courses[key].tips.push(course['whatTipsWouldYouGiveStudentsTakingThisCourse?']);
            this.reviewCount++;
          }
          this.courses[key].difficulty.push(course['howHardWasThisClass?']);
          this.courses[key].timeSpent.push(course['howMuchTimeDidYouSpendOnAverage(perWeek)ForThisClass?']);
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
