var path = require('path');
var cyan = require('ansi-cyan');
var grey = require('ansi-grey');
var symbols = require('log-symbols');
var templates = require('templates');
var matter = require('parser-front-matter');
var permalink = require('assemble-permalinks');
var writeFile = require('write');
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

app.create('layouts', {viewType: ['layout']});
app.create('posts')
  .use(permalink(':base/:name.html'));

app.create('includes', {viewType: ['partial'], engine: 'txt'});

app.helper('relative', require('relative'));

app.layout('default', {
  content: [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="UTF-8">',
    '    <title><%= title %></title>',
    '  </head>',
    '  <body>',
    '    {% body %}',
    '  </body>',
    '</html>',
  ].join('\n')
});

app.include('prev', { content: '<a href="<%= (pager.prev ? relative(pager.current.url, pager.prev.url) : "#") %>">Prev</a>' });
app.include('next', { content: '<a href="<%= (pager.next ? relative(pager.current.url, pager.next.url) : "#") %>">Next</a>' });

/**
 * Add some posts to the `posts` collection
 */
function content (title, body) {
  return [
    '---',
    'title: ' + title,
    '---',
    '<h1><%= title %></h1>',
    '<div>' + body + '</div>',
    '<div>[<%= include("prev") %>]&nbsp;&nbsp;|&nbsp;&nbsp;[<%= include("next") %>]'
  ].join('\n');
}

app.posts({
  'a/b/c/a.txt': {
    locals: {base: 'pagination/blog'},
    content: content('A', 'aaa')
  },
  'a/b/c/b.txt': {
    locals: {base: 'pagination/blog'},
    content: content('B', 'bbb')
  },
  'a/b/c/c.txt': {
    locals: {base: 'pagination/blog'},
    content: content('C', 'ccc')
  },
  'a/b/c/d.txt': {
    locals: {base: 'pagination/blog'},
    content: content('D', 'ddd')
  },
  'a/b/c/e.txt': {
    locals: {base: 'pagination/blog'},
    content: content('E', 'eee')
  },
  'a/b/c/f.txt': {
    locals: {base: 'pagination/blog'},
    content: content('F', 'fff')
  },
  'a/b/c/g.txt': {
    locals: {base: 'pagination/blog'},
    content: content('G', 'ggg')
  },
  'a/b/c/h.txt': {
    locals: {base: 'pagination/blog'},
    content: content('H', 'hhh')
  },
  'a/b/c/i.txt': {
    locals: {base: 'pagination/blog'},
    content: content('I', 'iii')
  },
  'a/b/c/j.txt': {
    locals: {base: 'pagination/blog'},
    content: content('J', 'jjj')
  },
});

var list = new List(app.posts)
var pagination = list.paginate({limit: 3})

async.eachSeries(list.items, function (post, next) {
  post.permalink(post.data.permalink, post.locals);
  process.stdout.write(cyan('Rendering ') + grey(post.url) + cyan(' => '));
  post.render({layout: 'default'}, function (err, res) {
      if (err) return next(err);
      var dest = path.join(__dirname, '../actual', post.url);
      process.stdout.write(grey(path.relative(process.cwd(), dest)) + '... ');
      writeFile(dest, post.content, function (err) {
        if (err) {
          process.stdout.write(symbols.error + '\n');
          return next(err);
        }
        process.stdout.write(symbols.success + '\n');
        next();
      });
    });
}, function (err) {
  if (err) return console.error(err);
  console.log('done');
});
