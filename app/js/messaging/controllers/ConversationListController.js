(function () {
    'use strict';

    var module = angular.module('overdressed.messaging.controllers.ConversationListController', []);

    module.controller('ConversationListController', function ($scope, $location, $http, $filter, Conversation, OfflineConversation) {
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

/**/
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
        };

        $scope.deleteConversation = function (conversation) {
            console.log(conversation);
            // Delete conversation
            Conversation.delete({id: conversation}, function (data) {
                // Refresh messages
                getConversations();
                $scope.totalSelected--;
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