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

module.controller('ConversationListController', function ($scope, $location, $http, $filter, Conversation) {
    // Init
    $scope.totalSelected = 0;

    var filterText = ""

    /* Watch for page changes */
    $scope.$watch('changePage', function() {
        console.log($scope.changePage);
        getConversations();
        $scope.totalSelected = 0;
    });



    // Get all conversations and paging data
    var getConversations = function () {

        var filterStr;

        if( filterText == "" ) {
            filterStr = null;
        } else {
            filterStr = 'subject:like:' + filterText;
        }

        var queryParams = {
            page: $scope.changePage,
            pageSize: 15,
            filter: filterStr
        };

        $scope.conversations = Conversation.query(queryParams, function (data) {
            /* Paging */
            var currentPage = parseInt(data.pager.page);

            $scope.currentPage = currentPage;
            $scope.changePage = currentPage;

            var maxPage = data.pager.pageCount;

            if (currentPage != 1 && currentPage != maxPage) {
                $scope.paging1 = currentPage - 1;
                $scope.paging2 = currentPage;
                $scope.paging3 = currentPage + 1;
                $scope.nextPage = currentPage + 1;
                $scope.prevPage = currentPage - 1;
            } else if (currentPage <= 1) {
                $scope.paging1 = currentPage;
                $scope.paging2 = currentPage + 1;
                $scope.paging3 = currentPage + 2;
                $scope.nextPage = currentPage + 1;
                $scope.prevPage = currentPage;
            } else if (currentPage == maxPage) {
                $scope.paging1 = currentPage - 2;
                $scope.paging2 = currentPage - 1;
                $scope.paging3 = currentPage;
                $scope.nextPage = currentPage;
                $scope.prevPage = currentPage - 1;
            }
        });
    };

    // Get initial conversations
    getConversations();

    $scope.setQueryFilter = function(filter) {
        filterText = filter;
        getConversations();
    }

    /* For the typeahead search */
    $scope.typeaheadfilterQuery = function (value) {
        return Conversation.query({filter: 'subject:like:' + value, paging: false, fields: 'subject'}).$promise.then(
            function (response) {
                return $filter('limitTo')(response.messageConversations, 5)
            });
    };

    /* Selects all the messages */
    $scope.selectAll = function (conversations) {
        conversations.forEach(function (conversation) {
            if ((conversation.selected == false) || !('selected' in conversation)) {
                conversation.selected = true;
                $scope.totalSelected++;
            }
        })
    };

    /* Selects all the messages */
    $scope.selectNone = function (conversations) {
        conversations.forEach(function (conversation) {
            if (conversation.selected == true) {
                conversation.selected = false;
                $scope.totalSelected--;
            }
        })
    };

    /* Gets all selected conversations  */
    $scope.deleteAllSelected = function (conversations) {
        for (var i in conversations) {
            if (conversations[i].selected == true) {
                Conversation.delete({id: conversations[i].id}, function (data) {
                    // Refresh messages
                    getConversations();
                    $scope.totalSelected--;
                })
            }
        }
    };

    $scope.starAllSelected = function (conversations) {
        for (var i in conversations) {
            if (conversations[i].selected == true) {
                console.log(conversations[i].id);
            }
        }
    };

    /* Select conversation */
    $scope.countSelected = function (state) {
        if (state == true) {
            $scope.totalSelected++;
        } else {
            $scope.totalSelected--;
        }
    };

    $scope.changeFollowUp = function (conversation) {
        conversation.followUp = !conversation.followUp;

        Conversation.get({id: conversation.id}, function (data) {
            data.followUp = conversation.followUp;
            data.$save();
        }, function (data) {
            console.log('Error: ', data)
        });
    };

    $scope.deleteConversation = function (conversation) {
        // Delete conversation
        Conversation.delete({id: conversation.id}, function () {
            // Refresh messages
            getConversations();
        });

    };

    $('#deleteModal').on('show.bs.modal', function (event) {
        console.log($scope.deleteConv);
    })
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

module.controller('ConversationNewController', function ($scope, $location, $http,
                                                         Conversation, limitToFilter) {
    $scope.recv = {usrNames: [], usrIds: [], grpNames: [], grpIds: [], orgNames: [], orgIds: []};
    $scope.res = [];

    //Adds neq:name to avoid getting results we already have.
    function updateQuery(arr, q, qVal) {
        arr.forEach(function (elem) {
            q += qVal + "" + elem.name;
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
        console.log(msg);
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
