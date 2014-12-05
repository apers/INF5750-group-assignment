(function () {
    'use strict';

    var module = angular.module('overdressed.messaging.controllers.ConversationListController', []);

    module.controller('ConversationListController', function ($scope, $location, $http, $filter, OfflineConversation) {
        // Init
        $scope.totalSelected = 0;
        $scope.changePage = 1;

        var filterText = "";

        /* Watch for page changes */
        $scope.$watch('changePage', function () {
            getConversations();
            $scope.totalSelected = 0;
        });

        /* Watch for filter changes */
        $scope.$watch('messageFilter', function () {
            if ($scope.messageFilter != undefined) {
                $scope.changePage = 1;
                $scope.totalSelected = 0;
                filterText = $scope.messageFilter;
                getConversations();
            }
        });

        // Get all conversations and paging data
        var getConversations = function () {

            var filterStr;

            if (filterText == "") {
                filterStr = null;
            } else {
                filterStr = 'subject:like:' + filterText;
            }

            var queryParams = {
                page: $scope.changePage,
                pageSize: 15,
                filter: filterStr
            };

            $scope.conversations = null;

            console.log('Get conversations from page: ' + $scope.changePage);

            OfflineConversation.getByPage($scope.changePage, queryParams.pageSize, queryParams.filter).then(function (data) {
                $scope.conversations = data;

                var currentPage = parseInt(data.pager.page);

                $scope.currentPage = currentPage;

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
                    OfflineConversation.delete(conversations[i].id);
                }
            }
        };

        $scope.starAllSelected = function (conversations) {
            for (var i in conversations) {
                if (conversations[i].selected == true) {
                    setFollowUp(conversations[i]);
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
            setFollowUp(conversation);
        };

        function setFollowUp(conversation) {
            conversation.followUp = !conversation.followUp;

            OfflineConversation.get(conversation.id).then(function(convo) {
                convo.markFollowUp(conversation.followUp).then(function (ret) {
                    console.log("markRead success", ret);
                }, function (err) {
                    console.log("error", err);
                });
            });
        }
        /**/
        $scope.deleteConversation = function (conversation) {
            // Delete conversation
            OfflineConversation.delete(conversation)
                .success(function(ret){
                    console.log(ret);
            })
                .error(function(ret){
                    console.log(ret);
            })
        };


        $scope.getLastSender = function (conversation) {
            if ('lastSenderFirstname' in conversation) {
                return conversation.lastSenderFirstname + ' ' + conversation.lastSenderSurname;
            } else if ('lastSender' in conversation) {
                return conversation.lastSender.name;
            } else {
                return 'No sender';
            }
        }
    });
})();