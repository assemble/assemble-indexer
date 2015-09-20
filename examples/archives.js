var path = require('path');
var async = require('async');
var cyan = require('ansi-cyan');
var grey = require('ansi-grey');
var writeFile = require('write');
var symbols = require('log-symbols');
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

/**
 * Archive posts into a simple list of posts
 */

app.create('archives')
  .option('renameKey', renameKey)
  .use(indexer());

/**
 * Archive posts into lists based on years
 */

app.create('yearArchives')
  .option('renameKey', renameKey)
  .use(indexer());

/**
 * Archive posts into lists based on year-months
 */

app.create('monthArchives')
  .option('renameKey', renameKey)
  .use(indexer());


/**
 * Load a collection of list index templates
 */

var indices = app.load(path.join(__dirname, '../fixtures/templates/indices/*.txt'));

/**
 * Get the post list index template (view) to use
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
 * Get the archive list index template (view) to use
 */

var archives = indices.getView('archive-index')
  .use(permalink(':base(0)/:base(1)/:base(2)/:slug/:index(pagination.idx)/index.html', {
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
    locals: {base: 'archives/blog', year: '2012', month: '01'},
    content: '---\ntitle: A\n---\naaa'
  },
  'a/b/c/b.txt': {
    locals: {base: 'archives/blog', year: '2011', month: '11'},
    content: '---\ntitle: B\n---\nbbb'
  },
  'a/b/c/c.txt': {
    locals: {base: 'archives/blog', year: '2010', month: '04'},
    content: '---\ntitle: C\n---\nccc'
  },
  'a/b/c/d.txt': {
    locals: {base: 'archives/blog', year: '2010', month: '06'},
    content: '---\ntitle: D\n---\nddd'
  },
  'a/b/c/e.txt': {
    locals: {base: 'archives/blog', year: '2011', month: '08'},
    content: '---\ntitle: E\n---\neee'
  },
  'a/b/c/f.txt': {
    locals: {base: 'archives/blog', year: '2013', month: '04'},
    content: '---\ntitle: F\n---\nfff'
  },
  'a/b/c/g.txt': {
    locals: {base: 'archives/blog', year: '2015', month: '12'},
    content: '---\ntitle: G\n---\nggg'
  },
  'a/b/c/h.txt': {
    locals: {base: 'archives/blog', year: '2010', month: '04'},
    content: '---\ntitle: H\n---\nhhh'
  },
  'a/b/c/i.txt': {
    locals: {base: 'archives/blog', year: '2015', month: '01'},
    content: '---\ntitle: I\n---\niii'
  },
  'a/b/c/j.txt': {
    locals: {base: 'archives/blog', year: '2012', month: '03'},
    content: '---\ntitle: J\n---\njjj'
  },
});

/**
 * Generate a list from the `posts` collection
 */

var list = new List(app.posts);

/**
 * Create the permalink for each post in the `posts` list.
 */

list.items.forEach(function (post) {
  post.permalink(post.data.permalink, {title: post.data.title, base: post.locals.base});
});

/**
 * Paginate the `posts` list into pages containing 3 posts on each page.
 */

var pages = list.paginate({limit: 3});

/**
 * Add the paginated pages to the `archives` collection with `addIndices` using the `posts` list index template (view)
 */

app.archives.addIndices(pages, {index: posts});

/**
 * Group `posts` list based on year.
 * //=> { '2010':
 * //=>    [ <View "a/b/c/c.txt" <Buffer 63 63 63>>,
 * //=>      <View "a/b/c/d.txt" <Buffer 64 64 64>>,
 * //=>      <View "a/b/c/h.txt" <Buffer 68 68 68>> ],
 * //=>   '2011':
 * //=>    [ <View "a/b/c/b.txt" <Buffer 62 62 62>>,
 * //=>      <View "a/b/c/e.txt" <Buffer 65 65 65>> ],
 * //=>   '2012':
 * //=>    [ <View "a/b/c/a.txt" <Buffer 61 61 61>>,
 * //=>      <View "a/b/c/j.txt" <Buffer 6a 6a 6a>> ],
 * //=>   '2013': [ <View "a/b/c/f.txt" <Buffer 66 66 66>> ],
 * //=>   '2015':
 * //=>    [ <View "a/b/c/g.txt" <Buffer 67 67 67>>,
 * //=>      <View "a/b/c/i.txt" <Buffer 69 69 69>> ] }
 */

