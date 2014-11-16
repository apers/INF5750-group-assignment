'use strict';

var module = angular.module('overdressed.messaging.directives', [
    //'moduleDependency',
]);

/*
module.directive('directiveName', function() {

});
*/

module.directive('activeOnClick',function ($rootScope) {
	
	return {
		link: function($scope, elm) {
			var tab = angular.element(elm);
			tab.bind('click', function(e) {
				if (!tab.hasClass('active')) {
					tab.addClass('active');
					$rootScope.$broadcast('elementClicked', tab);
				}
			});

			$scope.$on('elementClicked', function(event, theTab){
				if (!tab)
					tab = angular.element(elm);
				if (theTab !== tab && tab.hasClass('active'))
					tab.removeClass('active');
			});
		}
	}
});