'use strict';

var module = angular.module('overdressed.messaging.controllers', [
    'ngRoute'
]);

module.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/inbox/1'
        })
        .when('/conversation/new', {

            templateUrl: 'views/messaging/new.html',
            controller: 'ConversationNewController'

        })
        .when('/inbox/:page', {
            templateUrl: 'views/messaging/index.html',
            controller: 'ConversationListController'

        })
        .when('/conversation/:id', {
            templateUrl: 'views/messaging/conversation.html',
            controller: 'ConversationController'
        });
});

module.controller('ConversationListController', function($scope, $location, $routeParams, Conversation) {
    // Init
    $scope.totalSelected = 0;

    // Get all conversations
    var conversationList = Conversation.query($routeParams);
    $scope.conversations = conversationList;

    /* Selects all the messages */
    $scope.selectAll = function(conversations){
        conversations.forEach(function(conversation) {
            if( (conversation.selected == false) || !('selected' in conversation)) {
                conversation.selected = true;
                $scope.totalSelected++;
            }
        })
    };

    /* Gets all selected conversations  */
    $scope.getAllSelected = function(conversations) {
        for (var i in conversations) {
            if (conversations[i].selected == true) {
                console.log(conversations[i].id);
            }
        }
    };

    /* Select conversation */
    $scope.selectConversation = function(conversation) {
        conversation.selected = !conversation.selected;
        if( conversation.selected == true ) {
            $scope.totalSelected++;
        } else {
            $scope.totalSelected--;
        }
    }

    $scope.changeFollowUp = function(conversation) {
        conversation.followUp = !conversation.followUp;
        // TODO: save
    }

    // Set current page
    $scope.page = parseInt($routeParams.page);
});

module.controller('ConversationController', function($scope, $routeParams, Conversation, $window) {
    $scope.conversation = null;
    Conversation.get({id: $routeParams.id}, function(ret) {
        $scope.conversation = ret;
        console.log("ret", ret);
    }, function(error) {
        $scope.conversation = false;
        console.log("err", error);
    });

    $scope.changeFollowUp = function() {
        $scope.conversation.followUp = !$scope.conversation.followUp;
        // TODO: save
        console.log("set followup", $scope.conversation.id, $scope.conversation.followUp);
    }

    $scope.addReply = function() {
        // TODO
        console.log("add reply", $scope.conversation.id, $scope.reply_text);
    };

    $scope.markUnread = function() {
        // TODO
        console.log("mark unread", $scope.conversation.id);
    };

    $scope.delete = function() {
        // TODO
        console.log("delete conversation", $scope.conversation.id);
    };

    $scope.gotoTop = function() {
        $window.scrollTo(0, 0);
    };
});

module.controller('ConversationNewController', function($scope, $location, $http, Conversation) {
    $scope.recv = [];
    $scope.changed = function() {
        if($scope.to.length > 0) {
            $http.get("http://admin:district@inf5750-19.uio.no/api/users?filter=firstName:like:"
                    + $scope.to).
                    success(function(data, status) {
                        $scope.res = data;
                    }).
                    error(function(data, status) {
                        alert("ERROR");
                    });
        } else {
            $scope.res = [];
        }
    }
    $scope.addRecv = function(inp) {
            $scope.recv[$scope.recv.length] = {name: inp.name,
                    id: inp.id}
    }

    $scope.remRecv = function(indx) {
            $scope.recv.splice(indx, 1);
    }

    // Change page
    $scope.changePage = function(path) {
        console.log(path)
        $location.path(path);
    }
});
