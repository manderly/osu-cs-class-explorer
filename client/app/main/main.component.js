import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
var moment = require('moment');

export class MainController {

  courses = {};
  reviewCount = 0;
  selectedCourseName = null; //course name from the select
  displayCourse = null; //course to display

  courseNames = [];

  //chart stuff
  difficultyChart;
  timeSpentChart;


  difficultyLabels = ['1 - Easy A', '2 - Mostly easy', '3 - Kinda hard', '4 - Very challenging', '5 - Prepare to be wrecked'];
  difficultyData = []; //array of 5 elements

  timeSpentLabels = ['0-5 hours', '6-12 hours', '13-18 hours', '18+ hours'];
  timeSpentData = []; //array of 4 elements

  //light to dark orange tones
  chartColors = ['#fedbcd', '#fdb89b', '#fa7138', '#dc4405', '#641f02'];
  chartOptions = {
    cutoutPercentage: 40,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        fontSize: 14,
        boxWidth: 20
      }
    }
  };

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/data')
      .then(response => {
        this.courses = response.data.courseData.courses;
        this.reviewCount = response.data.courseData.reviewCount;
        this.courseNames = response.data.courseData.courseNames.sort();
        //format the timestamp and make it local to the user's timezone, rather than UTC
        this.lastBuilt = moment.utc(response.data.courseData.lastBuilt).local()
          .format('LLLL');
      });
  }


  /* Call this method when the user picks a specific course out of the select dropdown.
     Update the user reviews and the two donut charts with specific course data. */
  displayThisCourse() {
    let courseKey = this.selectedCourseName.substring(0, 6).split(' ')
      .join('');
    this.displayCourse = this.courses[courseKey];
    this.difficultyData = this.displayCourse.difficulty;
    this.timeSpentData = this.displayCourse.timeSpent;

    /* Wipe any old charts off the canvas */
    if (this.difficultyChart) {
      this.difficultyChart.destroy();
    }

    if (this.timeSpentChart) {
      this.timeSpentChart.destroy();
    }

    /* build the difficulty donut chart and legend */
    const difficultyChartData = {
      labels: this.difficultyLabels,
      datasets: [{
        data: this.difficultyData,
        backgroundColor: this.chartColors
      }]
    };

    //Difficulty donut chart
    const ctxDifficulty = document.getElementById('donut-difficulty').getContext('2d');

    this.difficultyChart = new Chart(ctxDifficulty, { // eslint-disable-line no-undef
      type: 'doughnut',
      data: difficultyChartData,
      options: {
        legendCallback: difficultyChart => {
          var text = [];
          text.push('<ul class="donutLegend">');
          for (let i = 0; i < this.difficultyData.length; i++) {
            text.push('<li>');
            text.push('<span style="background-color:' + this.chartColors[i] + ';" class="legendLabelBox"></span><span class="legendLabelText">' + difficultyChart.data.labels[i] + '</span>');
            text.push('</li>');
          }
          text.push('</ul>');
          return text.join('');
        }
      }
    });

    /* build the time spent donut chart and legend */
    const timeSpentChartData = {
      labels: this.timeSpentLabels,
      datasets: [{
        data: this.timeSpentData,
        backgroundColor: this.chartColors
      }]
      // These labels appear in the legend and in the tooltips when hovering different arcs
    };

    /* eslint-enable quotes */
    const ctxTimeSpent = document.getElementById('donut-timeSpent').getContext('2d');
    this.timeSpentChart = new Chart(ctxTimeSpent, { // eslint-disable-line no-undef
      type: 'doughnut',
      data: timeSpentChartData,
      options: {
        legendCallback: timeSpentChart => {
          var text = [];
          text.push('<ul class="donutLegend">');
          for (let i = 0; i < this.timeSpentData.length; i++) {
            text.push('<li>');
            text.push('<span style="background-color:' + this.chartColors[i] + ';" class="legendLabelBox"></span><span class="legendLabelText">' + timeSpentChart.data.labels[i] + '</span>');
            text.push('</li>');
          }
          text.push('</ul>');
          return text.join('');
        }
      }
    });
    /* eslint-disable quotes */

    document.getElementById('difficulty-chart-legend').innerHTML = this.difficultyChart.generateLegend();
    document.getElementById('timeSpent-chart-legend').innerHTML = this.timeSpentChart.generateLegend();
  }

}

export default angular.module('osuCsClassExplorerApp.main', [ngRoute])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
