var path = require('path');
var templates = require('templates');
var matter = require('parser-front-matter');
var permalink = require('assemble-permalinks');
var async = require('async');
var List = templates.List;
var app = templates();

app.engine('txt', require('engine-base'));

app.onLoad(/\.txt$/, function (view, next) {
  matter.parse(view, next);
});

/**
 * Create a collection
 */

app.create('posts');
app.create('includes', {viewType: ['partial'], engine: 'txt'});

app.include('prev', { content: '<%= pager.prev && pager.prev.path %>' });
app.include('next', { content: '<%= pager.next && pager.next.path %>' });

/**
 * Add some posts to the `posts` collection
 */

app.posts({
  'a/b/c/a.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: A\n---\n<%= include("prev") %> aaa <%= include("next") %>'
  },
  'a/b/c/b.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: B\n---\n<%= include("prev") %> bbb <%= include("next") %>'
  },
  'a/b/c/c.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: C\n---\n<%= include("prev") %> ccc <%= include("next") %>'
  },
  'a/b/c/d.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: D\n---\n<%= include("prev") %> ddd <%= include("next") %>'
  },
  'a/b/c/e.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: E\n---\n<%= include("prev") %> eee <%= include("next") %>'
  },
  'a/b/c/f.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: F\n---\n<%= include("prev") %> fff <%= include("next") %>'
  },
  'a/b/c/g.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: G\n---\n<%= include("prev") %> ggg <%= include("next") %>'
  },
  'a/b/c/h.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: H\n---\n<%= include("prev") %> hhh <%= include("next") %>'
  },
  'a/b/c/i.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: I\n---\n<%= include("prev") %> iii <%= include("next") %>'
  },
  'a/b/c/j.txt': {
    locals: {base: '_gh_posts/blog'},
    content: '---\ntitle: J\n---\n<%= include("prev") %> jjj <%= include("next") %>'
  },
});

var list = new List(app.posts)
  // .sortBy('path', {reverse:true});


var pagination = list.paginate({limit: 3})
// var pager = list.pagination

// console.log(list.items[1].data.pager)
// console.log(list.items[5].data.pager.prev.path)

async.each(list.items, function (post, next) {
  post.render(function (err, res) {
    if (err) return next(err);
    console.log(res.content);
    next();
  });
}, function (err) {
  if (err) return console.error(err);
  console.log('done');
});
