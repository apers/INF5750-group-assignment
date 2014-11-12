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
        
        	templateUrl: 'views/messaging/new.html',
        	controller: 'conversationNewController'
        	
        });
});

module.controller('ConversationListController', function($scope, $location, Conversation) {

    // Get all conversations
    $scope.conversations = Conversation.query();

    // Change page
    $scope.changePage = function(path) {
        console.log(path)
        $location.path(path);
    }
});

module.controller('ConversationController', function($scope, $routeParams, Conversation) {
    $scope.conversation = Conversation.get({id: $routeParams.id});
    // Change page
    $scope.changePage = function(path) {
        console.log(path)
        $location.path(path);
    }
});

module.controller('ConversationNewController', function($scope, , $http, Conversation) {
	//resouce har API (?)
	$http.get("admin:district@inf5750-19.uio.no/api/users.json").
	success(function(data, status) {
      $scope.users = data;
    }).
    error(function(data, status) {
    	alert("ERROR");
    });
    // Change page
    $scope.changePage = function(path) {
        console.log(path)
        $location.path(path);
    }
});
