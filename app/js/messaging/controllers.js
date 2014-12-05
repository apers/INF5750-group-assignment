'use strict';

var module = angular.module('overdressed.messaging.controllers', [
    'ngRoute', 'ngTagsInput', 'ui.bootstrap',
    'overdressed.messaging.controllers.PageController',
    'overdressed.messaging.controllers.ConversationController',
    'overdressed.messaging.controllers.ConversationListController',
    'overdressed.messaging.controllers.ConversationNewController'
]);

module.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/inbox'
        })
        .when('/conversation/new', {

            templateUrl: 'views/messaging/new.html',
            controller: 'ConversationNewController'

        })
        .when('/inbox', {
            templateUrl: 'views/messaging/index.html',
            controller: 'ConversationListController'

        })
        .when('/conversation/:id', {
            templateUrl: 'views/messaging/conversation.html',
            controller: 'ConversationController'
        });
});

/*
 TODO:
 module.controller('menuController', function ($scope) {

 var isLocation = function (path) {
 console.log("Checking");
 return $scope.location.slice(0, path.length) == path;
 };
 });*/
