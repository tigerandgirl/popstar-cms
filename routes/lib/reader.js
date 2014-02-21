var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Parser = require('./parser');
var parser = new Parser;

var reader = function(options) {

  if(options) {
    _.extend(this.globalOptions, options);
    return this;
  }
};

reader.prototype = {

  globalOptions: {
    directory: path.normalize('content'),
    postsDir:  path.normalize('content/posts'),
    pagesDir:  path.normalize('content/pages'),
    postsPerPage: 10,
    slugSplit: /^[0-9]*-/,
    extensionSplit: /\.md$/
  },

  getPostFiles: function(overrideLimit) {
    var self = this;
    var limit = overrideLimit ? overrideLimit : this.globalOptions.postsPerPage;

    var files = fs.readdirSync(this.globalOptions.postsDir);

    if(limit === 0) {
      limit = files.length;
    }

    files.sort(function(a, b) {
      self.fileSort(a, b);
    });

    files.slice(0, limit);

    return files;
  },

  getPageFiles: function() {
    var files = fs.readdirSync(this.globalOptions.pagesDir);
    files.sort(function(a, b) {
      this.fileSort(a, b);
    });
    return files;
  },

  getPostTitles: function(overrideLimit) {
    var self = this;
    var files = this.getPostFiles(overrideLimit);
    var data = [];

    _.each(files, function(file) {
      data.push(self.getPostTitle(file));
    });

    return data;
  },

  getPostTitle: function(fileName) {
    var p = this.globalOptions.postsDir + '/'+fileName;
    var data = {};

    var file = fs.readFileSync(p);
    var fileString = parser.parseFile(file.toString());
    var slugInfo = this.parseSlug(fileName);

    data.title = fileString.title;
    data.id = slugInfo.id;
    data.slug = slugInfo.slug;

    return data;
  },

  getPost: function(fileName) {
    var p = this.globalOptions.postsDir + '/'+fileName;
    var data;

    var file = fs.readFileSync(p);
    data = parser.parseFile(file.toString());
    var slugInfo = this.parseSlug(fileName);

    data.id = slugInfo.id;
    data.slug = slugInfo.slug;

    return data;
  },

  getPage: function(fileName) {
    var p = this.globalOptions.pagesDir + '/'+fileName;
    var data;

    var file = fs.readFileSync(p);
    data = parser.parseFile(file.toString());
    var slugInfo = this.parseSlug(fileName);

    data.id = slugInfo.id;
    data.slug = slugInfo.slug;

    return data;
  },

  findPost: function(identifier, type) {

    if(type === 'slug') {
      var post = this.findPostBySlug(identifier);
      return post;
    } else if(type === 'id') {

    }
  },

  findPostBySlug: function(identifier) {
    var self  =  this;
    var files =  self.getPostFiles(0);
    var post;

    _.each(files, function(file){
      if(identifier === self.parseSlug(file).slug && _.isEmpty(post)){
        post = file;
      }
    });

    if(!_.isEmpty(post)) {
      var data = this.getPost(post);
      return data;
    }
  },

  findPage: function(identifier, type) {
    if(type === 'slug') {
      var page = this.findPageBySlug(identifier);
      return page;
    } else if(type === 'id') {

    }
  },

  findPageBySlug: function(identifier) {
    var self = this;
    var files = self.getPageFiles();
    var page;

    _.each(files, function(file) {
      if(identifier === self.parseSlug(file).slug && _.isEmpty(page)) {
        page = file;
      }
    });

    if(!_.isEmpty(page)) {
      var data = this.getPage(page);
      return data;
    } else {
      return 'error';
    }
  },

  getPosts: function(limit) {
    var self = this;
    var postFiles = this.getPostFiles(limit);
    var posts = [];

    _.each(postFiles, function(file) {
      posts.push(self.getPost(file));
    });

    return posts;
  },

  getPages: function(limit) {
    var self = this;
    var pageFiles = this.getPageFiles(limit);
    var pages = [];

    _.each(pageFiles, function(file) {
      pages.push(self.getPage(file));
    });

    return pages;
  },

  parseSlug: function(fileName) {
    var file = fileName;
    var data = {};

    var slugInfo = file.split(this.globalOptions.slugSplit);

    data.id = file.match(this.globalOptions.slugSplit)[0].slice(0,-1);
    data.slug = slugInfo[1].replace(this.globalOptions.extensionSplit,'');
    return data;
  },

  fileSort: function(a, b) {
    var a1 = parseInt(a, 10);
    var b1 = parseInt(b, 10);

    return a1 > b1;
  }
};

module.exports = reader;
