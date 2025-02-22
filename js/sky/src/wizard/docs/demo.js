/*global angular */
(function () {
    'use strict';

    function WizardTestController(bbModal) {
        var self = this;

        self.openForm = function () {
            bbModal.open({
                templateUrl: 'demo/wizard/wizardform.html'
            });
        };
    }

    function WizardTestModalController($window, bbWizardNavigator) {
        var self = this,
            steps,
            wizardNav;

        steps = [
            {
                heading: '1. Step 1',
                templateUrl: 'demo/wizard/step1.html',
                complete: function () {
                    return !!self.requiredValue1;
                },
                active: true
            },
            {
                heading: '2. Step 2',
                templateUrl: 'demo/wizard/step2.html',
                complete: function () {
                    return !!self.requiredValue2;
                },
                disabled: function () {
                    return !self.requiredValue1;
                }
            },
            {
                heading: '3. Step 3',
                templateUrl: 'demo/wizard/step3.html',
                complete: function () {
                    return !!self.requiredValue3;
                },
                disabled: function () {
                    return !self.requiredValue1 || !self.requiredValue2;
                }
            }
        ];

        wizardNav = bbWizardNavigator.init(
            {
                steps: steps,
                finish: function () {
                    $window.alert('Finished!');
                }
            }
        );

        self.steps = steps;

        self.wizardNav = wizardNav;

        self.firstStepComplete = function () {
            return !!self.requiredValue1;
        };

        self.secondStepComplete = function () {
            return !!self.requiredValue2;
        };
    }

    WizardTestController.$inject = ['bbModal'];

    WizardTestModalController.$inject = ['$window', 'bbWizardNavigator'];

    angular.module('stache')
        .controller('WizardTestController', WizardTestController)
        .controller('WizardTestModalController', WizardTestModalController);

}());

﻿
