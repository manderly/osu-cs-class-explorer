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

  difficultyLabels = ["1 - Easy A", "2 - Mostly easy", "3 - Kinda hard", "4 - Very challenging", "5 - Prepare to be wrecked"];
  difficultyData = []; //array of 5 elements

  timeSpentLabels = ["0-5 hours", "6-12 hours", "13-18 hours", "18+ hours"];
  timeSpentData = []; //array of 4 elements

  //light to dark orange tones
  chartColors = [ '#fedbcd', '#fdb89b', '#fa7138', '#dc4405', '#641f02'];
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
    this.$http.get('/api/things')
      .then(response => {
        this.courses = response.data.courses;
        this.courseNames = response.data.courseNames.sort();
        this.reviewCount = response.data.reviewCount;
      });
  }

  legendCallback(chart) {
    var text = [];
    text.push('<ul>');
    for (let i = 0; i < this.difficultyData.length; i++) {
      console.log(this.difficultyData[i]); // see what's inside the obj.
      text.push('<li>');
      text.push('<span style="background-color:' + this.difficultyData[i].borderColor + '">' + this.difficultyData[i].label + '</span>');
      text.push('</li>');
    }
    text.push('</ul>');
    return text.join("");
  }

  displayThisCourse() {
    //get the CS123 code
    let courseKey = this.selectedCourseName.substring(0,6).split(' ').join('');
    this.displayCourse = this.courses[courseKey];
    this.difficultyData = this.displayCourse.difficulty;
    this.timeSpentData = this.displayCourse.timeSpent;

    const difficultyChartData = {
      labels: this.difficultyLabels,
      datasets: [{
        data: this.difficultyData,
        backgroundColor: this.chartColors
      }]
      // These labels appear in the legend and in the tooltips when hovering different arcs
    };

    const ctx = document.getElementById("donut-difficulty").getContext("2d");
    const difficultyChart = new Chart(ctx, {
      type: 'doughnut',
      data: difficultyChartData,
      options: {
        legendCallback: (difficultyChart) => {
          console.log("123 using the thing that generates the legend");
          var text = [];
          text.push('<ul>');
          console.log(difficultyChart);
          for (let i = 0; i < this.difficultyData.length; i++) {
            console.log(this.difficultyData); // see what's inside the obj.
            text.push('<li>');
            text.push('<span style="background-color:' + this.chartColors[i] + '">' + difficultyChart.data.labels[i] + '</span>');
            text.push('</li>');
          }
          text.push('</ul>');
          return text.join("");
        }
      }
    });

    document.getElementById('chart-legends').innerHTML = difficultyChart.generateLegend();

  }
}

export default angular.module('osuCsClassExplorerApp.main', [ngRoute])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
