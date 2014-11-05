'use strict';

var module = angular.module('overdressed.messaging.services', [
    'ngResource'
]);

/**
 * Helper for API-specific things like getting API-url
 *
 * TODO: Should probably be somewhere else and not inside the conversations module group
 */
module.factory('Api', function() {
    // TODO: read from manifest
    var baseUrl = 'http://admin:district@inf5750-19.uio.no/api/';

    return {
        getBaseUrl: function() {
            return baseUrl;
        }
    };
});

/**
 * Service for the conversations
 *
 * Uses the ngResource as a base object
 */
module.factory('Conversation', function($resource, Api) {
    var res = $resource(Api.getBaseUrl()+'messageConversations/:id', {
        id: '@id'
    }, {
        // the list returned is in data.messageConversations (and pageinfo in data.pager)
        query: { isArray: false }
    });

    /*
    res.prototype.xxx = function() {

    };
    */

    return res;
});