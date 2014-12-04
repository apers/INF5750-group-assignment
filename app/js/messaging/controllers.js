'use strict';

var module = angular.module('overdressed.messaging.controllers', [
    'ngRoute', 'ngTagsInput', 'ui.bootstrap',
    'overdressed.messaging.controllers.PageController',
    'overdressed.messaging.controllers.ConversationController',
    'overdressed.messaging.controllers.ConversationListController'
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

/*
 TODO:
 module.controller('menuController', function ($scope) {

 var isLocation = function (path) {
 console.log("Checking");
 return $scope.location.slice(0, path.length) == path;
 };
 });*/


module.controller('ConversationNewController', function ($scope, $location, $http,
                                                         Conversation) {
    $scope.recv = {usrNames: [], usrIds: [], grpNames: [], grpIds: [], orgNames: [], orgIds: []};
    $scope.res = [];
    $scope.sub = "";
    $scope.submitted = false;
    var alertMsg =
    {type: 'danger', msg: 'Missing a user or usergroup'};
    $scope.alert = [];
    //Adds neq:name to avoid getting results we already have.
    function updateQuery(arr, q, qVal) {
        arr.forEach(function (elem) {
            q += qVal + "" + elem;
        });
        return q;
    }


    $scope.findRecv = function (inp, t) {
        var search = "http://admin:district@inf5750-19.uio.no/api/";
        if (t === 'u') {
            search += "users?filter=userCredentials.name:like:" + inp;
            search = updateQuery($scope.recv.usrNames, search,
                "&filter=userCredentials.name:neq:");
        } else if (t === 'g') {
            search += "userGroups?filter=name:like:"
            + inp;
            search = updateQuery($scope.recv.grpNames, search,
                "&filter=name:neq:");
        } else {
            search += "organisationUnits?filter=name:like:"
            + inp;
            search = updateQuery($scope.recv.orgNames, search,
                "&filter=name:neq:");
        }
        search += "&pageSize=10";
        return $http.get(search)
            .then(function (response) {
                if (t === 'u') {
                    return response.data.users;
                } else if (t === 'g') {
                    return response.data.userGroups;
                } else {
                    return response.data.organisationUnits;
                }
            });
    }

    $scope.selectedRecv = function (inp, t) {
        if (t === 'u') {
            $scope.recv.usrNames.push(inp.name);
            $scope.recv.usrIds.push({id: inp.id});

        } else if (t === 'g') {
            $scope.recv.grpNames.push(inp.name);
            $scope.recv.grpIds.push({id: inp.id});

        } else {
            $scope.recv.orgNames.push(inp.name);
            $scope.recv.orgIds.push({id: inp.id});
        }
        $scope.alert = [];
    }

    $scope.remRecv = function (tag, t) {
        function remove(setNames, setIds) {
            var index = setNames.indexOf(tag.name);
            setNames.splice(index, 1);
            setIds.splice(index, 1);
        }

        if (t === 'u') {
            remove($scope.recv.usrNames, $scope.recv.usrIds);
        } else if (t === 'g') {
            remove($scope.recv.grpNames, $scope.recv.grpIds);
        } else {
            remove($scope.recv.orgNames, $scope.recv.orgIds);
        }
    }

    $scope.checkRecv = function () {
        if ($scope.recv.usrNames.length < 1 && $scope.recv.grpNames.length < 1) {
            return false;
        }
        $scope.submitted = false;
        return true;
    }

    $scope.closeAlert = function () {
        $scope.alert = [];
    }


    $scope.sendMsg = function () {
        $scope.alert = [];
        if (!$scope.checkRecv()) {
            $scope.alert.push(alertMsg);
            return;
        }
        var msg = {
            subject: $scope.sub, text: $scope.mailText,
            users: $scope.recv.usrIds, userGroups: $scope.recv.grpIds,
            organisationUnits: $scope.recv.orgIds
        };
        console.log(msg);
        $http.post("http://admin:district@inf5750-19.uio.no/api/messageConversations", msg).
            success(function (data, status, headers, config, statusText) {
                console.log(data, status, headers, config, statusText);
            }).
            error(function (data, status) {
                console.log("fail");
            });
    }

    // Change page
    $scope.changePage = function (path) {
        console.log(path)
        $location.path(path);
    }
});
