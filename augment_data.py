#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat May 10 11:28:23 2025

@author: tim
"""

from wikidata.client import Client
from hashlib import md5
import json

client = Client() 
graph_classes_prop = client.get('P13104')

def loadInfo(cl):
    print("Querying Wikidata", cl['wikidata'], "…")
    entity = client.get(cl['wikidata'], load=True)    
    if(entity.description is not None and 'description' not in cl):
        cl['description'] = str(entity.description).capitalize() + ' (from Wikidata)'
    graph_classes_org = entity.get(graph_classes_prop)
    if (graph_classes_org is not None):
        cl['graphclassesorg'] = graph_classes_org
    if('enwiki' in entity.attributes['sitelinks'] and 'wikipedia' not in cl):
        cl['wikipedia'] = entity.attributes['sitelinks']['enwiki']['url']

def addInfo(cl):
    if('id' not in cl):
        cl['id'] = md5(cl['name'].encode()).hexdigest()

with open('data.json', 'r') as file:
    # Load the JSON data
    data = json.load(file)

for cl in data:
    print("Processing", cl['name'], "…")
    addInfo(cl)
    if ('wikidata' in cl):
       loadInfo(cl)

print("Writing augmented data…")
with open('data_augmented.json', 'w') as file:
    json.dump(data, file, indent=4)

       
