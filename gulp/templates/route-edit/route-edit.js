'use strict';

import {RouteConfig} from '/app/ng-decorators'; // jshint unused: false
import _ from 'lodash';
// TODO NEED TO MAKE THIS PATH DYNAMIC LIKE APP ABOVE AS WELL
import DEFAULTS from '/app/configurations';
const ID_NAME = DEFAULTS.COLLECTION_IDENTIFIER_NAME;

//start-non-standard
@RouteConfig('app.<%= path %>.edit', {
    url: '/:id/edit',
    template: template,
    resolve: {
        editItem: (<%= serviceName %>, $stateParams) => <%= serviceName %>.get($stateParams.id),
    }
})
<% if(enableAdd) {%>
@RouteConfig('app.<%= path %>.add', {
    url: '/add',
    template: template,
    resolve: {
        editItem: () => {
            return {};
        },
    }
})
<% } %>
//end-non-standard


class <%= className %> {
    constructor(editItem, <%= serviceName %>, $state){
        this.editItem = editItem;

        this.service = <%= serviceName %>;
        this.$state = $state;
    }

    submit(){

        this.service.submit(this.editItem).then(() => this.$state.go("app.<%= parentPath %>"));
    }
}

export default <%= className %>;


/* .GULP-IMPORTS-START */ import template from './<%= filename %>.html!text'; /* .GULP-IMPORTS-END */