pip3 install Wikidata

rm -r _site
mkdir _site
cp -r pages/* _site/

mkdir _site/src
cp -r src _site/

mkdir _site/data
cp -r data _site/

python3 augment_data.py data/data.json _site/data/data_augmented.json

zip -j _site/data/data_dump.zip _site/data/*
