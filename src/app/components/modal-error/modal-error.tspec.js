'use strict';

import 'angular-mocks';
import './modal-error.js';

describe('ModalError', () => {

    beforeEach(angular.mock.module('ngDecorator'));

    describe('Component', () => {
        let $compile, $rootScope, scope, render, element,
            component = '<error-modal error="vm.error" cancel="vm.cancel()"></error-modal>', vm = {error: {status: 404}, cancel: () => {}};

        beforeEach(inject((_$compile_, _$rootScope_) => {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            scope.vm = vm;

            render = () => {
                let element = angular.element(component);
                let compiledElement = $compile(element)(scope);
                $rootScope.$digest();

                return compiledElement;
            };
        }));

        it('should contain `error-modal` component', () => {
            element = render();

            expect(element.controller('errorModal')).toBeDefined();
            expect(element['0']).not.toEqual(component);
        });

        describe('Show title', () => {
            it('should have `Error` modal title defined', () => {
                element = render();
                const errorModalTitle = angular.element(element[0].getElementsByClassName('modal-title'));

                expect(errorModalTitle.text()).toEqual('Error');
            });

            it('should have `Error!` alert title defined', () => {
                element = render();
                const errorAlertTitle = element.find('strong');

                expect(errorAlertTitle.text()).toEqual('Error!');
            });
        });

        describe('Show error messages', () => {
            it('should render 404 error message', () => {
                element = render();
                const errorMessageText = angular.element(element[0].getElementsByClassName('ng-binding'));

                expect(errorMessageText.text()).toEqual('The requested record could not be found.');
            });

            it('should render 500 error message', () => {
                scope.vm.error.status = 500;
                element = render();
                const errorMessageText = angular.element(element[0].getElementsByClassName('ng-binding'));

                expect(errorMessageText.text()).toEqual('An error occurred while processing your request. Please try again.');
            });
        });

        describe('Close modal', () => {
            it('should have `×` label defined for close button', () => {
                element = render();

                expect(angular.element(element[0].getElementsByClassName('close')).text()).toEqual('×');
            });

            it('should close the Error modal when `×` button is clicked', () => {
                spyOn(vm, 'cancel');
                element = render();
                angular.element(element[0].getElementsByClassName('close')).triggerHandler('click');

                expect(vm.cancel).toHaveBeenCalled();
            });

            it('should have `OK` label defined for close button', () => {
                element = render();

                expect(angular.element(element[0].getElementsByClassName('btn-success')).text()).toEqual('OK');
            });

            it('should close the Error modal when `OK` button is clicked', () => {
                spyOn(vm, 'cancel');
                element = render();
                angular.element(element[0].getElementsByClassName('btn-success')).triggerHandler('click');

                expect(vm.cancel).toHaveBeenCalled();
            });
        });
    });
});
