#!/bin/sh
cd "$(dirname "$0")"; { echo "{"; cat kit_part.js content_part.js; echo "}"; } > style.js; node --check style.js
