const path = require('node:path');

module.exports = {
    config: path.resolve(__dirname, 'src/config/database.config.ts'),
    'migrations-path': path.resolve(__dirname, 'src/db/migrations'),
    'seeders-path': path.resolve(__dirname, 'src/db/seeders'),
    'models-path': path.resolve(__dirname, 'src/db/models'),
};
