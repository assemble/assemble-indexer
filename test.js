/*!
 * templates-indexer <https://github.com/doowb/templates-indexer>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var should = require('should');
var templatesIndexer = require('./');

describe('templatesIndexer', function () {
  it('should:', function () {
    templatesIndexer('a').should.eql({a: 'b'});
    templatesIndexer('a').should.equal('a');
  });

  it('should throw an error:', function () {
    (function () {
      templatesIndexer();
    }).should.throw('templatesIndexer expects valid arguments');
  });
});
