'use strict';

var module = angular.module('overdressed.messaging.controllers', [
    'ngRoute'
]);

module.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/messaging/index.html',
            controller: 'ConversationListController'
        })
        .when('/conversation/:id', {
            templateUrl: 'views/messaging/conversation.html',
            controller: 'ConversationController'
        })
        .when('/conversation/new', {

        });
});

module.controller('ConversationListController', function() {
    // TODO
});

module.controller('ConversationController', function() {
    // TODO
});
