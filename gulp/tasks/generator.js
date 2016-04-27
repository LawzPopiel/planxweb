'use strict';

import debug from 'gulp-debug';

import gulp from 'gulp';
import path from 'path';
import template from 'gulp-template';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import fs from "fs";
import file from "gulp-file";
import es from "event-stream";
import runSequence from "run-sequence";

import {argv as yargs} from 'yargs';
import {PluginError as Error} from 'gulp-util';
import _ from 'lodash';

/*
    ==========================================
                GLOBAL VARS
 */

var root = 'src';
var componentName = 'app/components';
var routeName = 'app/routes/layout-app';
var serviceName = 'app/services';

var args = {
    route: null
};

/*
 ===========================================
                GULP TASKS
 */
gulp.task('generate-includes', function(cb){
    writeIncludeFile(cb);
});
gulp.task('component', ['add-component'], function(){
    return true;
});
gulp.task('route-group', function(callback){
    runSequence('create-route-group', 'add-route', callback);
});
gulp.task('route', ['add-route'], function(){
    return true;
});
gulp.task('service', ['add-service'], function(){
    return true;
});
gulp.task('route.list', ['add-list'], function(){
    return true;
});
gulp.task('route.edit', ['add-route-edit'], function(){

});






/*
    ===========================================
                CUSTOM FUNCTIONS
 */
var resolveTo = function(resolvePath) {
    return function(glob) {
        glob = glob || '';
        return path.join(root, resolvePath, glob);
    }
};
var resolveToApp = resolveTo('app'); // app/{glob}
var resolveToComponents = resolveTo(componentName); // app/components/{glob}
var resolveToRoutes = resolveTo(routeName); // app/components/{glob}
var resolveToServices = resolveTo(serviceName); // app/components/{glob}

var getTemplateLocation = function(type){
    var dir = __dirname.substr(0, __dirname.lastIndexOf("\\"));
    return path.join(dir, 'templates', type + '/**/*.**')
};

var capitalize = function(val){
    return val.charAt(0).toUpperCase() + val.slice(1);
};
var checkForCapitals = function(val){
    if(!val){
        return false;
    }
    var rg = /[A-Z]/;

    return val.match(rg);
};
var requiredProps = function(args, requiredProperties) {
    var hasProps = true;
    _.each(requiredProperties, (propName)=> {
        !_.has(args, propName) ? hasProps = false : null;
    });

    return hasProps;
};

var makePrettyCase = function(name){
    var split = name.split("-");
    var returnName = "";
    _.each(split, function(bit){
        returnName += capitalize(bit) + " ";
    });

    return returnName.trim();
};
var makeCamelCase = function(name){
    var split = name.split("-");
    var returnName = "";
    _.each(split, function(bit){
        returnName += capitalize(bit);
    });

    return returnName;
};
var hasFile = function(fullSrc){
    var hasFile = false;
    fullSrc = "./" + fullSrc;
    try {
        // Query the entry
        var stats = fs.lstatSync(fullSrc);

        if(stats) {
            hasFile = true;
        }

    }
    catch (e) {
        // ...
    }

    return hasFile;
};
function getJSFileSrc(dir, done){
    var chopDir = dir;
    var walk = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) return done(null, results);
                file = dir + '/' + file;
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, function(err, res) {
                            results = results.concat(res);
                            next();
                        });
                    } else {
                        var fileSrc = file.replace(chopDir + "/", "");
                        if(fileSrc.indexOf("layout-app") !== 0 && fileSrc.indexOf(".js") === fileSrc.length - 3) {
                            fileSrc = fileSrc.substr(0, fileSrc.lastIndexOf(".js"));
                            results.push(fileSrc);

                        }
                        next();
                    }
                });
            })();
        });
    };

    walk(dir, done);
}
function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory() && file.indexOf("_") !== 0;
        });
}
function getIncludeString(src, append){
    var components = getFolders(src);
    console.log(src);

    append = append || "";

    if(append.length) {
        append = "." + append;
    }

    var excludeName = src.substr(src.lastIndexOf("\\") + 1);

    var componentsIncludeString = "'use strict';\n\n";
    _.each(components, function(name){
        if(name.indexOf("_") === -1 && name != excludeName) {
            componentsIncludeString += "import './" + name + "/" + name + append + "';\n";
        }
    });

    return componentsIncludeString;
}

/*
    ===========================================
        PARAM VALIDATION
 */
function validateNameParam(funcName){
    if(!requiredProps(yargs, ["name"])){
        throw new Error(funcName, "A component needs a name.");
        return false;
    }
    if(checkForCapitals(yargs.name)){
        throw new Error(funcName, "Your name cannot be camelcase. Correct naming standard: 'admin' or 'admin-view'.");
        return false;
    }

}
function validateRouteParam(funcName){
    if(!requiredProps(yargs, ["route"])){
        throw new Error(funcName, "A route needs the '--route name' param.");
        return false;
    }
    if(checkForCapitals(yargs.route)){
        throw new Error(funcName, "Your route cannot be camelcase. Correct naming standard: 'admin' or 'admin-view'.");
        return false;
    }
    if(yargs.route.indexOf("\\") !== -1 || yargs.route.indexOf("/") !== -1) {
        throw new Error(funcName, "Your route must use . as separators. 'admin-section.dropdowns'.");
        return false;
    }

}
function validateParentParam(funcName, parent){
    if(parent.indexOf("app") === 0) {
        throw new Error(funcName, "Parent cannot start with 'app'.");
        return false;
    }

    if(parent.indexOf("\\") !== -1 || parent.indexOf("/") !== -1) {
        throw new Error(funcName, "Your parent must have period separators, not slashes");
        return false;
    }
}
/*
    ===========================================
        MODIFY FOLDER/FILE STRUCTURE TASKS
 */
