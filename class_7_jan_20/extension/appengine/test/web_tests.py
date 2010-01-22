import unittest
from webtest import TestApp
from google.appengine.ext import webapp
from google.appengine.ext import db

from posting import *

class MainTest(unittest.TestCase):
  def setUp(self):
    post1 = JobPosting(url='http://sfbay.craigslist.org/1', email_hash='abc', contact_email='john@example.com')
    post2 = JobPosting(url='http://sfbay.craigslist.org/2', email_hash='abc', contact_email='fred@example.com')
    post3 = JobPosting(url='http://sfbay.craigslist.org/3', email_hash='abc', contact_email='tom@example.com')
    post1.put()
    post2.put()
    post3.put()
    self.target_post = post3
    self.application = webapp.WSGIApplication([('/index', PostingHandler), 
                                               ('/create', PostingHandler)],
                                               debug=True)

  def test_index(self):
    app = TestApp(self.application)
    response = app.get('/index?callback=test')
    num_posts = JobPosting.all().count()
    self.assertEqual(3, num_posts)
    self.assertEqual('200 OK', response.status)

  def test_create(self):
    app = TestApp(self.application)
    num_posts = JobPosting.all().count()
    response = app.get('/create', {'callback': 'test', 'url': 'http://www.google.com', 'contact_email': 'sam@example.com', 'email_hash': 'blah'})
    self.assertEqual(num_posts+1, JobPosting.all().count())
    self.assertEqual('200 OK', response.status)