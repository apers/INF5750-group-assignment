'use strict';

var module = angular.module('overdressed.messaging.controllers', [
    'ngRoute', 'ngTagsInput', 'ui.bootstrap',
    'overdressed.messaging.services',
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
            controller: 'ConversationNewController',
            resolve: {
                resolver: function(ResolverService) {
                    return ResolverService;
                }
            }
        })
        .when('/inbox', {
            templateUrl: 'views/messaging/index.html',
            controller: 'ConversationListController',
            resolve: {
                resolver: function(ResolverService) {
                    return ResolverService;
                }
            }
        })
        .when('/conversation/:id', {
            templateUrl: 'views/messaging/conversation.html',
            controller: 'ConversationController',
            resolve: {
                resolver: function(ResolverService) {
                    return ResolverService;
                }
            }
        });
});
