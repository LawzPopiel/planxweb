'use strict';

import gulp from 'gulp';
import jshint from 'gulp-jshint';
import path from '../paths';

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 *
 * @return {Stream}
 */
gulp.task('jshint', () => {
    return gulp.src(path.gulpfile/*path.app.scripts.concat(path.gulpfile)*/)
        .pipe(jshint(`${path.root}/.jshintrc`))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});