var yearsGroup = list.groupBy('locals.year');

/**
 * Group `posts` list based on year and month.
 * //=> { '2010':
 * //=>   { '04':
 * //=>      [ <View "a/b/c/c.txt" <Buffer 63 63 63>>,
 * //=>        <View "a/b/c/h.txt" <Buffer 68 68 68>> ],
 * //=>     '06': [ <View "a/b/c/d.txt" <Buffer 64 64 64>> ] },
 * //=>  '2011':
 * //=>   { '11': [ <View "a/b/c/b.txt" <Buffer 62 62 62>> ],
 * //=>     '08': [ <View "a/b/c/e.txt" <Buffer 65 65 65>> ] },
 * //=>  '2012':
 * //=>   { '01': [ <View "a/b/c/a.txt" <Buffer 61 61 61>> ],
 * //=>     '03': [ <View "a/b/c/j.txt" <Buffer 6a 6a 6a>> ] },
 * //=>  '2013': { '04': [ <View "a/b/c/f.txt" <Buffer 66 66 66>> ] },
 * //=>  '2015':
 * //=>   { '12': [ <View "a/b/c/g.txt" <Buffer 67 67 67>> ],
 * //=>     '01': [ <View "a/b/c/i.txt" <Buffer 69 69 69>> ] } }
 */

var monthsGroup = list.groupBy('locals.year', 'locals.month');

/**
 * Iterate over the year/month groups that were generated and add
 * them to their archive collections
 */

var years = Object.keys(yearsGroup);
years.forEach(function (year) {
  var yearGroup = yearsGroup.get(year);
  app.yearArchives.addIndices(yearGroup.paginate({limit: 3}), {slug: year, year: year, index: archives});
});

years = Object.keys(monthsGroup);
years.forEach(function (year) {
  var yearGroup = monthsGroup.get(year);
  var months = Object.keys(yearGroup);
  months.forEach(function (month) {
    var monthGroup = monthsGroup.get([year, month].join('.'));
    app.monthArchives.addIndices(monthGroup.paginate({limit: 3}), {slug: path.join(year, month), year: year, month: month, index: archives});
  });
});

async.series([
    /**
     * Render and write out all the `posts` from the `posts` list. They'll be written based on their permalink url.
     * These are also sorted by their year and month properties to show how the next/prev links work.
     */
    renderList.bind(null, new List(list).sortBy('locals.year', 'locals.month'), {layout: 'post'}),
    /**
     * Render and write out all of the `archives` list pages of `posts` the their permalink generated url.
     */
    renderList.bind(null, new List(app.archives)),
    /**
     * Render and write out all of the `year archives` list pages of `posts` the their permalink generated url.
     */
    renderList.bind(null, new List(app.yearArchives).sortBy('url')),
    /**
     * Render and write out all of the `month archives` list pages of `posts` the their permalink generated url.
     */
    renderList.bind(null, new List(app.monthArchives).sortBy('url')),

  ], function (err) {
    if (err) return console.error(err);
    console.log('Finished');
  });

/**
 * Helper function to iterate over a list of templates, render them
 * and write them to their generated permalink url
 */

function renderList (list, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  async.eachSeries(list.items, function (item, next) {
    process.stdout.write(cyan('Rendering ') + grey(item.url) + cyan(' => '));
    item.render(locals, function (err, res) {
      if (err) return next(err);
      var dest = path.join(__dirname, '../actual', res.url);
      process.stdout.write(grey(path.relative(process.cwd(), dest)) + '... ');
      writeFile(dest, res.content, function (err) {
        if (err) {
          process.stdout.write(symbols.error + '\n');
          return next(err);
        }
        process.stdout.write(symbols.success + '\n');
        next();
      });
    });
  }, cb);
}

function renameKey (fp) {
  return fp;
}
