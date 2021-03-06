
import _ from 'lodash';
import moment from 'moment';

class ParserHelper {
    isContainer(value){
        return _.isArray(value) || (_.isObject(value) && Object.prototype.toString.call(value) == "[object Object]");
    }
    isObject(value){
        return Object.prototype.toString.call(value) == "[object Object]";
    }
    isDate(value) {
        return Object.prototype.toString.call(value) == "[object Date]";
    }
    isDateString(date) {

        if(!date) {
            return false;
        }

        if(!isNaN(Number(date))) {
            return false;
        }

        if ( !_.isNumber(date) && (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) )
            && (moment(date).format().indexOf(date) !== -1 || date.match(/^\d+-\d+-\d+T\d+:\d+:\d+/) )) {
            return true;
        }

        return false;

    }
    convertToNumber(value) {
        if(_.isString(value) && !isNaN(value)) {
            if(value.indexOf('.') !== -1) {
                return parseFloat(value);
            } else {
                return parseInt(value, 10);
            }
        }

        return value;
    }
    isDateTimeString(value){
        if(!value) {
            return false;
        }

        if(!isNaN(Number(value))) {
            return false;
        }

        return value.match(/^\d+-\d+-\d+T\d+:\d+:\d+/) ? true : false;

    }
    getValueWithNestedKey(obj, key){
        if(key.indexOf(".")) {
            // Need to deal with arrays
            var keys = key.split(".");
            var lastHash = keys.pop();
            while(key = keys.shift()) {

                if(_.isString(key) && key.indexOf("[") === 0) {
                    key = key.replace("[", "").replace("]", "");
                    key = parseInt(key, 10);
                }

                if(!_.has(obj, key) ) {
                    return null;
                }

                obj = obj[key];
            }
            key = lastHash;
        }
        if (_.has(obj, key)) {
            return obj[key];
        }

        return null;
    }
    /*
     Array keys need to have brackets
     FreightVendors.[0].Name
     */
    setObjectWithNestedKey(obj, key, value) {

        if(key.indexOf(".")) {
            // Need to deal with arrays
            var keys = key.split(".");
            var lastHash = keys.pop();
            for(var i = 0; i < keys.length; i++) {
                let keyPointer = keys[i];

                if(_.isString(keyPointer) && keyPointer.indexOf("[") === 0) {
                    keyPointer = keyPointer.replace("[", "").replace("]", "");
                    keyPointer = parseInt(keyPointer, 10);
                }

                if(!_.has(obj, keyPointer) || !_.isObject(obj[keyPointer])) {

                    var newObj = {};
                    var nextKey = i + 1;

                    if(keys.length > nextKey && _.isString(keys[nextKey]) && keys[nextKey].indexOf("[") === 0) {
                        newObj = [];
                    }


                    obj[keyPointer] = newObj;

                }

                obj = obj[keyPointer];
            }

            //obj[lastHash] = {};
            key = lastHash;
        }

        obj[key] = value;


        return true;
    }
    /*
        Loops through an object and converts any date objects to date strings
     */
    convertToDateStrings(obj) {

        if(!this.isContainer(obj)) {
            return obj;
        }

        _.each(obj, function(value, key){

            if(this.isContainer(value)){
                this.convertToDateStrings(value);

            }

            if(_.isDate(value)) {
                obj[key] = moment(value).format('YYYY-MM-DD');
            }

        }, this);

    }
    convertToDateString(datevalue){
        var date = datevalue;
        //if(this.isDateString(datevalue)) {
        //    date = new Date(datevalue);
        //
        //}

        if(date instanceof moment) {
            return date.format("YYYY-MM-DD");
        }

        return moment(date).format("YYYY-MM-DD");
    }
}

export default new ParserHelper();