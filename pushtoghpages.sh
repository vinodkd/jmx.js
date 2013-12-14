# pushtoghpages.sh
# This script pushes the code from master into the gh-pages branch.
# Solution from http://stackoverflow.com/questions/5807459/github-mirroring-gh-pages-to-master
# I thought of adding denbuzze's solution to .git/config but decided against it becuase this was a visible solution - i'm more likely to clone it to other repos.

git checkout gh-pages
git merge master
git push origin gh-pages
git checkout master
