# Attack Vector

A keyboard & mouse 2D shooter game for the browser.
Defeat swarms of enemies with various weapons and a time-slow ability.
As of writing: 15 unique enemies, 4 primary weapons, and 4 secondary weapons to choose from.

## Setup (There is None!)

To run this game, download the zip file in the "pre_bundled" directory,
extract its contents,
find the "attack_vector.html" file,
and drag it into your browser.

### More specifics

This game is vanilla JS and HTML with no external libraries.
The only thing preventing the source code from running directly is
web browsers' distate for running JS modules without a server.
Hence, if you serve the contents of this repo through localhost with something like http-server,
it will run fine (this is what I do during development).
The zip file in question is produced by bundling the contents of src/ into one file using Rollup (that's why npm is here) and zipping up the necessary files with 7zip.
The commands used to do so are found in "bundle_and_zip.bat" which runs directly on windows.
