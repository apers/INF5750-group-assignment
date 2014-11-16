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
        conversation.followUp = conversation.followUp;
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
    $scope.recv = {usrNames: [], usrIds: [], grpNames: [], grpIds: [], orgNames:[], orgIds:[]};
    var last = '';
    $scope.findRes = function(t) {
    	var search = "http://admin:district@inf5750-19.uio.no/api/";
    	/*TODO move into helper function*/
    	if(t === 'u') {
    		if($scope.toUsr.length == 0) {
    			//set res to others if they are > 0 ? 
    			$scope.res = [];
    			return;
    		} else {
    			search += "users?filter=firstName:like:"
                    + $scope.toUsr + "&surname:like:" + $scope.toUsr;
    		}
    	} else if(t === 'g') {
    		if($scope.toGrp.length == 0) {
    			//set res to others if they are > 0 ? 
    			$scope.res = [];
    			return;
    		} else {
    			search += "userGroups?filter=name:like:"
                    + $scope.toGrp;
    		}
    	} else {
    		if($scope.toOrg.length == 0) {
    			//set res to others if they are > 0 ? 
    			$scope.res = [];
    			return;
    		} else {
    			search += "organisationUnits?filter=name:like:"
                    + $scope.toOrg;
    		}
    	}
            $http.get(search).
                    success(function(data, status) {
                    	if(t === 'u') {
                    		$scope.res = data.users;
                    	} else if(t === 'g') {
                    		$scope.res = data.userGroups;
                    	} else {
                    		$scope.res = data.organisationUnits;
                    	}
                    }).
                    error(function(data, status) {
                        alert("ERROR");
                    });
            last = t;
    }
    
    
    $scope.addRecv = function(inp) {
    	if(last === 'u') {
            $scope.recv.usrNames.push({name: inp.name});
            $scope.recv.usrIds.push({id: inp.id});
    	} else if (last === 'g') {
    		$scope.recv.grpNames.push({name: inp.name});
            $scope.recv.grpIds.push({id: inp.id});
    	} else {
    		$scope.recv.orgNames.push({name: inp.name});
            $scope.recv.orgIds.push({id: inp.id});
    	}
    }

    $scope.remRecv = function(indx, t) {
    	if(t === 'u') {
            $scope.recv.usrNames.splice(indx);
            $scope.recv.usrIds.splice(indx);
    	} else if (t === 'g') {
    		$scope.recv.grpNames.splice(indx);
            $scope.recv.grpIds.splice(indx);
    	} else {
    		$scope.recv.orgNames.splice(indx);
            $scope.recv.orgIds.splice(indx);
    	}
    }
    
    $scope.sendMsg = function() {
    	var msg = {subject: $scope.sub, text: $scope.mailText, 
    			users: $scope.recv.usrIds, userGroups: $scope.recv.grpIds , 
    			organisationUnits: $scope.recv.orgIds };
    	$scope.test = msg;
    	$http.post("http://admin:district@inf5750-19.uio.no/api/messageConversations", msg).
    	success(function(data, status) {
    	    alert("Success");
    	  }).
    	  error(function(data, status) {
    	    alert("fail:(");
    	  });

    }

    // Change page
    $scope.changePage = function(path) {
        console.log(path)
        $location.path(path);
    }
});