var copyTemplates = function(templateType, vars, destPath) {

    if(vars.path) {
        vars.prettyName = makePrettyCase(vars.path);
    }
    return gulp.src(getTemplateLocation(templateType))
        .pipe(template(vars))
        .pipe(rename(function(path){
            path.basename = path.basename.replace(templateType, vars.filename);
        }))
        .pipe(gulp.dest(destPath));
};
var makeIncludeFile = function(src, name) {
    return gulp.src(src)
        .pipe(file(name, getIncludeString(src)))
        .pipe(gulp.dest(src));
};
var writeFile = function(src, name, contents, callback){
    console.log("WRITE FILE: ", path.join(src, name));
    return fs.writeFile(path.join(src, name), contents, callback);
};

//var writeRouteInclude = function(parent){
//    var parentPath, parentName;
//    if(parent.length == 0) {
//        parentPath = resolveToRoutes();
//        parentName = "layout-app";
//
//    } else {
//        parentPath = path.join(resolveToRoutes(), parent.replace(/\./g, "\\"));
//        parentName = parent;
//
//        if(parent.indexOf(".") !== -1) {
//
//            parentName = parent.substr( parent.lastIndexOf('.') + 1);
//        }
//
//    }
//
//    console.log("writeRouteInclude Parent: ", parentPath, parentName);
//
//    var gulpStringStart = "/* .GULP-IMPORTS-START */ ";
//    var gulpStringContents = "import './" + parentName + ".includes.js';";
//    var gulpStringEnd = " /* .GULP-IMPORTS-END */";
//
//
//    if(hasFile(path.join(parentPath, parentName + ".html"))) {
//        gulpStringContents += "import template from './" + parentName + ".html!text';";
//    }
//    var gulpInclude = gulpStringStart + gulpStringContents + gulpStringEnd;
//
//
//    writeFile(parentPath, parentName + ".includes.js", getIncludeString( parentPath ));
//
//    console.log("writeRoute parent", parentPath, parentName);
//console.log("=========", path.join(parentPath, parentName + ".js"));
//    return gulp.src(path.join(parentPath, parentName + ".js"))
//        .pipe(replace(/.+GULP-IMPORTS-START.+GULP-IMPORTS-END.+/, gulpInclude))
//        .pipe(gulp.dest(parentPath));
//
//};

function writeIncludeFile(cb) {
    var src = resolveToRoutes();

    getJSFileSrc(src, function(err, results){
        if(err) throw err;

        var output = "'use strict';\n";

        _.each(results, function(file) {
            output += "import './" + file + "';\n";
        })

        writeFile(resolveToRoutes(), 'layout-app.includes.js', output, cb);
    });
}

/*
    COMPONENT
 */
gulp.task('create-component', function(){

    validateNameParam("create-component");

    var name = args.name || yargs.name,
        className = makeCamelCase(name);




    var destPath = path.join(resolveToComponents(), name);

    var templateVars = {
        filename: name,
        prettyName: makePrettyCase(name),
        name: name,
        className: className
    };

    return copyTemplates("component", templateVars, destPath);


});
gulp.task('add-component', ['create-component'],function(cb){

    writeFile(resolveToComponents(), "components.js", getIncludeString( resolveToComponents() ), cb);

});

/*
    ROUTE GROUP
 */
gulp.task('create-route-group', function(cb){

    validateRouteParam("create-route-group");


    var name = args.route || yargs.route, parent = '', className = '', uiScopeName = name;

    if(name.indexOf(".") !== -1) {
        className = makeCamelCase(name.replace(/\./g, "-"));
        parent = name.substr( 0, name.lastIndexOf("."));
        name = name.substr( name.lastIndexOf(".") + 1);

    } else {
        className = makeCamelCase(name);
    }

    var destPath = path.join(resolveToRoutes(), parent.replace(/\./g, "\\"), name);

    var templateVars = {
        filename: name,
        name: name,
        urlName: "",
        path: uiScopeName,
        className: className
    };

    if(parent) {
        args.route = parent + "." + name + ".index";
    } else {
        args.route = name + ".index";
    }

    return copyTemplates("route-group", templateVars, destPath);
});

/*
 ROUTE
 */

