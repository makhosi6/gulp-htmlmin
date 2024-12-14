'use strict';

const PluginError = require('plugin-error');
const htmlmin = require('html-minifier');
const through = require('through2');

module.exports = options => {
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
        let contents = buf.toString();
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
