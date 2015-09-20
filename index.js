/*!
 * assemble-indexer <https://github.com/doowb/assemble-indexer>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';
var merge = require('mixin-deep');

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
 * @return {Function} Function to use as a plugin for [templates][]
 * @api public
 * @name indexer
 */

module.exports = function indexer (options) {
  options = options || {};

  /**
   * Plugin passed to [templates][] `.use` method.
   *
   * @param  {Object} `collection` collection instance the plugin is added to.
   */

  return function plugin (collection) {
    collection.define('addIndices', function (pages, opts) {
      opts = merge({}, options, opts);

      var createView = opts.createView;
      if (typeof createView !== 'function') {
        var index = opts.index;
        createView = createViewFn(index);
        delete opts.index;
      }

      pages.forEach(function (pagination) {
        var locals = merge({}, opts);
        locals.pages = pages;
        locals.pagination = pagination;
        var view = createView(locals);
        view.key = view.url || view.path;
        collection.addView(view);
      });
      return collection;
    });
  };
};

/**
 * Default method for creating a new index view.
 *
 * ```js
 * var view = createViewFn(locals);
 * ```
 *
 * @param  {Object} `locals` Combined locals for this index view.
 * @return {Object} New View instance to be used as the index view
 */

function createViewFn (index) {
  if (typeof index !== 'object' || !index.isView) {
    throw new Error('expected index to be an instance of View');
  }

  return function (locals) {
    var view = index.clone({deep: true});
    if (typeof view.data.foo === 'undefined') {
      view.data.foo = {bar: 'baz'};
    }
    view.locals = merge({}, view.locals, locals);

    if (typeof view.permalink === 'function') {
      view.permalink(view.data.permalink, locals);
      return view;
    }
    return view;
  };
}
