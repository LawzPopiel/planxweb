'use strict';

import _ from 'lodash';

class TestPage {
    getPage(url) {
        this.pageOpts = {};
        this.pageOpts.url = url;

        return {
            testForm: (formName, opts)=>{


            },
            testList: ()=>{

            }
        }
    }
}

export default TestPage;