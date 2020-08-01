const presetCommands = require('./preset-commands')

/**
 * Gets commands for the given group name
 * @param {String} groupName Name of group
 * @return {Object} object with values indicating the commands for the given group and errors if any
 */
module.exports = {
    getCommandsForGroup: (groupName) => {
        const group = presetCommands[groupName];

        if (!group) {
            return {
                error_group: true
            }
        }
        const {commands} = group;

        if (!commands) {
            return {
                error_group_commands: true
            };
        }

        return {
            commands
        }
    }
}