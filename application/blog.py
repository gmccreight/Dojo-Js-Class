import simplejson
import logging
import wsgiref.handlers

from google.appengine.ext import db
from google.appengine.ext import webapp

logging.getLogger().setLevel(logging.INFO)

class Post(db.Model):
  content = db.TextProperty()
  author = db.StringProperty()
  title = db.StringProperty()
  tag = db.StringProperty()
  created = db.DateTimeProperty(auto_now_add=True)

  def hash(self):
    return {'key': self.key().id(), 'content': self.content, 'title': self.title, 'date': self.created.strftime('%m/%d/%Y %H:%M'), 'author': self.author}

class BlogHandler(webapp.RequestHandler):
  def _returnCreate(self):
    post = Post(content=str(self.request.get('content')),
                author=str(self.request.get('author')),
                title=str(self.request.get('title')))
    post.put()
    return post.hash()

  def _returnIndex(self):
    tag = self.request.get('tag', default_value=None)
    if (tag):
      posts = db.Query(Post).gql("WHERE tag = :1", tag).order('-created').fetch(limit=20)
    else:
      posts = db.Query(Post).order('-created').fetch(limit=20)
    return map(lambda p: p.hash(), posts)

  def _returnShow(self):
    post = Post.get_by_id(int(self.request.get('key')))
    if (post):
      return post.hash()
    else:
      return {'error': 'missing'}

  def _returnDestroy(self):
    post = Post.get_by_id(int(self.request.get('key')))
    if (post):
      post.delete()
      return {'complete': 'ok'}
    else:
      return {'error': 'missing'}

  def _returnUpdate(self):
    post = Post.get_by_id(int(self.request.get('key')))
    if (post):
      post.content = self.request.get('content', default_value=(post.content))
      post.author = self.request.get('author', default_value=(post.author))
      post.title = self.request.get('title', default_value=(post.title))
      post.put();
      return post.hash()
    else:
      return {'error': 'missing'}

  def get(self):
    self.response.headers['Content-Type'] = 'application/x-javascript'
    callback = self.request.get('callback', default_value=None)
    if (callback):
      output = {}
      if self.request.path.startswith('/index'):
        output = self._returnIndex()
      if self.request.path.startswith('/show'):
        output = self._returnShow()
      if self.request.path.startswith('/create'):
        output = self._returnCreate()
      if self.request.path.startswith('/destroy'):
        output = self._returnDestroy()
      if self.request.path.startswith('/update'):
        output = self._returnUpdate()
      self.response.out.write(callback + '(' + simplejson.dumps(output) + ')')
    else:
      self.response.out.write('error(' + simplejson.dumps({'error': 'callback empty'}) + ')')
      
  def post(self):
    self.response.out.write('all requests should be a get')


