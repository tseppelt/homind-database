pip3 install Wikidata

python3 augment_data.py ./data/data.json ./data/data_augmented.json

rm -r _site
mkdir _site
cp -r pages/* _site/

mkdir _site/src
cp -r src _site/

mkdir _site/data
cp -r data _site/

zip _site/data/data_dump.zip data/*
