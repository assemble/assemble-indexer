/*!
 * templates-indexer <https://github.com/doowb/templates-indexer>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';
var utils = require('./utils');

/**
 * Add `addIndices` to a [templates][] collection that will
 * add index views to the collection when given an array of pages.
 *
 * ```
 * var archives = app.create('archives')
 *   .use(indexer())
 *   .addIndices(pages);
 * ```
 *
 * @param  {Object} `options`
 * @param  {Function} `options.createView` Function to create a view object for the index view being added.
 * @param  {Function} `options.createKey` Function to create a key for the index view being added.
 * @return {Function} Function to use as a plugin for [templates][]
 * @api public
 * @name indexer
 */

module.exports = function indexer(options) {
  options = options || {};

  /**
   * Plugin passed to [templates][] `.use` method.
   *
   * @param  {Object} `collection` collection instance the plugin is added to.
   */

  return function plugin (collection) {

    /**
     * `addIndices` method decorated onto the given `collection`
     * Iterators over a list of `pages` (built with `list.paginate`)
     * and adds each page to the collection as a new index view
     *
     * ```js
     * collection.addIndices(pages, locals);
     * ```
     *
     * @param  {Array} `pages` Array of pages return from `list.paginate`
     * @param  {Object} `locals` Optional locals to add to each index view.
     * @param  {Object} `opts` Method options to override plugin options.
     * @param  {Function} `options.createView` Function to create a view object for the index view being added.
     * @param  {Function} `options.createKey` Function to create a key for the index view being added.
     * @return {Object} Returns `collection` to enable chaining
     * @api public
     * @name  addIndices
     */

    collection.define('addIndices', function (pages, locals, opts) {
      opts = utils.extend({
        createView: utils.defaultCreateView,
        createKey: utils.defaultCreateKey
      }, options, opts);

      pages.forEach(function (page) {
        var ctx = utils.extend({
          pages: pages,
          pagination: page
        }, locals);

        var key = opts.createKey(page, ctx);
        collection.addView(key, opts.createView(ctx));
      });
      return collection;
    });
  };
};
