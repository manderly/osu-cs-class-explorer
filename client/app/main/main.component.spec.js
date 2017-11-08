'use strict';

import main from './main.component';
import {
  MainController
} from './main.component';

describe('Component: MainComponent', function() {
  beforeEach(angular.mock.module(main));

  var scope;
  var mainComponent;
  var $httpBackend;

  /* If something bad happens to the $onInit() code in main.component.js that
    turns the api/data response into usable data, this test should catch it */
  let mockData = {
    "courseData":{
      "courses":{
        "CS000":{
          "fullName":"CS 000 - Test Course",
          "tips":[
            {
              "tip":"Test course tip",
              "timestamp":"November 2017"
            }
          ],
          "difficulty":[4,17,1,1,9],
          "timeSpent":[1,2,5,1],
          "description":"Test description",
          "proctoredTests":"Yes",
          "book":"",
          "bookLink":"",
          "prereqs":"CS290"
        }
      },
      "courseNames":["CS 000 - Test Course Display"],
      "reviewCount":100,
      "lastBuilt":"2017-11-08T14:48:31.014Z"
    }
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $http, $componentController, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/data')
      .respond(mockData);

    scope = $rootScope.$new();
    mainComponent = $componentController('main', {
      $http,
      $scope: scope
    });
  }));

  it('should be able to extract a course name', function() {
    mainComponent.$onInit();
    $httpBackend.flush();
    expect(mainComponent.courses['CS000'].fullName).to.equal('CS 000 - Test Course');
  });

  it('should have a review count of 100', function() {
      mainComponent.$onInit();
      $httpBackend.flush();
      expect(mainComponent.reviewCount).to.equal(100);
    });

  it('should have a count of 1 course name', function() {
      mainComponent.$onInit();
      $httpBackend.flush();
      expect(mainComponent.courseNames.length).to.equal(1);
    });

  it('should have a correctly formatted timestamp', function() {
      //line 52-ish of main.component.js uses moment to format the raw timestamp data
      //this test catches if something goes wrong with that formatting
      mainComponent.$onInit();
      $httpBackend.flush();
      expect(mainComponent.lastBuilt).to.equal("Wednesday, November 8, 2017 8:48 AM");
    });

});

