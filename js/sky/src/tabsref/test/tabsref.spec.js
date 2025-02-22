/*jshint browser: true, jasmine: true */
/*global angular, inject, module */

describe('Tab Sref directive', function () {
    'use strict';
    
    var tabHtml,
        $compile,
        $provide,
        $rootScope,
        $state,
        $timeout;
    
    beforeEach(module(
        'ngMock',
        'ui.router',
        'sky.tabsref',
        'template/tabs/tabset.html',
        'template/tabs/tab.html'
    ));
    
    beforeEach(module(function (_$provide_) {
        $provide = _$provide_;
        
        $state = {
            go: angular.noop,
            is: angular.noop
        };
        
        $provide.value('$state', $state);
    }));
    
    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        
        /*jslint white: true */
        tabHtml = 
            '<tabset>' + 
                '<tab heading="1" bb-tab-sref="tabstate.a" active="locals.activeTabA"></tab>' + 
                '<tab heading="2" bb-tab-sref="tabstate.b" active="locals.activeTabB" select="tabSelectB()"></tab>' +
            '</tabset>';
        /*jslint white: false */
    }));
    
    it('should select the corresponding tab on state change', function () {
        var el,
            tabSelectCalled,
            $scope = $rootScope.$new();
        
        $state.is = function (sref) {
            return sref === 'tabstate.b';
        };
        
        $scope.tabSelectB = function () {
            tabSelectCalled = true;
        };
        
        $scope.locals = {
            activeTabA: true,
            activeTabB: false
        };
        
        /*jslint white: true */
        el = $compile(tabHtml)($scope);
        /*jslint white: false */
        $scope.$digest();
        $timeout.flush();
        
        $rootScope.$broadcast('$stateChangeSuccess');

        $scope.$digest();
        
        
        expect(tabSelectCalled).toBe(true);
    });
    
    it('should change state when a tab is selected', function () {
        var el,
            stateGoCalled,
            $scope = $rootScope.$new();

        $state.go = function (sref) {
            expect(sref).toBe('tabstate.b');
            stateGoCalled = true;
        };
        
        $state.is = function (sref) {
            return sref === "tabstate.a";
        };
        
        $scope.locals = {
            activeTabA: true,
            activeTabB: false
        };

        /*jslint white: true */
        el = $compile(tabHtml)($scope);
        /*jslint white: false */
        
        $timeout.flush();
        
        $scope.locals.activeTabA = true;
        
        $scope.$digest();

        $scope.locals.activeTabB = true;
        $scope.$digest();
        
        $timeout.flush();
    
        expect(stateGoCalled).toBe(true);
    });
    
    it('should remove state change handler on destroy', function () {
        var el,
            initialListenerCount,
            $scope = $rootScope.$new();
        
        function listenerCount() {
            return $rootScope.$$listenerCount.$stateChangeSuccess || 0;
        }
        
        initialListenerCount = listenerCount();
        
        $scope.locals = {
            activeTabA: true,
            activeTabB: false
        };
        
        /*jslint white: true */
        el = $compile(tabHtml)($scope);
        /*jslint white: false */
        
        $scope.$digest();
        $timeout.flush();
        
        // There should be one listener per tab.
        expect(listenerCount()).toBe(initialListenerCount + 2);
        $scope.$destroy();
        
        expect(listenerCount()).toBe(initialListenerCount);
    });
});