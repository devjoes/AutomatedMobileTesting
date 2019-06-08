import fetch from 'node-fetch';
import config from '../config';

const getBrowsers = r =>
  r.map(n => Object.values(n.protocols['web_driver'].browsers)[0])
  .map(b => {
    const host = Object.keys(b).filter(k => Array.isArray(b[k]))[0];
    return {
      type: b.name,
      host,
      capabilities: b[host][0].capabilities
    }
  });

const getEmulators = data =>
  getBrowsers(data)
  .filter(b => b.type === 'android')
  .reduce((acc, b) =>
    acc.concat([...new Array(b.capabilities.maxInstances).keys()]
      .map(i => ({
        type: b.type,
        host: b.host,
        udid: b.host.substr(5) + '_' + i + ':5555'
      }))), []);

const syncEmulators = (data, intervalMs) => new Promise(res =>
  fetch(config.seleniumUrl + '/grid/admin/Console/', {
    headers: config.seleniumHeaders
  })
  .finally(() => {
     setTimeout(() => syncEmulators(data, intervalMs), intervalMs);
     res();
  })
  .catch(console.warn)
  .then(r => r.json())
  .then(j => data.updateEmulators(getEmulators(j.nodes)))
);

export default syncEmulators;

/*
{
  "nodes": [
    {
      "protocols": {
        "web_driver": {
          "browsers": {
            "android": {
              "name": "android",
              "node-droid722700001J": [ {}, {}, {} ]
            }
          }
        }
      }
    }
  ]
}
*/