'use strict';

var lazy = require('lazy-cache')(require);
lazy('extend-shallow', 'extend');

lazy.defaultCreateKey = function (page, locals) {
  var key = 'index.hbs';
  if (!page.isFirst) {
    key = page.current + '/' + key;
  }
  return key;
};

lazy.defaultCreateView = function (locals) {
  return {content: '', locals: locals};
};

module.exports = lazy;
