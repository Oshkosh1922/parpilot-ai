#!/usr/bin/env bash
set -euo pipefail
cat .release/parts/*.b64 | base64 --decode > /tmp/parpilot-release.tar.bz2
echo "0757ff93ae0710311750bc78a1bc22eb731db4d3bdaa1d6e90e26c6e34177328  /tmp/parpilot-release.tar.bz2" | sha256sum -c -
mkdir -p /tmp/parpilot-release
tar -xjf /tmp/parpilot-release.tar.bz2 -C /tmp/parpilot-release
cd /tmp/parpilot-release
npm test
npm run check
cd "$GITHUB_WORKSPACE"
git rm -r --ignore-unmatch .
cp -a /tmp/parpilot-release/. .
git config user.name "ParPilot Release Bot"
git config user.email "actions@github.com"
git add -A
git commit -m "Release ParPilot 0.4 restaurant experience standard"
git push origin HEAD:main
