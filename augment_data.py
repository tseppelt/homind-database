#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat May 10 11:28:23 2025

@author: tim
"""

from wikidata.client import Client
from hashlib import md5
import json
import sys
import logging

from functools import lru_cache

client = Client() 
graph_classes_prop = client.get('P13104')

@lru_cache(maxsize=None)
def cached_get(q):
    if q is None:
        return None
    print("Querying Wikidata", q, "…")
    entity = client.get(q, load=True) 
    print("… received item titled", entity.label)
    return entity

def loadGraphClassInfo(cl):
    entity = cached_get(cl['wikidata'])
    
    if(entity.description is not None and 'description' not in cl):
        cl['description'] = str(entity.description).capitalize() + ' (from Wikidata)'
    graph_classes_org = entity.get(graph_classes_prop)
    if (graph_classes_org is not None):
        cl['graphclassesorg'] = graph_classes_org
    if('enwiki' in entity.attributes['sitelinks'] and 'wikipedia' not in cl):
        cl['wikipedia'] = entity.attributes['sitelinks']['enwiki']['url']

def loadStatementInfo(statement):
    if 'wikidata' not in statement or statement['wikidata'] is None:
        return
    entity = cached_get(statement['wikidata'])    
    if('enwiki' in entity.attributes['sitelinks'] and 'wikipedia' not in statement):
        statement['wikipedia'] = entity.attributes['sitelinks']['enwiki']['url']

def addGraphClassInfo(cl):
    if('id' not in cl):
        cl['id'] = md5(cl['name'].encode()).hexdigest()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        logging.error("Please provide paths to input and output data file.")
        exit
    infile  = sys.argv[1]
    outfile = sys.argv[2]

    with open(infile, 'r') as file:
        # Load the JSON data
        data = json.load(file)
    
    try:
        for cl in data:
            print("Processing", cl['name'], "…")
            addGraphClassInfo(cl)
            if ('wikidata' in cl and cl['wikidata'] is not None):
                loadGraphClassInfo(cl)
                for statement in cl['statements']:
                    loadStatementInfo(statement)
    except:
        print("Error when augmenting data.")
    
    print("Writing augmented data…")
    with open(outfile, 'w') as file:
        json.dump(data, file, indent=4)

       
