'use strict';

var merge = require('mixin-deep');

/**
 * Add `addIndices` to an [assemble][] collection that will
 * add index views to the collection when given an array of pages.
 *
 * ```
 * var archives = app.create('archives')
 *   .use(indexer())
 *   .addIndices(pages);
 * ```
 *
 * @param  {Object} `options`
 * @param  {Object} `options.index` Optional instance of `View` to use as the basis for the index views being added. Required if `createView` is not passed on plugin or method options.
 * @param  {Function} `options.createView` Function to create a view instance for the index view being added. Required if `index` is not passed on plugin or method options.
 * @return {Function} Function to use as a plugin for [assemble][]
 * @api public
 * @name indexer
 */

module.exports = function indexer(options) {
  options = options || {};

  /**
   * Plugin passed to [assemble][] `.use` method.
   *
   * @param  {Object} `collection` collection instance the plugin is added to.
   */

  return function plugin(collection) {
    if (!collection.isViews && !collection.isList) {
      return collection;
    }

    collection.define('addIndices', function(pages, opts) {
      opts = merge({}, options, opts);

      var createView = opts.createView;
      if (typeof createView !== 'function') {
        var index = opts.index;
        createView = createViewFn(index);
        delete opts.index;
      }

      pages.forEach(function(pagination) {
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
  if (!index || typeof index !== 'object' || !index.isView) {
    throw new Error('expected index to be an instance of View');
  }

  return function(locals) {
    var view = index.clone({deep: true});
    view.locals = merge({}, view.locals, locals);

    if (typeof view.permalink === 'function') {
      view.permalink();
      return view;
    }
    return view;
  };
}
