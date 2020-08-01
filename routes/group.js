const express = require('express');
const router = express.Router();
const debug = require('debug')('app');
const childProcess = require('child_process');
const {getCommandsForGroup} = require('../common/utils');

router.route('/')
    /**
     * Get remote control layout for a particular group
     */
    .get(((req, res) => {
        const groupName = req.query.group_name;

        if (!groupName) {
            res.status(404).render('error', {
                error: 'No group specified',
                detail: `URL should end in ?group_name=(the escaped group name here)`
            });
            return;
        }

        const {commands, error_group, error_group_commands} = getCommandsForGroup(groupName);

        if (error_group) {
            res.status(404).render('error', {
                error: 'Group not found',
                detail: `Received name '${groupName}' but couldn't find it among presets`
            });
            return;
        }

        if (error_group_commands) {
            res.status(404).render('error', {
                error: 'Group empty',
                detail: `Found group '${groupName}' but it has no commands defined`
            });
            return;
        }

        res.render('group', {
            keystroke_names: Object.keys(commands),
            group_name: groupName,
            title: `${groupName.match(/([A-Z])/g).join('')}-Remote`
        });
    }))

    /**
     * Post keystroke commands to be used by a child process which will be passed to xdotool
     */
    .post((req, res) => {
        const keystrokeName = req.body.keystroke_name;

        res.send('respond with a resource');
    })

module.exports = router;
