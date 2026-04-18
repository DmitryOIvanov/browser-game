:: Create a single "bundled_src.js" file using the instance of rollup installed locally by npm (see rollup.config.js)
CALL npx rollup -c

:: Reset the zip file if it exists already
CALL 7z d attack_vector.zip

:: Add html file, js file, and supplementary resources to zip
CALL 7z a -tzip attack_vector.zip bundle_index.html bundled_src.js resources

:: Inside the zip, rename each of the above as necessary and enclose them in a top-level directory
CALL 7z rn attack_vector.zip bundle_index.html attack_vector/attack_vector.html bundled_src.js attack_vector/src.js resources attack_vector/resources
