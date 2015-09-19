'use strict';

require('mocha');
require('should');
var permalink = require('assemble-permalinks');
var templates = require('templates');
var assert = require('assert');
var fs = require('fs');

var indexer = require('./');

var List = templates.List;
var app, index;

describe('indexer', function () {
  beforeEach(function () {
    app = templates();
    app.initialize();
    index = app.view({path: 'index.hbs', content: ''})
      .use(permalink(':index(pagination.idx):name.html', {
        index: function (i) {
          return i ? ((i + 1) + '/') : '';
        }
      }));
  });

  it('should add `addIndices` to a templates collection', function () {
    app.create('archives')
      .use(indexer({index: index}));
    app.archives.should.have.property('addIndices');
  });

  it('should create index views with default options', function () {
    var list = new List();
    list.addList([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer({index: index}))
      .addIndices(pages);

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'index.html';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
    });
  });

  it('should create index views with custom createView function on plugin options', function () {
    var contents = fs.readFileSync('fixtures/archive-index.hbs');
    var archiveIndexView = app.view({path: 'archive-index.hbs', contents: contents})
      .use(permalink(':index(pagination.idx):name.html', {
        index: function (i) {
          return i ? ((i + 1) + '/') : '';
        }
      }));

    var list = new List();
    list.addList([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer({
        createView: function (locals) {
          var view = archiveIndexView.clone();
          view.locals = locals;
          view.permalink(view.data.permalink, locals);
          return view;
        }
      }))
      .addIndices(pages);

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'archive-index.html';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
      assert.deepEqual(app.views.archives[key].contents, contents);
    });
  });

  it('should create index views with custom createView function on method options', function () {
    var contents = fs.readFileSync('fixtures/archive-index.hbs');
    var archiveIndexView = app.view({path: 'archive-index.hbs', contents: contents})
      .use(permalink(':index(pagination.idx):name.html', {
        index: function (i) {
          return i ? ((i + 1) + '/') : '';
        }
      }));

    var list = new List();
    list.addList([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer())
      .addIndices(pages, {
        createView: function (locals) {
          var view = archiveIndexView.clone();
          view.locals = locals;
          view.permalink(view.data.permalink, locals);
          return view;
        }
      });

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'archive-index.html';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
      assert.deepEqual(app.views.archives[key].contents, contents);
    });
  });

  it('should create index views with additional locals', function () {
    var contents = fs.readFileSync('fixtures/archive-index.hbs');
    var archiveIndexView = app.view({path: 'archive-index.hbs', contents: contents})
      .use(permalink(':index(pagination.idx):name.html', {
        index: function (i) {
          return i ? ((i + 1) + '/') : '';
        }
      }));

    var list = new List();
    list.addList([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer({index: archiveIndexView}))
      .addIndices(pages, {title: 'Archives'});

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'archive-index.html';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.title, 'Archives');
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
      assert.deepEqual(app.views.archives[key].contents, contents);
    });
  });
});
