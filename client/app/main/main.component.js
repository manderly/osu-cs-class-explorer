import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
var jsonToPivotjson = require("json-to-pivot-json");

export class MainController {

  awesomeThings = [];
  newThing = '';
  classNames = [];

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        //all class data
        //todo: refactor boilerplate naming
        this.awesomeThings = response.data;
        //just the class names
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
