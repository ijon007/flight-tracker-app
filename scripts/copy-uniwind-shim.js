const { copyFileSync } = require('fs');

copyFileSync(
  'shims/InputAccessoryView.js',
  'node_modules/uniwind/dist/module/components/web/InputAccessoryView.js',
);
