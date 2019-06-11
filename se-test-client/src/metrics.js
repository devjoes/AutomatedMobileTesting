import * as Influx from 'influx';
import mlog from 'mocha-logger';
import fs from 'fs';
import config from './config';

const influx = new Influx.InfluxDB(Object.assign({}, {
    schema: [{
            measurement: 'client_test_events',
            fields: {
                test_active_offset: Influx.FieldType.INTEGER,
                test_duration: Influx.FieldType.INTEGER,
                test_name: Influx.FieldType.STRING,
                suite_name: Influx.FieldType.STRING,
                udid: Influx.FieldType.STRING
            },
            tags: [
                'udid',
                'suite_name',
                'state'
            ]
        },
        {
            measurement: 'client_suite_events',
            fields: {
                suite_active_offset: Influx.FieldType.INTEGER,
                suite_duration: Influx.FieldType.INTEGER,
                test_count: Influx.FieldType.INTEGER,
                suite_name: Influx.FieldType.STRING,
                udid: Influx.FieldType.STRING
            },
            tags: [
                'udid',
                'state'
            ]
        }
    ]
},config.influxdbConfig));

export const suiteStarted = (udid, name, testCount) => {
    debug('suite started', udid, name, testCount);
    influx.writePoints([{
        measurement: 'client_suite_events',
        tags: {
            udid,
            state: 'start'
        },
        fields: {
            udid,
            suite_name: name,
            suite_active_offset: 1,
            test_count: testCount
        }
    }]);
}
export const testStarted = (udid, suiteName, testName) => {
    debug('test started', udid, suiteName, testName);
    influx.writePoints(
        [{
            measurement: 'client_test_events',
            tags: {
                udid,
                state: 'start'
            },
            fields: {
                udid,
                suite_name: suiteName,
                test_active_offset: 1,
                test_name: testName
            }
        }]);
}
export const suiteCompleted = (udid, name, testCount, duartion) => {
    debug('suite completed', udid, name, testCount, duartion);
    influx.writePoints([{
        measurement: 'client_suite_events',
        tags: {
            udid,
            state: 'complete'
        },
        fields: {
            udid,
            suite_name: name,
            suite_active_offset: -1,
            suite_duration: duartion,
            test_count: testCount
        }
    }]);
}
export const testCompleted = (udid, suiteName, testName, duration) => {
    debug('test completed', udid, suiteName, testName, duration);
    influx.writePoints(
        [{
            measurement: 'client_test_events',
            tags: {
                udid,
                state: 'complete'
            },
            fields: {
                udid,
                suite_name: suiteName,
                test_active_offset: -1,
                test_name: testName,
                test_duration: duration
            }
        }]);
}

const debug = (...args) => {
    mlog.log(args);
    //fs.appendFileSync('C:\\temp\\log.txt', args.join('\t') + '\n');
}