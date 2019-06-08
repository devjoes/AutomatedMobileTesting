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
import {
  isWebDriverException
} from 'wd/lib/utils';

const Reset = "\x1b[0m"
const Bright = "\x1b[1m"
const MaxAttemptsToGetDriver = 20;

export const releaseDriver = async (emulator, test, driver, {
  managementUrl = defaultManagementUrl
}) => {
  const {
    url,
    auth
  } = parseAuthUrl(managementUrl);
  debug('started release driver ', emulator, new Date());
  if (driver) {
    await driver.quit();
  }
  await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    method: 'DELETE',
    body: JSON.stringify({emulator, test})
  });
  debug('finished release driver ', emulator, new Date());
}

const getSimpleDriver = async (node, udid, connection, capabilities) => new Promise((res, rej) => {
  const driver = promiseChainRemote(connection);
  // setTimeout( async() => {
  //   debug('driver.quit');
  //   await driver.quit();
  // }, 30000);
  debug('initing');
  const p = driver.init(Object.assign({}, capabilities, {
    browserVersion: node,
    udid,
    deviceName: udid
  }));
  debug('p', p);
  p.then(() => {
    debug('inited');
    res({
      driver,
      emulator: udid
    });
  }).catch((e) => {
    debug('error', e);
    rej(new Error(e));
  });
});

export const getDriver = async (testName, {
  capabilities = wdCapabilities,
  connection = wdConnection,
  managementUrl = defaultManagementUrl,
  depth = 0
}) => {
  const udid = process.env.udid;
  const node = 'node-'+ udid.split('_')[0];
  return await getSimpleDriver(node, udid, connection, capabilities);
  // This results in a promise that is never resolved
  //return await promiseWithTimeout(new Promise(async res => {
  debug('started get driver ', depth, testName, new Date());
  const capsForEmulator = await getCapabilities(capabilities, testName, managementUrl);
  debug('getting driver ', depth, testName, capsForEmulator.udid, new Date());
  let driver = await initAndTestDriver(testName, connection, capsForEmulator);
  // if (!driver) {
  //   debug(Bright + 'getting driver failed ' + Reset, depth, testName, capsForEmulator.udid, new Date());
  //   await new Promise(r => setTimeout(r, 1000));
  //   driver = await promiseWithTimeout(initAndTestDriver(testName, connection, capsForEmulator), 30000).catch(() => null);
  //   if (!driver) {
  //     //setTimeout(async () => {
  //     // We don't release the old emulator here - it is playing up so we give it some time to calm down before using it again
  //     await releaseDriver(capsForEmulator.udid, testName, null, {
  //       managementUrl
  //     });
  //     //}, 0);
  //     return await getDriver(testName, {
  //       capabilities,
  //       connection,
  //       managementUrl,
  //       depth: depth + 1
  //     });
  //     // res(await getDriver(testName, {
  //     //   capabilities,
  //     //   connection,
  //     //   managementUrl,
  //     //   depth: depth + 1
  //     // }));
  //   }
  // }
  debug('finished get driver ', testName, new Date());
  return {
    driver,
    emulator: capsForEmulator.udid
  };
  // res({
  //   driver,
  //   emulator: capsForEmulator.udid
  // });
  //}), 300000);
};

export const promiseWithTimeout = (p, ms) =>
  Promise.race([
    p,
    new Promise((res, rej) => {
      const st = setTimeout(() => {
        clearTimeout(st);
        debug('timeout after ' + ms);
        rej(new Error('timeout after ' + ms));
      }, ms)
    })
  ]);

const initAndTestDriver = async (testName, connection, capabilities) => {
  const driver = promiseChainRemote(connection);
  try {
    debug('init driver', testName, capabilities.udid);
    await driver.init(capabilities);
    debug('inited driver', testName, capabilities.udid);
    // debug('test driver', testName, capabilities.udid);
    // await driver.elementByAccessibilityIdOrNull('foo');
    // debug('tested driver', testName, capabilities.udid);
    return driver;
  } catch (ex) {
    debug('test failed', testName);
    await driver.quit();
    return null;
  }
};

const getCapabilities = (capabilities, testName, managementUrl, attempt = 0) => new Promise((res, rej) => {
  if (!managementUrl) {
    res(capabilities);
    return;
  }
  if (!testName) {
    throw new Error('Test has no name');
  }

  getFreeEmulator(managementUrl, testName)
    .then(r => {
      debug(r.status, r.statusText, Array.from(r.headers.entries()).filter(i => i[0] === 'retry-after'))
      if (r.ok) {
        r.json().then(j => {
          if (!j) {
            getCapabilities(capabilities, testName, managementUrl, attempt + 1).then(res);
          } else {
            res(Object.assign({}, capabilities, {
              browserVersion: j.node,
              udid: j.emulator
            }));
          }
        })

        return;
      }

      if (attempt > MaxAttemptsToGetDriver) {
        const msg = `Couldn't get driver after ${attempt} attempts giving up`;
        rej(new Error(msg));
      } else if (r.status !== 503){
        r.text().then(t => 
          rej(new Error(`Unexpected ${r.status} error (${r.statusText}): ${t}`)));
      } else {
        const retryAfter = Array.from(r.headers.entries()).filter(i => i[0] === 'retry-after');
        const delay =( (retryAfter.length ? parseInt(retryAfter[0][1]) : 5) * (attempt + 2)) * 0.25;
        debug(`Unable to get free emulator, retrying in ${delay} secs`, testName);
        setTimeout(() => getCapabilities(capabilities, testName, managementUrl, attempt + 1)
          .then(res).catch(rej),
          delay * 1000);
      }
    });
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
      url
    };
  }
  const [_, proto, username, password, theRest] = url.match(/^(.+?\/\/)(\w+):([^@]+)@(.+)$/);
  return {
    url: proto + theRest,
    auth: 'Basic ' + Buffer.from(username + ":" + password).toString('base64')
  }
};

export const debug = (...msgs) => {
  fs.appendFileSync('log.txt', msgs.join('|') + "\n");
  //mlog.log(msgs.join("\t"));
}