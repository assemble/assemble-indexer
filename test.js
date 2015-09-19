'use strict';

require('mocha');
require('should');
var templates = require('templates');
var assert = require('assert');
var fs = require('fs');

var indexer = require('./');

var List = templates.List;
var View = templates.View;

describe('indexer', function () {
  it('should add `addIndices` to a templates collection', function () {
    var app = templates();
    app.create('archives')
      .use(indexer());
    app.archives.should.have.property('addIndices');
  });

  it('should create index views with default options', function () {
    var app = templates();
    var list = new List();
    list.addItems([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer())
      .addIndices(pages);

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'index.hbs';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
    });
  });

  it('should create index views with custom createKey function on plugin options', function () {
    var app = templates();
    var list = new List();
    list.addItems([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer({
        createKey: function (page) {
          return 'page-' + page.current + '.hbs';
        }
      }))
      .addIndices(pages);

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = 'page-' + page.current + '.hbs';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
    });
  });

  it('should create index views with custom createView function on plugin options', function () {
    var contents = fs.readFileSync('fixtures/archive-index.hbs');
    var archiveIndexView = new View({contents: contents});
    var app = templates();
    var list = new List();
    list.addItems([
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
          return view;
        }
      }))
      .addIndices(pages);

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'index.hbs';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
      assert.deepEqual(app.views.archives[key].contents, contents);
    });
  });

  it('should create index views with custom createKey function on method options', function () {
    var app = templates();
    var list = new List();
    list.addItems([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer())
      .addIndices(pages, {}, {
        createKey: function (page) {
          return 'page-' + page.current + '.hbs';
        }
      });

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = 'page-' + page.current + '.hbs';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
    });
  });

  it('should create index views with custom createView function on method options', function () {
    var contents = fs.readFileSync('fixtures/archive-index.hbs');
    var archiveIndexView = new View({contents: contents});
    var app = templates();
    var list = new List();
    list.addItems([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer())
      .addIndices(pages, {}, {
        createView: function (locals) {
          var view = archiveIndexView.clone();
          view.locals = locals;
          return view;
        }
      });

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'index.hbs';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
      assert.deepEqual(app.views.archives[key].contents, contents);
    });
  });

  it('should create index views with additional locals', function () {
    var contents = fs.readFileSync('fixtures/archive-index.hbs');
    var archiveIndexView = new View({contents: contents});
    var app = templates();
    var list = new List();
    list.addItems([
      {path: 'a.hbs', content: 'aaa'},
      {path: 'b.hbs', content: 'bbb'},
      {path: 'c.hbs', content: 'ccc'},
      {path: 'd.hbs', content: 'ddd'},
      {path: 'e.hbs', content: 'eee'},
    ]);
    var pages = list.paginate({limit: 2});

    app.create('archives')
      .use(indexer())
      .addIndices(pages, {title: 'Archives'}, {
        createView: function (locals) {
          var view = archiveIndexView.clone();
          view.locals = locals;
          return view;
        }
      });

    var keys = Object.keys(app.views.archives);
    keys.length.should.equal(pages.length);
    pages.forEach(function (page) {
      var key = (page.isFirst ? '' : page.current + '/') + 'index.hbs';
      assert.equal(keys.indexOf(key) === -1, false);
      assert.deepEqual(app.views.archives[key].locals.title, 'Archives');
      assert.deepEqual(app.views.archives[key].locals.pagination, page);
      assert.deepEqual(app.views.archives[key].contents, contents);
    });
  });
});
