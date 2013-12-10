echo Removing comments from jmxelements.json....
sed -e "s/\/\/.*//g" src/jmxelements.json > lib/jmxelements.json
echo Done.

