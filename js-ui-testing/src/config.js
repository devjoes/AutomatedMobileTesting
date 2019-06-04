import { resolve } from 'path';


export let wdConnection = 'http://demo:demo@40.113.3.66/wd/hub';

// export let wdCapabilities = {
//   "deviceName":"android",
//   "platformName":"android",
//   "platformVersion":"4.2.2",
//   "app":"/apps/app.apk",
//   "browserName":"android",
//   "browserVersion":"node-droid7227000008",
//   "udid":"droid7227000008_1:5555"
// };

export let wdCapabilities = {
  "deviceName":"android",
  "platformName": "android",
  "platformVersion": "4.2.2",
  "app": "/apps/app.apk",
  "browserName":"android",
  "newSessionWaitTimeout":60000

  // "deviceName": "http://10.10.0.6:4723",
  // "browserVersion": "node-droid7227000007",
  // "udid":"droid7227000007_0:5555",




  //"udid":"b37756544751bcd1"
  //"udid":"dd23d7f959b2a99d"
  //"automationName":"UiAutomator2", not supported < 5
  
  // "UUID":"40f729ba-b468-47e3-ad06-d37457b78aaa"
};

export const defaultManagementUrl = "http://demo:demo@40.113.3.66/management/api/tests";

/*
import { resolve } from 'path';


export let wdConnection = 'http://127.0.0.1:4444/wd/hub';

export let wdCapabilities = [
  {
    "deviceName": "192.168.0.10:5555",
    "platformName": "Android",
    "platformVersion": "4.4",
    "systemPort": "8200",
    "app": "/app.apk"
  },
  {
    "deviceName": "192.168.0.11:5555",
    "platformName": "Android",
    "platformVersion": "4.2.2",
    "systemPort": "8201",
    "app": "/app.apk"
  }
];



*/