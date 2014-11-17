'use strict';

var module = angular.module('overdressed.messaging.controllers', [
    'ngRoute', 'ui.bootstrap'
]);

module.config(function ($routeProvider) {
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

module.controller('ConversationListController', function ($scope, $location, $routeParams, $http, Conversation) {
    // Init
    $scope.totalSelected = 0;
    $scope.allSelected = false;

    // Get all conversations
    $scope.conversations = Conversation.query($routeParams);

    /* Selects all the messages */
    $scope.selectAll = function (conversations) {
        conversations.forEach(function (conversation) {
            if ((conversation.selected == false) || !('selected' in conversation)) {
                conversation.selected = true;
                $scope.totalSelected++;
            }
        })
    };

    /* Gets all selected conversations  */
    $scope.getAllSelected = function (conversations) {
        for (var i in conversations) {
            if (conversations[i].selected == true) {
                console.log(conversations[i].id);
            }
        }
    };

    /* Select conversation */
    $scope.selectConversation = function (state) {
        if (state == true) {
            $scope.totalSelected++;
        } else {
            $scope.totalSelected--;
        }
    }

    $scope.changeFollowUp = function (conversation) {
        conversation.followUp = !conversation.followUp;
        $http.post('http://admin:district@inf5750-19.uio.no/api/messageConversations/read', '[' + conversation.id + ']')
            .success(function () {
                console.log('Success');
                $scope.conversations = Conversation.query($routeParams);
            })
        // TODO: save
    }

    $scope.deleteConversation = function (conversation) {
        $http.delete('http://admin:district@inf5750-19.uio.no/api/messageConversations/' + conversation.id)
         .success(function () {
         $scope.conversations = Conversation.query($routeParams);
         })
    }

    // Set current page
    $scope.page = parseInt($routeParams.page);
});

module.controller('ConversationController', function ($scope, $routeParams, Conversation, $window) {
    $scope.conversation = null;
    Conversation.get({id: $routeParams.id}, function (ret) {
        $scope.conversation = ret;
        console.log("ret", ret);
    }, function (error) {
        $scope.conversation = false;
        console.log("err", error);
    });

    $scope.changeFollowUp = function () {
        $scope.conversation.followUp = !$scope.conversation.followUp;
        // TODO: save
        console.log("set followup", $scope.conversation.id, $scope.conversation.followUp);
    }

    $scope.addReply = function () {
        // TODO
        console.log("add reply", $scope.conversation.id, $scope.reply_text);
    };

    $scope.markUnread = function () {
        // TODO
        console.log("mark unread", $scope.conversation.id);
    };

    $scope.delete = function () {
        // TODO
        console.log("delete conversation", $scope.conversation.id);
    };

    $scope.gotoTop = function () {
        $window.scrollTo(0, 0);
    };
});

module.controller('ConversationNewController', function ($scope, $location, $http, Conversation) {
    $scope.recv = {usrNames: [], usrIds: [], grpNames: [], grpIds: [], orgNames: [], orgIds: []};
    $scope.testz = ['aaa', 'bbb', 'ccc'];
    $scope.res = [];
   
   
    $scope.findRecv = function (inp, t) {
        var search = "http://admin:district@inf5750-19.uio.no/api/";
        /*TODO move into helper function*/
        if (t === 'u') {
                search += "users?filter=firstName:like:"
                + inp + "&surname:like:" + inp;
       } else if (t === 'g') {
                search += "userGroups?filter=name:like:"
                + inp;
        } else {
                search += "organisationUnits?filter=name:like:"
                + inp;
        }
        
        return $http.get(search)
            	.then(function(response){ 
            		if(t === 'u') {
            			return response.data.users;
            		}else if(t === 'g'){
            			return response.data.userGroups;
            		} else {
            			return response.data.organisationUnits;
            		}
            		});
    }

    $scope.selectedRecv = function(inp, t) {
        if (t === 'u') {
            $scope.recv.usrNames.push({name: inp.name});
            $scope.recv.usrIds.push({id: inp.id});
            $scope.toUsr = "";
        } else if (t === 'g') {
            $scope.recv.grpNames.push({name: inp.name});
            $scope.recv.grpIds.push({id: inp.id});
            $scope.toGrp = "";
        } else {
            $scope.recv.orgNames.push({name: inp.name});
            $scope.recv.orgIds.push({id: inp.id});
            $scope.toOrg = "";
        }
    }
  

    $scope.remRecv = function (indx, t) {
        if (t === 'u') {
            $scope.recv.usrNames.splice(indx);
            $scope.recv.usrIds.splice(indx);
        } else if (t === 'g') {
            $scope.recv.grpNames.splice(indx);
            $scope.recv.grpIds.splice(indx);
        } else {
            $scope.recv.orgNames.splice(indx);
            $scope.recv.orgIds.splice(indx);
        }
    }

    $scope.sendMsg = function () {
        var msg = {
            subject: $scope.sub, text: $scope.mailText,
            users: $scope.recv.usrIds, userGroups: $scope.recv.grpIds,
            organisationUnits: $scope.recv.orgIds
        };
        $scope.test = msg;
        $http.post("http://admin:district@inf5750-19.uio.no/api/messageConversations", msg).
            success(function (data, status) {
                alert("Success");
            }).
            error(function (data, status) {
                alert("fail:(");
            });

    }

    // Change page
    $scope.changePage = function (path) {
        console.log(path)
        $location.path(path);
    }
});
