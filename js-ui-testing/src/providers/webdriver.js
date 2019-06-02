import {
  promiseChainRemote
} from 'wd';
import fetch from 'node-fetch';
import mlog from 'mocha-logger';
import fs from 'fs';
import {
  wdConnection,
  wdCapabilities,
  defaultManagementUrl
} from '../config';

export const releaseDriver = async (emulator, driver, {
  managementUrl = defaultManagementUrl
}) => {
  const {
    url,
    auth
  } = parseAuthUrl(managementUrl);
  debug('started release driver ', emulator, new Date());
  if (driver){
    await driver.quit();
  }
  await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    method: 'DELETE',
    body: JSON.stringify(emulator)
  });
  debug('finished release driver ', emulator, new Date());
}

export const getDriver = async (testName, {
  capabilities = wdCapabilities,
  connection = wdConnection,
  managementUrl = defaultManagementUrl
}) => {
  debug('started get driver ', testName, new Date());
  const capsForEmulator = await getCapabilities(capabilities, testName, managementUrl);
  //const driver = promiseChainRemote(connection);
  //await driver.init(capabilities);
  let driver = await initAndTestDriver(testName,connection, capsForEmulator);
  if(!driver){
    await new Promise(r => setTimeout(r, 1000));
    driver = await initAndTestDriver(testName, connection, capsForEmulator);
    if (!driver){
      setTimeout(() => {
        // We don't release the old emulator here - it is playing up so we give it some time to calm down before using it again
        releaseDriver(capsForEmulator.udid, driver, {managementUrl});
      }, 30000);
      return await getDriver(testName, {capabilities, connection, managementUrl});
    }
  }
  debug('finished get driver ', testName, new Date());
  return {
    driver,
    emulator: capsForEmulator.udid
  };
};

const initAndTestDriver = async (testName, connection, capabilities) =>{
  const driver = promiseChainRemote(connection);
  try{
    await driver.init(capabilities);
    return driver;
  } catch(ex){
    driver.quit();
    debug('test failed', testName);
    return null;
  }
};

const getCapabilities = (capabilities, testName, managementUrl, attempt = 0) => new Promise((res, rej) => {
  if (!managementUrl) {
    res(capabilities);
    return;
  }
  if (!testName) {
    throw Error('Test has no name');
  }

  getFreeEmulator(managementUrl, testName)
    .then(r => {
      if (r.ok) {
        return r.json();
      }

      if (r.status != 503 || attempt > 10) {
        r.text().then(debug);
        rej(r);
      } else {
        const retryAfter = Array.from(r.headers.entries()).filter(i => i[0] === 'retry-after');
        const delay = retryAfter.length ? parseInt(retryAfter[0][1]) : 5;
        debug(`Unable to get free emulator, retrying in ${delay} secs`, testName);
        rej();
        setTimeout(() => getCapabilities(capabilities, testName, managementUrl, attempt + 1).then(res),
          delay * 1000);
      }
    })
    .then(j =>      
      res(Object.assign({}, capabilities, {
        browserVersion: j.node,
        udid: j.emulator
      })));
});

const getFreeEmulator = (authUrl, testName) => {
  const {
    url,
    auth
  } = parseAuthUrl(authUrl);
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    method: 'POST',
    body: JSON.stringify(testName)
  });
};

const parseAuthUrl = url => {
  if (url.indexOf('@') === -1) {
    return {
      urlx
    };
  }
  const [_, proto, username, password, theRest] = url.match(/^(.+?\/\/)(\w+):([^@]+)@(.+)$/);
  return {
    url: proto + theRest,
    auth: 'Basic ' + Buffer.from(username + ":" + password).toString('base64')
  }
};

const debug = (...msgs) => {
  fs.appendFileSync('log.txt', msgs.join('|') + "\n");
  mlog.log(msgs.join("\t"));
}