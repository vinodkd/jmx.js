#webserver.sh
cd ..
tools/stripcomments.sh	# added this step so that every start clears out the comments in jmxelements.json
node tools/webserver.js
cd -

