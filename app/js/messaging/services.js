'use strict';

var module = angular.module('overdressed.messaging.services', [
    'ngResource'
]);

/**
 * Helper for API-specific things like getting API-url
 *
 * TODO: Should probably be somewhere else and not inside the conversations module group
 */
module.factory('Api', function($http) {
    // TODO: read from manifest
    var baseUrl = 'http://admin:district@inf5750-19.uio.no/api/';

    //$http.get('manifest.webapp').success(function(data) {
    //    return data.activities.dhis.href + "/api/";
    //});

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
        query: {
            isArray: false,
            params: {
                fields: ':all',
                page: '@page',
                paging: '@paging',
                filter: '@filter'
            }
        },

        get: {
            params: {
                // this ensures we retrieve more data
                fields: ':all,messages[:identifiable,sender]'
            }
        }
    });


    /*
    res.prototype.xxx = function() {

    };
    */


    return res;
});

/* 
 get json objects from users ?
module.factory('Users', function($resource, Api) {

	var res = $http(Api.getBaseUrl()+'users.json';
	return res;
}
*/