gulp.task('create-route', function(){

    validateRouteParam("create-route");

    var name = args.route || yargs.route, parent = '',
        className = '',
        uiScopeName = name,
        filename = name.replace(/\./g, '-');

    if(name.indexOf(".") !== -1) {

        className = makeCamelCase(name.replace(/\./g, "-"));
        parent = name.substr( 0, name.lastIndexOf("."));
        name = name.substr( name.lastIndexOf(".") + 1);

    } else {
        className = makeCamelCase(name);
        parent = "";
    }

    var destPath = path.join(resolveToRoutes(), parent.replace(/\./g, "\\"), name);

    console.log(destPath);
    var urlName = "/";
    if(name != "index") {
        urlName = "/" + name;
    }

    var templateVars = {
        filename: filename,
        name: name,
        urlName: urlName,
        path: uiScopeName,
        className: className
    };

    return copyTemplates("route", templateVars, destPath);
});
gulp.task('add-route', ['create-route'],function(cb){
    writeIncludeFile(cb);
});

/*
 ROUTE EDIT
 */

gulp.task('create-route-edit', function(){

    validateRouteParam("create-route-edit");

    if(yargs.route.endsWith(".edit")) {
        throw new Error("create-route-edit", "Your edit route cannot end in '.edit'. This task will do that for you. Eg: main-work ")
    }

    if(!yargs.service) {
        throw new Error('create-route-edit', "You must provide a service param. Eg: --service MainWorkEntryService");
        return false;
    }

    if(!yargs.service.endsWith("Service")){
        throw new Error('create-route-edit', "Your service must have service at the end. Eg: MainWorkEntryService");
        return false;
    }




    var name = args.route || yargs.route, parent = '',
        className = '',
        uiScopeName = name,
        filename = name.replace(/\./g, '-'),
        service = yargs.service,
        prettyName = '',
        disableAdd = (_.has(yargs, "disable-add") ? true : false)
        ;

    if(name.indexOf(".") !== -1) {

        className = makeCamelCase(name.replace(/\./g, "-"));
        prettyName = name.substr( name.lastIndexOf(".") + 1);


    } else {
        className = makeCamelCase(name);
        prettyName = name;
    }

    parent = name;
    name = "edit";
    className += "Edit";


    filename += "-edit";


    var destPath = path.join(resolveToRoutes(), parent.replace(/\./g, "\\"), name);

    var urlName = "/";
    if(name != "index") {
        urlName = "/" + name;
    }

    var templateVars = {
        prettyName: makePrettyCase(prettyName),
        filename: filename,
        name: name,
        urlName: urlName,
        path: uiScopeName,
        enableAdd: !disableAdd,
        className: className,
        formName: className,
        parentPath: parent,
        serviceName: service
    };

    return copyTemplates("route-edit", templateVars, destPath);
});
gulp.task('add-route-edit', ['create-route-edit'],function(cb){
    writeIncludeFile(cb);
});


/*
 SERVICE
 */
gulp.task('create-service', function(){
    validateNameParam("make-service");

    if(yargs.name.indexOf("service") !== -1){
        throw new Error('make-service', "Your name cannot have 'service' in it");
        return false;
    }

    if(!yargs.api) {
        throw new Error('make-service', "You must pass the --api param. This tells what name to call when making api calls. Eg. MainEntry in /api/MainEntry/");
        return false;
    }

    var name = yargs.name,
        api = yargs.api,
        className = makeCamelCase(name);


    var destPath = path.join(resolveToServices(), name);

    var templateVars = {
        filename: name,
        name: name,
        apiName: api,
        className: className + "Service"
    };
    console.log(templateVars);

    return copyTemplates("services", templateVars, destPath);


});

gulp.task('add-service',['create-service'],function(cb){

    writeFile(resolveToServices(), "services.js", getIncludeString( resolveToServices(), "service" ));
    writeFile(resolveToServices(), "mock-services.js", getIncludeString( resolveToServices(), "mock" ));

    cb();

});

/*
    POPUP
 */

gulp.task('make-popup', function(){

});

/*
    LIST
 */

gulp.task('create-list', function(){
    validateRouteParam("make-list");

    if(!yargs.service) {
        throw new Error('create-list', "You must pass a param service this list will use. Eg, '--service UserService'");
        return false;
    }
    if(yargs.service.indexOf("Service") === -1) {
        throw new Error('create-list', "Your service name must be camelcase with Service at the end. Eg, 'UserService");
        return false;
    }

    var route = yargs.route, dirPath = yargs.route.replace(/\./g, "\\"), name = "list", lastRoute = "";


    if(route.indexOf(".") !== -1) {
        lastRoute = route.replace(/\./g, "-");
    }

    if(yargs.name) {
        validateNameParam("make-list");
         name = yargs.name;
    } else {
        name = lastRoute + "-list";
    }

    var className = makeCamelCase(name);


    var destPath = path.join(resolveToRoutes(), dirPath);

    var templateVars = {
        name: name,
        className: className,
        filename: name + ".component",
        serviceName: yargs.service
    };

    return copyTemplates("list", templateVars, destPath);




});
gulp.task('add-list', ['create-list'],function(cb){
    writeIncludeFile(cb);
});

/*
    STUB
 */

gulp.task('make-stub', function(){

});



/*
    STYLE
 */

gulp.task('make-style', function(){

});