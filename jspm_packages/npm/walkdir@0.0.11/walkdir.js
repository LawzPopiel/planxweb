/* */ 
(function(process) {
  var EventEmitter = require("events").EventEmitter,
      _fs = require("fs"),
      _path = require("path"),
      sep = _path.sep || '/';
  module.exports = walkdir;
  walkdir.find = walkdir.walk = walkdir;
  walkdir.sync = function(path, options, cb) {
    if (typeof options == 'function')
      cb = options;
    options = options || {};
    options.sync = true;
    return walkdir(path, options, cb);
  };
  function walkdir(path, options, cb) {
    if (typeof options == 'function')
      cb = options;
    options = options || {};
    var fs = options.fs || _fs;
    var emitter = new EventEmitter(),
        dontTraverse = [],
        allPaths = (options.return_object ? {} : []),
        resolved = false,
        inos = {},
        stop = 0,
        pause = null,
        ended = 0,
        jobs = 0,
        job = function(value) {
          jobs += value;
          if (value < 1 && !tick) {
            tick = 1;
            process.nextTick(function() {
              tick = 0;
              if (jobs <= 0 && !ended) {
                ended = 1;
                emitter.emit('end');
              }
            });
          }
        },
        tick = 0;
    emitter.ignore = function(path) {
      if (Array.isArray(path))
        dontTraverse.push.apply(dontTraverse, path);
      else
        dontTraverse.push(path);
      return this;
    };
    var statIs = [['isFile', 'file'], ['isDirectory', 'directory'], ['isSymbolicLink', 'link'], ['isSocket', 'socket'], ['isFIFO', 'fifo'], ['isBlockDevice', 'blockdevice'], ['isCharacterDevice', 'characterdevice']];
    var statter = function(path, first, depth) {
      job(1);
      var statAction = function fn(err, stat, data) {
        job(-1);
        if (stop)
          return;
        if (err || !stat) {
          emitter.emit('fail', path, err);
          return;
        }
        var fileName = _path.basename(path);
        var fileKey = stat.dev + '-' + stat.ino + '-' + fileName;
        if (inos[fileKey] && stat.ino)
          return;
        inos[fileKey] = 1;
        if (first && stat.isDirectory()) {
          emitter.emit('targetdirectory', path, stat, depth);
          return;
        }
        emitter.emit('path', path, stat, depth);
        var i,
            name;
        for (var j = 0,
            k = statIs.length; j < k; j++) {
          if (stat[statIs[j][0]]()) {
            emitter.emit(statIs[j][1], path, stat, depth);
            break;
          }
        }
      };
      if (options.sync) {
        var stat,
            ex;
        try {
          stat = fs.lstatSync(path);
        } catch (e) {
          ex = e;
        }
        statAction(ex, stat);
      } else {
        fs.lstat(path, statAction);
      }
    },
        readdir = function(path, stat, depth) {
          if (!resolved) {
            path = _path.resolve(path);
            resolved = 1;
          }
          if (options.max_depth && depth >= options.max_depth) {
            emitter.emit('maxdepth', path, stat, depth);
            return;
          }
          if (dontTraverse.length) {
            for (var i = 0; i < dontTraverse.length; ++i) {
              if (dontTraverse[i] == path) {
                dontTraverse.splice(i, 1);
                return;
              }
            }
          }
          job(1);
          var readdirAction = function(err, files) {
            job(-1);
            if (err || !files) {
              emitter.emit('fail', path, err);
              return;
            }
            if (!files.length) {
              emitter.emit('empty', path, stat, depth);
              return;
            }
            if (path == sep)
              path = '';
            for (var i = 0,
                j = files.length; i < j; i++) {
              statter(path + sep + files[i], false, (depth || 0) + 1);
            }
          };
          if (options.sync) {
            var e,
                files;
            try {
              files = fs.readdirSync(path);
            } catch (e) {}
            readdirAction(e, files);
          } else {
            fs.readdir(path, readdirAction);
          }
        };
    if (options.follow_symlinks) {
      var linkAction = function(err, path, depth) {
        job(-1);
        statter(path, false, depth);
      };
      emitter.on('link', function(path, stat, depth) {
        job(1);
        if (options.sync) {
          var lpath,
              ex;
          try {
            lpath = fs.readlinkSync(path);
          } catch (e) {
            ex = e;
          }
          linkAction(ex, _path.resolve(_path.dirname(path), lpath), depth);
        } else {
          fs.readlink(path, function(err, lpath) {
            linkAction(err, _path.resolve(_path.dirname(path), lpath), depth);
          });
        }
      });
    }
    if (cb) {
      emitter.on('path', cb);
    }
    if (options.sync) {
      if (!options.no_return) {
        emitter.on('path', function(path, stat) {
          if (options.return_object)
            allPaths[path] = stat;
          else
            allPaths.push(path);
        });
      }
    }
    if (!options.no_recurse) {
      emitter.on('directory', readdir);
    }
    emitter.once('targetdirectory', readdir);
    emitter.once('fail', function(_path, err) {
      if (path == _path) {
        emitter.emit('error', path, err);
      }
    });
    statter(path, 1);
    if (options.sync) {
      return allPaths;
    } else {
      emitter.end = emitter.stop = function() {
        stop = 1;
      };
      var emitQ = [];
      emitter.pause = function() {
        job(1);
        pause = true;
        emitter.emit = function() {
          emitQ.push(arguments);
        };
      };
      emitter.resume = function() {
        if (!pause)
          return;
        pause = false;
        job(-1);
        emitter.emit = EventEmitter.prototype.emit;
        var q = emitQ;
        emitQ = [];
        while (q.length) {
          emitter.emit.apply(emitter, q.shift());
        }
      };
      return emitter;
    }
  }
})(require("process"));
