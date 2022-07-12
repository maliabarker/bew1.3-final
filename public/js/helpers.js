const dayjs = require('dayjs');
var timezone = require('dayjs/plugin/timezone');
var AdvancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(AdvancedFormat)
dayjs.extend(timezone)

module.exports = {
    dateFormat: function(date, args) {
        newDate = dayjs(date).format(args)
        return newDate
    }
};