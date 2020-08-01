const express = require('express');
const router = express.Router();
const presetCommands = require('../common/preset-commands');

/* GET home page. */
router.get('/', function (req, res, next) {
    const groupNames = Object.keys(presetCommands);

    res.render('index', {
        title: 'Which Remote?',
        group_names: groupNames,
        portrait_css: `.group_bar {
            height: calc(100%/${Math.min(4, groupNames.length)});
            line-height: calc(100vh/${Math.min(4, groupNames.length)});
        }`,
        landscape_css: `.group_bar {
            height: calc(100%/${Math.min(2, groupNames.length)});
            line-height: calc(100vh/${Math.min(2, groupNames.length)});
        }`,
    });
});

module.exports = router;
