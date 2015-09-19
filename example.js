var path = require('path');
var async = require('async');
var writeFile = require('write');
var templates = require('templates');
var loader = require('assemble-loader');
var matter = require('parser-front-matter');
var permalink = require('assemble-permalinks');
var indexer = require('./');

var List = templates.List;
var app = templates()
  .use(loader());

app.option('view engine', 'txt');

app.data({base: 'dist'});
app.onLoad(/\.txt$/, function (view, next) {
  matter.parse(view, next);
});

/**
 * Create a collection
 */

app.create('post');

app.create('archives')
  .use(indexer());

app.create('blog')
  .use(indexer());

var indices = app.load('fixtures/*.txt');

/**
 * Create blog post template (view) to use
 */

var post = indices.getView('fixtures/post.txt')
  .use(permalink(':pagination.item.data.title.html'));
  // .use(permalink(':title()', {
    // title: function () {
    //   console.log(this.pagination);
    //   return 'title';
    // }
  // }));

/**
 * Create the index template (view) to use
 */

var index = app.view({path: 'index.txt', content: 'index'})
  .use(permalink(':index(pagination.idx):name.html', {
    index: function (i) {
      return i ? ((i + 1) + '/') : '';
    }
  }));

/**
 * Add some posts to the `posts` collection
 */

app.posts({
  'a/b/c/a.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: A\n---\naaa'
  },
  'a/b/c/b.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: B\n---\nbbb'
  },
  'a/b/c/c.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: C\n---\nccc'
  },
  'a/b/c/d.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: D\n---\nddd'
  },
  'a/b/c/e.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: E\n---\neee'
  },
  'a/b/c/f.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: F\n---\nfff'
  },
  'a/b/c/g.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: G\n---\nggg'
  },
  'a/b/c/h.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: H\n---\nhhh'
  },
  'a/b/c/i.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: I\n---\niii'
  },
  'a/b/c/j.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: J\n---\njjj'
  },
});

var list = new List(app.posts);
var pages = list.paginate({limit: 3});
var posts = list.pagination;

app.blog.addIndices(posts, {index: post});
app.archives.addIndices(pages, {index: index});
console.log(app.blog.views);

// async.eachSeries(new List(app.blog).items, function (post, next) {
//   post.render(function (err, res) {
//     if (err) return next(err);
//     writeFile(path.join('actual/blog', res.url), res.content, next);
//   });
// }, function (err) {
//   if (err) return console.error(err);
//   console.log('Finished');
// });

