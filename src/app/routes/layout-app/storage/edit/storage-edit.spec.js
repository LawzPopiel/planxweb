'use strict';

import angular from 'angular';
import 'angular-mocks';

import chai from 'chai';
import spies from 'chai-spies';
import _ from 'lodash';
chai.use(spies);

//import StorageEdit from './storage-edit.js';

function compileRouteTemplateWithController($injector, $state, state) {
    var $rootScope = $injector.get('$rootScope');
    var $templateCache = $injector.get('$templateCache');
    var $compile = $injector.get('$compile');

    var $controller = $injector.get('$controller');

    var scope = $rootScope.$new();
    var stateDetails = $state.get(state);
    var html = $templateCache.get(stateDetails.templateUrl);

    var ctrl = scope.home = $controller('StorageEdit');
    $rootScope.$digest();
    var compileFn = $compile(angular.element('<div></div>').html(html));

    return {
        controller: ctrl,
        scope: scope,
        render: function () {
            var element = compileFn(scope);
            $rootScope.$digest();
            return element;
        }
    };
}


describe.skip("Test for forms", function(){
    beforeEach(angular.mock.module('app'));

    let $state, $rootScope, scope, $controller, currentState, createController, ctrl, render, element;
    let id = 1,
        url = `/storage/${id}/edit`,
        state = 'app.storage.edit';

    beforeEach(inject(function ($injector, _$state_) {
        var route = compileRouteTemplateWithController($injector, _$state_, state);
        ctrl = route.controller;
        scope = route.scope;
        render = function(){
            element = route.render();
        };
    }));

    it("is success", function(){
       expect(2).to.equal(2);
    });
    //beforeEach(inject((_$state_,_$rootScope_, _$controller_, _$compile_) => {
    //    $state = _$state_;
    //    $rootScope = _$rootScope_;
    //    $controller = _$controller_;
    //    $compile = _$compile_;
    //
    //    var scope = $rootScope.$new();
    //    var stateDetails = $state.get(state);
    //
    //    createController = function(args) {
    //        return $controller('StorageEdit', args);
    //    };
    //
    //
    //
    //    //chai.spy.on($state, 'go');
    //    //
    //
    //    //currentState = $state.get(state);
    //    //
    //    //
    //
    //    $state.go(state, {id: id});
    //
    //    var $stateParams = {id: id};
    //
    //}));
    //it("should bla", ()=>{
    //   dump(scope);
    //    dump(ctrl);
    //    render();
    //
    //    dump(element);
    //});

    //it(`should respond to '$(url}' URL`, ()=>{
    //   expect($state.href(state, {id: id})).to.equal(url);
    //    dump($state.controller);
    //});
    //it('should call controller', function(){
    //    dump($state.resolve);
    //    var conttrol = createController($state.resolve);
    //    dump(control);
    //    dump($state.controller);
    //    //var control = $controller('StorageEdit');
    //    //
    //    expect(control).to.be.defined;
    //});

    //describe('Check for element existence', function(){
    //    it("should access controler", ()=>{
    //
    //        $rootScope.$apply();
    //
    //      dump($state);
    //
    //        var $controller = controller("StorageEdit");
    //        dump($controller);
    //        expect(3).to.equal(2);
    //    });
    //
    //});
});