(function () {
    'use strict';

    var module = angular.module('overdressed.messaging.controllers.ConversationController', []);

    module.controller('ConversationController', function ($scope, $routeParams, Conversation, $window, $location) {
        $scope.conversation = null;
        Conversation.get($routeParams.id).then(function (ret) {
            $scope.conversation = ret;
            console.log("ret", ret);
        }, function (error) {
            $scope.conversation = false;
            console.log("err", error);
        });

        $scope.changeFollowUp = function () {
            $scope.conversation.markFollowUp(!$scope.conversation.followUp).then(function (ret) {
                console.log("followUp success", ret);
            }, function (err) {
                console.log("error", err);
            });
        };

        $scope.addReply = function () {
            $scope.reply_text = $scope.reply_text.trim();
            if ($scope.reply_text == '') return;
            var text_to_send = $scope.reply_text;

            $scope.conversation.addReply($scope.reply_text).then(function (ret) {
                if ($scope.reply_text == text_to_send) $scope.reply_text = '';
                console.log("reply success", ret);
            }, function (ret) {
                console.log("reply error", ret);
            });
        };

        $scope.markUnread = function () {
            $scope.conversation.markRead(false).then(function (ret) {
                console.log("markRead success", ret);
                $location.path('');
            }, function (err) {
                console.log("error", err);
            });
        };

        $scope.delete = function () {
            // TODO
            console.log("delete conversation", $scope.conversation.id);
        };

        $scope.gotoTop = function () {
            $window.scrollTo(0, 0);
        };
    });
})();