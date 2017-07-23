import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';

export class MainController {

  awesomeThings = [];
  courses = {};
  reviewCount = 0;
  selectedCourseName = null; //course name from the select
  displayCourse = null; //course to display

  courseNames = [];

  difficultyLabels = ["1 - Easy A", "2 - Not too bad", "3 - Some hard parts", "4 - Tough class", "5 - Prepare to be wrecked"];
  difficultyData = []; //array of 5 elements

  timeSpentLabels = ["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"];
  timeSpentData = []; //array of 4 elements

  //light to dark orange tones
  chartColors = [ '#fedbcd', '#fdb89b', '#fa7138', '#dc4405', '#641f02'];
  chartOptions = {
    cutoutPercentage: 40,
    legend: {
      display: true
    }
  };

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.courses = response.data.courses;
        this.courseNames = response.data.courseNames.sort();
        this.reviewCount = response.data.reviewCount;
      });
  }

  displayThisCourse() {
    //get the CS123 code
    let courseKey = this.selectedCourseName.substring(0,6).split(' ').join('');
    this.displayCourse = this.courses[courseKey];
    this.difficultyData = this.displayCourse.difficulty;
    this.timeSpentData = this.displayCourse.timeSpent;
  }
}

export default angular.module('osuCsClassExplorerApp.main', [ngRoute])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
