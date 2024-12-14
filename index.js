'use strict';

const PluginError = require('plugin-error');
const path = require('node:path')
const htmlmin = require('html-minifier');
const through = require(path.resolve(__dirname, 'through2.js'));

module.exports = function (options) {
  return through.obj(function (file, enc, next) {
    if (file.isNull()) {
      next(null, file);
      return;
    }

    const minify = (buf, _, cb) => {
      try {
        let contents = Buffer.from(htmlmin.minify(buf.toString(), options));
        if (next === cb) {
          file.contents = contents;
          cb(null, file);
          return;
        }
        cb(null, contents);
        next(null, file);
      } catch (err) {
        console.log("Continue with errors: ", {
          file
        });
        let contents = buf;
        if (next === cb) {
          file.contents = contents;
          cb(null, file);
          return;
        }
        cb(null, contents);
        next(null, file);
      }
    };

    if (file.isStream()) {
      file.contents = file.contents.pipe(through(minify));
    } else {
      minify(file.contents, null, next);
    }
  });
};