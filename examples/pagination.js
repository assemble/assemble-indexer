'use strict';

var path = require('path');
var colors = require('ansi-colors');
var error = require('error-symbol');
var assemble = require('assemble-core');
var success = require('success-symbol');
var matter = require('parser-front-matter');
var permalink = require('assemble-permalinks');
var writeFile = require('write');
var async = require('async');
var List = assemble.List;
var app = assemble();

app.engine('txt', require('engine-base'));

app.onLoad(/\.txt$/, function(view, next) {
  matter.parse(view, next);
});

/**
 * Create a collection
 */

app.create('layouts', {
  viewType: ['layout']
});

app.create('posts')
  .use(permalink(':base/:name.html'));

app.create('includes', {
  viewType: ['partial'],
  engine: 'txt'
});

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

app.include('prev', {
  content: '<a href="<%= (pager.prev ? relative(pager.current.url, pager.prev.url) : "#") %>">Prev</a>'
});

app.include('next', {
  content: '<a href="<%= (pager.next ? relative(pager.current.url, pager.next.url) : "#") %>">Next</a>'
});

/**
 * Add some posts to the `posts` collection
 */

function content(title, body) {
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
    content: content('A', 'aaa'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/b.txt': {
    content: content('B', 'bbb'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/c.txt': {
    content: content('C', 'ccc'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/d.txt': {
    content: content('D', 'ddd'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/e.txt': {
    content: content('E', 'eee'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/f.txt': {
    content: content('F', 'fff'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/g.txt': {
    content: content('G', 'ggg'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/h.txt': {
    content: content('H', 'hhh'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/i.txt': {
    content: content('I', 'iii'),
    locals: {
      base: 'pagination/blog'
    }
  },
  'a/b/c/j.txt': {
    content: content('J', 'jjj'),
    locals: {
      base: 'pagination/blog'
    }
  },
});

var list = new List(app.posts)
var pagination = list.paginate({
  limit: 3
})

async.eachSeries(list.items, function(post, next) {
  post.permalink(post.data.permalink, post.locals);
  var msg = colors.cyan('Rendering ')
    + colors.gray(post.url)
    + colors.cyan(' => ');

  process.stdout.write(msg);
  post.render({layout: 'default'}, function(err, res) {
    if (err) {
      next(err);
      return;
    }

    var dest = path.join(__dirname, '../actual', post.url);
    process.stdout.write(colors.gray(path.relative(process.cwd(), dest)) + '... ');
    writeFile(dest, post.content, function(err) {
      if (err) {
        process.stdout.write(colors.red(error) + '\n');
        next(err);
        return;
      }
      process.stdout.write(colors.green(success) + '\n');
      next();
    });
  });
}, function(err) {
  if (err) return console.error(err);
  console.log('done');
});
