#!/usr/bin/env python

import wsgiref.handlers

from google.appengine.ext import webapp

from posting import PostingHandler

def main():
  application = webapp.WSGIApplication([('/index', PostingHandler), 
                                        ('/create', PostingHandler)],
                                        debug=True)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()
