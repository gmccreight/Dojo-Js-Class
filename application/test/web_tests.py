import unittest
from webtest import TestApp
from google.appengine.ext import webapp
from google.appengine.ext import db

from blog import *

class MainTest(unittest.TestCase):
  def setUp(self):
    post1 = Post(title='mytitle1', content='mycontent1', author='myauthor1')
    post2 = Post(title='mytitle2', content='mycontent2', author='myauthor2')
    post3 = Post(title='mytitle3', content='mycontent3', author='myauthor3')
    post1.put()
    post2.put()
    post3.put()
    self.target_post = post3
    self.application = webapp.WSGIApplication([('/index', BlogHandler), 
                                               ('/show', BlogHandler), 
                                               ('/update', BlogHandler), 
                                               ('/destroy', BlogHandler), 
                                               ('/create', BlogHandler)],
                                               debug=True)

  def test_index(self):
    app = TestApp(self.application)
    response = app.get('/index?callback=test')
    num_posts = Post.all().count()
    self.assertEqual(3, num_posts)
    self.assertEqual('200 OK', response.status)

  def test_create(self):
    app = TestApp(self.application)
    num_posts = Post.all().count()
    response = app.get('/create', {'callback': 'test', 'content': 'testcontent', 'author': 'testauthor', 'title': 'testtitle'})
    self.assertEqual(num_posts+1, Post.all().count())
    self.assertEqual('200 OK', response.status)

  def test_update(self):
    app = TestApp(self.application)
    target_key = self.target_post.key()
    response = app.get('/update', {'callback': 'test', 'content': 'updatecontent', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)
    post = Post.get(target_key)
    self.assertEqual('updatecontent', post.content)
    response = app.get('/update', {'callback': 'test', 'author': 'blah', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)
    post = Post.get(target_key)
    self.assertEqual('blah', post.author)
    self.assertEqual('updatecontent', post.content)

  def test_destroy(self):
    app = TestApp(self.application)
    target_key = self.target_post.key()
    response = app.get('/destroy', {'callback': 'test', 'key': target_key.id()})
    post = Post.get(target_key)
    self.assertEqual('200 OK', response.status)
    self.assertEqual(None, post)
    response = app.get('/destroy', {'callback': 'test', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)

  def test_show(self):
    app = TestApp(self.application)
    target_key = self.target_post.key()
    response = app.get('/show', {'callback': 'test', 'key': target_key.id()})
    post = Post.get(target_key)
    self.assertEqual('200 OK', response.status)
    self.assertEqual('mycontent3', post.content)

  def test_show_destroyed(self):
    app = TestApp(self.application)
    target_key = self.target_post.key()
    response = app.get('/destroy', {'callback': 'test', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)
    response = app.get('/show', {'callback': 'test', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)

  def test_update_destroyed(self):
    app = TestApp(self.application)
    target_key = self.target_post.key()
    response = app.get('/destroy', {'callback': 'test', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)
    response = app.get('/update', {'callback': 'test', 'content': 'updatecontent', 'key': target_key.id()})
    self.assertEqual('200 OK', response.status)
    