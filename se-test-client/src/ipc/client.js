import ipc from 'node-ipc';

ipc.config.id = 'testing';
ipc.config.retry = 1500;
ipc.config.silent = true;

export default clientId => {
    const getEmulator = (depth = 0) => new Promise((res, rej) => {
        ipc.connectTo(
            ipc.config.id,
            () => {
                ipc.of.testing.on(
                    'connect',
                    function () {
                        if (!ipc.of.testing){
                            // ipc.of.testing is sometimes undefined (disconnected?) - its like a weird JS race condition
                            if (depth > 5) {
                                rej();
                            } else {
                                res(getEmulator(depth + 1));
                            }
                            return;
                        }
                        ipc.of.testing.emit('get_emulator', {
                            clientId
                        });
                    });
                ipc.of.testing.on(
                    'got_emulator_for_' + clientId,
                    e => {
                        console.log('got_emulator_for_' + clientId);
                        res(e);
                        ipc.disconnect(ipc.config.id);
                    }
                );
            }
        );
    });
    const releaseEmulator = (udid, depth = 0) => new Promise(res => {
        ipc.connectTo(
            ipc.config.id,
            () => ipc.of.testing.on(
                'connect',
                function () {
                    if (!ipc.of.testing){
                        // ipc.of.testing is sometimes undefined (disconnected?) - its like a weird JS race condition
                        if (depth > 5) {
                            rej();
                        } else {
                            res(releaseEmulator(udid, depth + 1));
                        }
                        return;
                    }
                    ipc.of.testing.emit('release_emulator', {
                        udid
                    });
                    console.log('release_emulator_for_' + udid);
                    res();
                    ipc.disconnect(ipc.config.id);
                })
        );
    });

    return {
        getEmulator,
       releaseEmulator 
    };
};