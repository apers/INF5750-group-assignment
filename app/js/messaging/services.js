'use strict';

var module = angular.module('overdressed.messaging.services', [

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
 */
module.factory('Conversation', function(Api, $http, $q, OfflineConversation) {
    // this function is taken from angular-resource
    function shallowClearAndCopy(src, dst) {
        dst = dst || {};

        angular.forEach(dst, function(value, key) {
            delete dst[key];
        });

        for (var key in src) {
            if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                dst[key] = src[key];
            }
        }

        return dst;
    }

    //
    // constructor
    //
    function Conversation(value) {
        shallowClearAndCopy(value || {}, this);
        console.log("new conversation", this);
    }

    angular.forEach(OfflineConversation.markTypes, function(endpoints, method) {
        Conversation[method] = function (ids, state) {
            return OfflineConversation[method](ids, state);
        };
        Conversation.prototype[method] = function(state) {
            var self = this;
            return Conversation[method]([this.id], state).then(function(ret) {
                // TODO: should also update any local collections we might have?
                self[endpoints[2]] = state;
                return ret;
            });
        };
    });

    Conversation.prototype.addReply = function(text) {
        var self = this;
        return OfflineConversation.sendMessage(this.id, text).then(function(ret) {
            self.messages.push({
                created: new Date,
                name: text,
                lastUpdated: new Date,
                sender: self.getUser()
            });
            return ret;
        });
    };

    Conversation.prototype.getUser = function() {
        // TODO: return the correct user (how do we find which user we are?)
        return this.userMessages[0].user;
    };

    // online search of messages
    Conversation.query = function(query) {
        return $http.get(Api.getBaseUrl()+'messageConversations', {
            params: angular.extend(query, {fields: ':all'})
        });
    };

    // get single conversation, works offline if message available
    Conversation.get = function(id) {
        return OfflineConversation.get(id);
    };

    // get conversion list for a specific page, works offline if available
    Conversation.getByPage = function(page) {
        OfflineConversation.getByPage(page);
    };

    return Conversation;
});

/**
 *  Service for offline conversation data
 */
module.factory('OfflineConversation', function(Api, $http, $injector, $window, $q) {
    // TODO: change this when API gets fixed
    var readAndFollowUpSupport = false;

    function OfflineConversation() {}
    OfflineConversation.markTypes = {
        markFollowUp: ['unfollowUp', 'followUp', 'followUp'],
        markRead: ['unread', 'read', 'read']
    };
    var cache = 'overdressed' in localStorage ? JSON.parse(localStorage['overdressed']) : {
            'marks': {}, // e.g. items for markFollowUp
            'messageList': [], // the cached items
            'newMessages': [] // list of added replies not pushed
        },
        perPage = 15,
        url = Api.getBaseUrl()+'messageConversations';

    function addMarks(ids, markname, state) {
        angular.forEach(ids, function(id) {
            // remove old marks
            angular.forEach(cache.marks[markname] || {}, function(subids, state) {
                angular.forEach(subids, function(subid, i) {
                    if (id == subid) {
                        cache.marks[markname][state].splice(i, 1);
                    }
                })
            });

            cache.marks[markname] = cache.marks[markname] || {};
            cache.marks[markname][state] = cache.marks[markname][state] || [];
            cache.marks[markname][state].push(id);
        });

        resaveCache();
    }

    function resaveCache() {
        localStorage['overdressed'] = JSON.stringify(cache);
    }

    function sendMarks() {
        console.log("sending marks", cache.marks);
        var t = cache.marks;
        cache.marks = {};
        angular.forEach(t, function (states, markname) {
            angular.forEach(states, function (ids, state) {
                // TODO: catch new connection errors
                OfflineConversation[markname](ids, state, true);
            });
        });
        resaveCache();
    }

    function sendMessages() {
        console.log("sending messages", cache.newMessages);
        var t = cache.newMessages;
        angular.forEach(t, function(message) {
            // TODO: catch new connection errors
            // TODO: should there be some timer so they are sent in order?
            OfflineConversation.sendMessage(null, message, true);
        });
        resaveCache();
    }

    function buildMessageCache(force) {
        // TODO: invalidate cache
        // TODO: what if 0 messages? --> should use timestamp
        if(navigator.onLine) {
            if (cache.messageList.length == 0 || force) {
                $http.get(url, {
                    params: {fields: ':all', pageSize: 50}
                }).success(
                    function (data) {
                        cache.messageList = data.messageConversations;
                        resaveCache();
                    }).error(
                    function () {
                        console.log('Could not build message cache')
                    });
            }
        }
    }

    OfflineConversation.checkOfflineQueue = function() {
        if (!navigator.onLine) return;
        sendMarks();
        sendMessages();
        buildMessageCache();
    };

    $window.addEventListener('online', function() {
        console.log("OfflineConversation", "going online");
        OfflineConversation.checkOfflineQueue();
    }, false);

    angular.forEach(OfflineConversation.markTypes, function(endpoints, method) {
        OfflineConversation[method] = function(ids, state, skipOffline) {
            return $q(function (resolve, reject) {
                if (navigator.onLine && readAndFollowUpSupport) {
                    $http.post(url + '/' + (endpoints[state + 0]), ids).success(resolve).error(reject);
                } else if (!skipOffline) {
                    addMarks(ids, method, state);
                    resolve("offline");
                } else {
                    reject("offline");
                }
            });
        }
    });

    OfflineConversation.isWaiting = function() {
        return Object.keys(cache.marks).length > 0 || cache.newMessages.length > 0;
    };

    OfflineConversation.sendMessage = function(id, data, skipOffline) {
        if (typeof data != 'object') {
            data = {
                'id': id,
                'text': data,
                'date': new Date()
            };
        }

        return $q(function(resolve, reject) {
            if (navigator.onLine) {
                $http.post(url + '/' + data.id, data.text, {
                    headers: {
                        'content-type': 'text/plain'
                    }
                }).success(resolve).error(reject);
            } else if (!skipOffline) {
                cache.newMessages.push(data);
                resaveCache();
                resolve();
            }
        });
    };

    OfflineConversation.get = function(id) {
        return $q(function(resolve, reject) {
            if (navigator.onLine) {
                $http.get(url + '/' + id, {
                    params: { fields: ':all,messages[:identifiable,sender]' }
                }).success(function (ret) {
                    var x = $injector.get('Conversation');
                    resolve(new x(ret));
                }).error(reject);
            } else {
                for (var i = 0; i < cache.messageList.length; i++) {
                    if (cache.messageList[i].id == id) {
                        resolve(cache.messageList[i]);
                        return;
                    }
                }
                reject("message not found");
            }
        });
    };

    OfflineConversation.getByPage = function(page, pagesize, filter) {
        console.log('getPage page: ' + page);
        return $q(function(resolve, reject) {
            if (navigator.onLine) {
                $http.get(url, {
                    params: { fields: ':all', page: page, pageSize: pagesize, filter: filter }
                }).success(resolve).error(reject);
            } else {
                var numPages = Math.ceil(cache.messageList.length / perPage);
                if (page < 1 || page > numPages) reject("page not found");
                else {
                    resolve({
                        pager: {
                            page: page,
                            pageCount: numPages,
                            total: cache.messageList.length
                        },
                        messageConversations: cache.messageList.slice((page-1)*perPage, perPage*page)
                    });
                }
            }
        });
    };

    // Delete a message
    OfflineConversation.delete = function(id) {

        return $q(function(resolve, reject) {
            $http.delete(Api.getBaseUrl() + 'messageConversation/' +  id)
                .success(resolve)
                .error(reject);
        });

    };

    return OfflineConversation;
});
