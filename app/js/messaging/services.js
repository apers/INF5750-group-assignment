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
    var baseUrl = 'http://inf5750-19.uio.no/api/';

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
        //console.log("new conversation", this);
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
    
    Conversation.getUsers = function(search) {
    	return $http.get(Api.getBaseUrl()+search);
    };
    
    Conversation.sendNewMsg = function(msg) {
        return $q(function(resolve, reject) {
        	$http.post(Api.getBaseUrl() + 'messageConversations', msg, {
                    headers: {
                    	'application-type': 'application/json'
                    }
                }).success(function(data, status, header) { 
                    resolve(header('location').split('/'));
                }).error(function(data, status, header) {
        			reject(status);
                })
        });
    };

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
 * Cache-service
 */
module.factory('CacheService', function() {
    var cache;
    var cacheName = 'overdressed';

    var loadCache = function() {
        if (!(cacheName in localStorage)) {
            cache = {};
            saveCache();
        }

        cache = JSON.parse(localStorage[cacheName]);
    };

    var saveCache = function() {
        localStorage[cacheName] = JSON.stringify(cache);
    };

    return {
        get: function(name, def) {
            if (!cache) {
                loadCache();
            }
            if (name in cache) {
                return cache[name];
            }
            return def || null;
        },
        set: function(name, value) {
            cache[name] = value;
            saveCache();
        },
        delete: function(name) {
            if (name in cache) {
                delete cache[name];
            }
            saveCache();
        },
        reload: function() {
            loadCache();
        }
    };
});


/**
 *  Service for offline conversation data
 */
module.factory('OfflineConversation', function(Api, CacheService, $http, $injector, $window, $q) {
    // TODO: change this when API gets fixed
    var readAndFollowUpSupport = false;

    function OfflineConversation() {}
    OfflineConversation.markTypes = {
        markFollowUp: ['unfollowUp', 'followUp', 'followUp'],
        markRead: ['unread', 'read', 'read']
    };

    // cache list:
    // marks - e.g. items for markFollowUp
    // messageList - the cached items
    // newMessages - list of added replies not pushed

    var perPage = 15,
        url = Api.getBaseUrl()+'messageConversations';

    function addMarks(ids, markname, state) {
        angular.forEach(ids, function(id) {
            var cache = CacheService.get('marks', {});

            // remove old marks
            angular.forEach(cache[markname] || {}, function(subids, state) {
                angular.forEach(subids, function(subid, i) {
                    if (id == subid) {
                        cache[markname][state].splice(i, 1);
                    }
                })
            });

            cache[markname] = cache[markname] || {};
            cache[markname][state] = cache[markname][state] || [];
            cache[markname][state].push(id);
            CacheService.set('marks', cache);
        });
    }

    function sendMarks() {
        //console.log("sending marks", cache.marks);
        var t = CacheService.get('marks', {});
        CacheService.delete('marks');
        angular.forEach(t, function (states, markname) {
            angular.forEach(states, function (ids, state) {
                // TODO: catch new connection errors
                if (ids.length == 0) return;
                OfflineConversation[markname](ids, state, true);
            });
        });
    }

    function sendMessages() {
        //console.log("sending messages", cache.newMessages);
        var t = CacheService.get('newMessages', []);
        angular.forEach(t, function(message) {
            // TODO: catch new connection errors
            // TODO: should there be some timer so they are sent in order?
            OfflineConversation.sendMessage(null, message, true);
        });
    }

    function buildMessageCache(force) {
        // TODO: invalidate cache
        // TODO: what if 0 messages? --> should use timestamp
        if(navigator.onLine) {
            var m = CacheService.get('messageList', []);
            if (m.length == 0 || force) {
                $http.get(url, {
                    params: {fields: ':all', pageSize: 50}
                }).success(
                    function (data) {
                        CacheService.set('messageList', data.messageConversations);
                    }).error(
                    function () {
                        console.log('Could not build message cache');
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
                if (!readAndFollowUpSupport) {
                    // we silently ignore (accept) the request
                    resolve("not supported");
                    console.log("Method "+method+" was called, but is not supported. Silently accepted.");
                } else {
                    if (navigator.onLine) {
                        $http.post(url + '/' + (endpoints[state + 0]), ids).success(resolve).error(reject);
                    } else if (!skipOffline) {
                        addMarks(ids, method, state);
                        resolve("offline");
                    } else {
                        reject("offline");
                    }
                }
            });
        }
    });

    OfflineConversation.isWaiting = function() {
        return Object.keys(CacheService.get('marks', {})).length > 0 || CacheService.get('newMessages', []).length > 0;
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
                CachService.set('newMessages', CacheService.get('newMessages', []).push(data));
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
                var m = CacheService.get('messageList', [])
                for (var i = 0; i < m.length; i++) {
                    if (m[i].id == id) {
                        resolve(m[i]);
                        return;
                    }
                }
                reject("message not found");
            }
        });
    };

    OfflineConversation.getByPage = function(page, pagesize, filter) {
        return $q(function(resolve, reject) {
            if (navigator.onLine) {
                $http.get(url, {
                    params: { fields: ':all', page: page, pageSize: pagesize, filter: filter }
                }).success(resolve).error(reject);
            } else {
                console.log("returning offline message list");
                var m = CacheService.get('messageList', []);
                var numPages = Math.ceil(m.length / perPage);
                if (page < 1 || page > numPages) reject("page not found");
                else {
                    resolve({
                        pager: {
                            page: page,
                            pageCount: numPages,
                            total: m.length
                        },
                        messageConversations: m.slice((page-1)*perPage, perPage*page)
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
