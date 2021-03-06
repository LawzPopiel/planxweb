'use strict';

import 'angular-mocks';
import './alert-success.js';

describe('AlertSuccess', () => {

    beforeEach(angular.mock.module('ngDecorator'));

    describe('Component', () => {
        let $compile, $rootScope, scope, render, element,
            component = '<alert-success></alert-success>', successMessage = 'Success!';

        beforeEach(inject((_$compile_, _$rootScope_) => {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();

            render = () => {
                let element = angular.element(component);
                let compiledElement = $compile(element)(scope);
                $rootScope.$digest();

                return compiledElement;
            };
        }));

        it('should contain alert-success component', () => {
            element = render();

            expect(element.controller('alertSuccess')).toBeDefined();
            expect(element['0']).not.toEqual(component);
        });

        it('should have `Success!` alert title defined', () => {
            component = `<alert-success has-success="true" success-message="'${successMessage}'"></alert-success>`;
            element = render();
            const errorAlertTitle = element.find('strong');

            expect(errorAlertTitle.text()).toEqual('Success!');
        });

        it('should render and display the error message when there is error', () => {
            component = `<alert-success has-success="true" success-message="'${successMessage}'"></alert-success>`;
            element = render();
            const alertDangerHtml = angular.element(element[0].querySelector('div[ng-if]'));
            const successMessageText = angular.element(element[0].getElementsByClassName('ng-binding'));

            expect(alertDangerHtml[0]).toBeDefined();
            expect(successMessageText.text()).toEqual(successMessage);
        });

        it('should not render and display the error message when there is no error', () => {
            component = `<alert-success has-success="false" success-message="''"></alert-danger>`;
            element = render();
            const alertDangerHtml = angular.element(element[0].querySelector('div[ng-if]'));

            expect(alertDangerHtml[0]).not.toBeDefined();
        });

        it('should hide the error message when x button is clicked', () => {
            component = `<alert-success has-success="true" success-message="'${successMessage}'"></alert-success>`;
            element = render();
            angular.element(element[0].getElementsByClassName('close')).triggerHandler('click');
            $rootScope.$digest();

            const alertDangerHtml = angular.element(element[0].querySelector('div[ng-if]'));
            expect(alertDangerHtml[0]).not.toBeDefined();
        });
    });
});
