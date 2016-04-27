'use strict';

import './layout-app.js';

describe('AppRoute', () => {
    let $state,
        url = '',
        state = 'app',
        currentState;

    beforeEach(angular.mock.module('app'));

    beforeEach(inject((_$state_) => {
        $state = _$state_;

        currentState = $state.get(state);
    }));

    it(`should respond to '${url}' URL`, () => {
        expect($state.href(state)).toEqual(url);
    });

    it('should have $state abstract set to `true`', () => {
        expect(currentState.abstract).toEqual(true);
    });

    it('should have template to be defined', () => {
        expect(currentState.template).toBeDefined();
    });
});
