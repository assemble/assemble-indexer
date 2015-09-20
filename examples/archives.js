var path = require('path');
var async = require('async');
var writeFile = require('write');
var templates = require('templates');
var loader = require('assemble-loader');
var matter = require('parser-front-matter');
var permalink = require('assemble-permalinks');
var indexer = require('../');

var List = templates.List;
var app = templates()
  .use(loader());

app.engine('txt', require('engine-base'));

app.option('view engine', 'txt');

app.option('renameKey', function (fp) {
  return path.basename(fp, path.extname(fp));
});
app.helper('relative', require('relative'));

app.data({base: 'archives/blog'});
app.data({archiveBase: 'archives/blog/archives'});

app.onLoad(/\.(txt|md)$/, function (view, next) {
  matter.parse(view, next);
});

app.create('layouts', {viewType: ['layout']})
  .load(path.join(__dirname, '../fixtures/templates/layouts/*.txt'));

app.create('includes', {viewType: ['partial'], engine: 'txt'})
  .load(path.join(__dirname, '../fixtures/templates/includes/*.txt'));

/**
 * Create a collection
 */

app.create('post')
  .use(permalink(':base/:title.html'));

app.create('archives')
  .option('renameKey', function (fp) {
    return fp;
  })
  .use(indexer());

app.create('blog')
  .use(indexer());

var indices = app.load(path.join(__dirname, '../fixtures/templates/indices/*.txt'));

/**
 * Create the post list index template (view) to use
 */

var posts = indices.getView('posts')
  .use(permalink(':base(0)/:base(1)/:index(pagination.idx)/index.html', {
    base: function (idx) {
      var res = app.cache.data.base;
      return res.split('/')[idx];
    },
    index: function (i) {
      return i ? ((i + 1)) : '';
    }
  }));

/**
 * Create the archive list index template (view) to use
 */

var archives = indices.getView('archive-index')
  .use(permalink(':base(0)/:base(1)/:base(2)/:index(pagination.idx)/index.html', {
    base: function (idx) {
      var res = app.cache.data.archiveBase;
      return res.split('/')[idx];
    },
    index: function (i) {
      return i ? ((i + 1)) : '';
    }
  }));

/**
 * Add some posts to the `posts` collection
 */

app.posts({
  'a/b/c/a.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: A\n---\naaa'
  },
  'a/b/c/b.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: B\n---\nbbb'
  },
  'a/b/c/c.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: C\n---\nccc'
  },
  'a/b/c/d.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: D\n---\nddd'
  },
  'a/b/c/e.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: E\n---\neee'
  },
  'a/b/c/f.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: F\n---\nfff'
  },
  'a/b/c/g.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: G\n---\nggg'
  },
  'a/b/c/h.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: H\n---\nhhh'
  },
  'a/b/c/i.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: I\n---\niii'
  },
  'a/b/c/j.txt': {
    locals: {base: 'archives/blog'},
    content: '---\ntitle: J\n---\njjj'
  },
});

var list = new List(app.posts);
list.items.forEach(function (post) {
  post.permalink(post.data.permalink, {title: post.data.title, base: post.locals.base});
});

var pages = list.paginate({limit: 3});
app.archives.addIndices(pages, {index: posts});

async.series([
    renderList.bind(null, list, {layout: 'post'}),
    renderList.bind(null, new List(app.archives).sortBy('data.pagination.idx'))
  ], function (err) {
    if (err) return console.error(err);
    console.log('Finished');
  });

function renderList (list, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  async.eachSeries(list.items, function (item, next) {
    item.render(locals, function (err, res) {
      if (err) return next(err);
      writeFile(path.join(__dirname, '../actual', res.url), res.content, next);
      // console.log(path.join(__dirname, '../actual', res.url));
      // console.log(res.content);
      // console.log();
      // next();
    });
  }, cb);
}
