CALL npx rollup -c
CALL 7z d attack_vector.zip
CALL 7z a -tzip attack_vector.zip bundle_index.html bundled_src.js resources
CALL 7z rn attack_vector.zip bundle_index.html attack_vector/attack_vector.html bundled_src.js attack_vector/src.js resources attack_vector/resources
