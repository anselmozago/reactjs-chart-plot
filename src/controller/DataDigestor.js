import string from '../infrasctuture/strings'
const JSON5 = require('json5')

/**
  * DataDigestor.js
  *
  * Class responsible for digesting events content in JSON format
  * and returning an array of data to build a chart.
  * 
  * TODO: Suggest and implement a protection for this application
  * to deal with huge amount of data.
  * Solution: Group the data in time bands. Consolidate the data of
  * the same group in larger spaces of time, for example in minutes.
  * 
  * @param data Events content in JSON format
  * @return Array of data to build a chart
  */
export default class DataDigestor {

    /**
      * @constructor
      * @param data Events content in JSON format
      */
    constructor(data = '') {
        this.data = data;
        this.result = [];
    }

    /**
      * Digests all imputed data, validating each event, and returning
      * an array of data to build a chart.
      * 
      * @return Array of data to build a chart
      */
    digest() {

        // Checks if any data has been sent, otherwise returns an error
        this.data = this.data.trim()
        if (!this.data) {
            return Promise.reject(string.error_empty_input);
        }

        // Initiates the support variables
        var selectArray = [];
        var groupArray = [];
        var dataArray = []
        var begin, end;

        // Separate rows into array
        var array = this.data.split('\n');

        // Makes interaction row by row
        for (var i = 0; i < array.length; i++) {

            // Parsing the row for JSON and check for conversion errors
            var textErrorLine = 'Line ' + (i + 1) + ': ';
            try {
                array[i] = JSON5.parse(array[i]);
            } catch (e) {
                return Promise.reject(textErrorLine + string.error_invalid_input_data);
            }

            // Checks if the timestamp generates a valid date
            if (!this.isValidDate(new Date(array[i].timestamp))) {
                return Promise.reject(textErrorLine + string.error_invalid_timestamp);
            }

            // Process each row according to the type of event
            switch (array[i].type) {

                /***************************************
                * Process for the START event type
                ***************************************/
                case 'start':

                    // Checks if 'select' and 'group' attributes has imputed
                    if (!array[i].select || !array[i].group || array[i].select.length === 0 || array[i].group.length === 0) {
                        return Promise.reject(textErrorLine + string.error_invalid_fields_type.replace('$type', array[i].type));
                    }

                    // Assign data in support arrays
                    selectArray = array[i].select;
                    groupArray = array[i].group;

                    // Restarts the data array
                    dataArray = [];

                    break;

                /***************************************
                * Process for the SPAN event type
                ***************************************/
                case 'span':

                    // Checks if 'begin' and 'end' attributes has imputed
                    if (!array[i].begin || !array[i].end) {
                        return Promise.reject(textErrorLine + string.error_invalid_fields_type.replace('$type', array[i].type));
                    }

                    // Checks if the timestamp generates a valid date
                    if (!this.isValidDate(new Date(array[i].begin)) || !this.isValidDate(new Date(array[i].end))) {
                        return Promise.reject(textErrorLine + string.error_invalid_timestamp);
                    }

                    // Assign data in support variables
                    begin = array[i].begin;
                    end = array[i].end;

                    break;

                /***************************************
                * Process for the DATA event type
                ***************************************/
                case 'data':

                    // Checks if all attributes of type 'group' have been imputed
                    for (var g = 0; g < groupArray.length; g++) {
                        if (!array[i][groupArray[g]]) {
                            return Promise.reject(textErrorLine + string.error_invalid_group);
                        }
                    }

                    // Checks if all attributes of type 'select' have been imputed
                    for (var s = 0; s < selectArray.length; s++) {
                        if (!array[i][selectArray[s]]) {
                            return Promise.reject(textErrorLine + string.error_invalid_select);
                        }
                    }

                    // Assign data in support array
                    if (!dataArray) dataArray = [];
                    dataArray.push(array[i]);

                    break;

                /***************************************
                * Process for the STOP event type
                ***************************************/
                case 'stop':

                    // TODO: Does not do anything?!
                    break;

                /***************************************
                * Process default
                ***************************************/
                default:

                    // If the type is not valid, it throws an error
                    return Promise.reject(textErrorLine + string.error_invalid_type);
            }
        }

        // Throws an error if no line with the type 'start' was imputed
        if (selectArray.length === 0 || groupArray.length === 0) {
            return Promise.reject(string.error_empty_input_start);
        }

        // Throws an error if no line with the type 'span' was imputed
        if (!begin || !end) {
            return Promise.reject(string.error_empty_input_span);
        }

        // Throws an error if no line with the type 'data' was imputed
        if (dataArray.length === 0) {
            return Promise.reject(string.error_empty_input_data);
        }

        // Starts the preparation for generating the result array
        var auxArray = [];
        auxArray['legend'] = ['Time'];

        // Iterate the array of data to group them by time
        // It also prepares the titles of the legend
        for (i = 0; i < dataArray.length; i++) {

            // Checks if the data is between the delimited period
            if (dataArray[i].timestamp < begin || dataArray[i].timestamp > end) {
                continue;
            }

            // Prepares the timestamp for the time format '00:00'
            var totalMinutes = (dataArray[i].timestamp - begin) / 60000;
            var minutes = totalMinutes % 60;
            var hours = (totalMinutes - minutes) / 60;
            var time = this.leftPad(hours, 2) + ':' + this.leftPad(minutes, 2);

            // Prepares the data for the lines in the chart and the legend titles
            var groups = '';
            for (g = 0; g < groupArray.length; g++) {
                groups += dataArray[i][groupArray[g]] + ' ';
            }
            for (s = 0; s < selectArray.length; s++) {
                // Creates the legend title
                var legend = this.toTitleCase(groups + selectArray[s].split('_').join(' '));
                if (!auxArray['legend'].includes(legend)) {
                    auxArray['legend'].push(legend);
                }
                // Adds the value of the data to the chart line
                if (!auxArray[time]) {
                    auxArray[time] = [time];
                }
                auxArray[time].push(dataArray[i][selectArray[s]]);
            }
        }

        // Realign the data to finalize the result
        this.result = [];
        var validSizeData = auxArray['legend'].length;
        for (var k in auxArray) {

            // Ignore the column if all the data were not inputed for
            // all combinations between select and group
            if (auxArray[k].length == validSizeData) {
                this.result.push(auxArray[k]);
            }
        }

        // Returns the array with the formatted result for the build of the chart
        return Promise.resolve(this.result);
    }

    /**
      * Checks if a date is valid.
      * 
      * @param Date
      * @return boolean
      */
    isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    /**
      * Insert zeros to the left of a number.
      * 
      * Example:
      * leftPad(1, 4); // 0001
      * leftPad(12, 4); // 0012
      * leftPad(123, 4); // 0123
      * leftPad(1234, 4); // 1234
      * leftPad(12345, 4); // 12345
      *
      * @param value Number to be formatted
      * @param totalWidth Number of digits
      * @return Formatted number
      */
    leftPad(value, totalWidth) {
        var length = totalWidth - value.toString().length + 1;
        return Array(length).join('0') + value;
    };

    /**
      * Converting string to title case.
      * 
      * @param String
      * @return Formatted string
      */
    toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
      * Returns the result that was previously generated.
      * 
      * @return result
      */
    get value() {
        return this.result;
    }

}