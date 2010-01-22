import simplejson
import logging
import wsgiref.handlers

from google.appengine.ext import db
from google.appengine.ext import webapp

logging.getLogger().setLevel(logging.INFO)

class JobPosting(db.Model):
  url = db.StringProperty()
  email_hash = db.StringProperty(indexed=True)
  contact_email = db.StringProperty()
  created = db.DateTimeProperty(auto_now_add=True)

  def hash(self):
    return {'key': self.key().id(), 'url': self.url, 'contact_email': self.contact_email, 'date': self.created.strftime('%m/%d/%Y %H:%M')}

class PostingHandler(webapp.RequestHandler):
  def _returnCreate(self):
    email_hash = self.request.get('email_hash', default_value=None)
    if (email_hash):
      post = JobPosting(url=str(self.request.get('url')),
                        email_hash=str(self.request.get('email_hash')),
                        contact_email=str(self.request.get('contact_email')))
      post.put()
      return post.hash()
    else:
      return {'error': 'missing email_hash'}

  def _returnIndex(self):
    email_hash = self.request.get('email_hash', default_value=None)
    posts = []
    if (email_hash):
      job_postings = db.Query(JobPosting).filter("email_hash =", email_hash).fetch(limit=1000)
      posts = map(lambda p: p.hash(), job_postings)
    return posts

  def get(self):
    self.response.headers['Content-Type'] = 'application/x-javascript'
    callback = self.request.get('callback', default_value=None)
    output = {}
    if self.request.path.startswith('/index'):
      output = self._returnIndex()
    if self.request.path.startswith('/create'):
      output = self._returnCreate()
    if (callback):
      self.response.out.write(callback + '(' + simplejson.dumps(output) + ')')
    else:
      self.response.out.write(simplejson.dumps(output))
      
  def post(self):
    self.response.out.write('all requests should be a get')