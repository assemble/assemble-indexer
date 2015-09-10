'use strict';

var lazy = require('lazy-cache')(require);
lazy('extend-shallow', 'extend');

/**
 * Default method for creating a key for a new index view.
 *
 * ```js
 * var key = utils.defaultCreateKey(page, locals);
 * ```
 *
 * @param  {Object} `page` Page data for index view that the key is being created for.
 * @param  {Object} `locals` Combined locals for this index view.
 * @return {String} New key to be used
 */

lazy.defaultCreateKey = function (page, locals) {
  var key = 'index.hbs';
  if (!page.isFirst) {
    key = page.current + '/' + key;
  }
  return key;
};

/**
 * Default method for creating a new index view.
 *
 * ```js
 * var view = utils.defaultCreateView(locals);
 * ```
 *
 * @param  {Object} `locals` Combined locals for this index view.
 * @return {Object} New obj or View instance to be used as the index view
 */

lazy.defaultCreateView = function (locals) {
  return {content: '', locals: locals};
};

/**
 * Expose `utils`
 */

module.exports = lazy;
