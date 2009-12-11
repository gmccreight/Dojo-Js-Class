#!/usr/bin/env python

import wsgiref.handlers

from google.appengine.ext import webapp

from blog import BlogHandler

def main():
  application = webapp.WSGIApplication([('/index', BlogHandler), 
                                        ('/show', BlogHandler), 
                                        ('/update', BlogHandler), 
                                        ('/destroy', BlogHandler), 
                                        ('/create', BlogHandler)],
                                        debug=True)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()
