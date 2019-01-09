# misspell
echo 'Running misspell check.'
find . -path ./node_modules -prune -o -name '*' -type f -print0 | xargs -0 ./common_tools/misspell

echo 'Running markdownlint check.'
find . -path ./node_modules -prune -o -name '*.md' -type f -print0 | xargs -0 markdownlint --config ./common_tools/markdownlint.json

echo 'Running markdown-link-chech.'
find . -path ./node_modules -prune -o -name '*.md' -type f -print0 | xargs -0 markdown-link-check -q