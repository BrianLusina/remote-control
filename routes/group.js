const express = require('express');
const router = express.Router();
const debug = require('debug')('app');
const childProcess = require('child_process');
const {getCommandsForGroup} = require('../common/utils');

const handleGroupErrors = (groupName, error_group, error_group_commands, res) => {

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
    }
}

router.route('/')
    /**
     * Get remote control layout for a particular group
     */
    .get(((req, res) => {
        const groupName = req.query.group_name || '';

        if (!groupName) {
            res.status(404).render('error', {
                error: 'No group specified',
                detail: `URL should end in ?group_name=(the escaped group name here)`
            });
            return;
        }

        const {commands, error_group, error_group_commands} = getCommandsForGroup(groupName);

        handleGroupErrors(groupName, error_group, error_group_commands);

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
        const keystrokeName = req.body.keystroke_name || '';
        const groupName = req.query.group_name || '';

        if (keystrokeName === '') {
            return res.status(400).render('error', {error: 'No key sent'});
        }
        if (!groupName) {
            res.status(404).render('error', {
                error: 'No group specified',
                detail: `URL should end in ?group_name=(the escaped group name here)`
            });
            return;
        }

        const {commands, window_name_override, error_group, error_group_commands} = getCommandsForGroup(groupName);

        handleGroupErrors(groupName, error_group, error_group_commands);

        if (!commands[keystrokeName]) {
            return res.status(400).render('error', {
                error: 'Key not allowed',
                detail: `Key not found in commands of group '${groupName}'`
            });
        }

        const window_name = (window_name_override // allow blanks
                ? window_name_override
                : groupName
        ).replace(/"/g, '\\"');

        const window_search_and_activate = window_name
            ? `search "${window_name}" windowactivate --sync`
            : '';

        const final_command = `xdotool ${window_search_and_activate} key --clearmodifiers ${commands[keystrokeName]}`;
        debug(`Executing ${final_command}`);

        childProcess.exec(final_command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Failed to execute command ${err}`);
                return res.status(400).render('error', {error: 'Exec call failed', detail: err});
            } else if (stderr.match('No such key name')) {
                console.error(`No such key name: ${stderr}`);
                return res.status(400).render('error', {error: 'Invalid keycode', detail: stderr});
            } else {
                debug(`Executed ${keystrokeName}`);
                return res.redirect(req.originalUrl);
            }
        });
    })

module.exports = router;
