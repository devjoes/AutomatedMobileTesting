import config from './config';

const sum = (a, f) =>
    a.reduce((acc, i) => {
        acc += f(i);
        return acc;
    }, 0);

const randomishIndex = ems => {
    const sumFailures = sum(ems, i => i.failures);
    const weightedIndexes = Object.keys(ems).reduce((acc, index) => {
        for (let i = 0; i < ((sumFailures - ems[index].failures) + 1); i++) {
            acc.push(index);
        }
        return acc;
    }, []);
    return weightedIndexes[Math.round(Math.random() * 10000) % weightedIndexes.length];
};

export default () => ({
    emulators: {},
    getEmulator: function () {
        const availableEms = Object.values(this.emulators)
            .filter(e => e.readyBy < new Date().getTime() && e.queueLength < config.maxQueueLength);

        return availableEms.length ?
            availableEms[randomishIndex(availableEms)] :
            null;
    },
    incrementQueueLength: function (udid) {
        this.emulators[udid].queueLength++;
        // Before we inform selenium syncRequests might run and reset this value
        this.emulators[udid].readyBy = new Date().getTime() + config.emulatorUpdateCoolOffMs;
    },
    decrementQueueLength: function (udid) {
        this.emulators[udid].queueLength--;
    },
    updateEmulators: function (newEmulators) {
        this.emulators = newEmulators
            .reduce((acc, em) => {
                const oldEmulator = (this.emulators || {})[em.udid];
                acc[em.udid] = Object.assign({}, em, {
                    // If the emulator is new then let it warm up
                    readyBy: oldEmulator && oldEmulator.readyBy || (new Date().getTime() + config.emulatorUpdateCoolOffMs),
                    queueLength: oldEmulator && oldEmulator.queueLength || 0,
                    failures: 0
                });
                return acc;
            }, {});
    },
    updateQueueLengths: function (queueLengths) {
        Object.keys(this.emulators).forEach(k => {
            this.emulators[k].queueLength = queueLengths[k] || 0;
            // Reset readyBy, set in incrementQueueLength
            this.emulators[k].readyBy = new Date().getTime()
        });
    },
    testFailure: function (udid) {
        this.emulators[udid].failures++;
    }
});