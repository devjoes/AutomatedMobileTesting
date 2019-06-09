import ipc from 'node-ipc';

ipc.config.id = 'testing';
ipc.config.retry = 1500;
ipc.config.silent = true;

export default clientId => ({
    getEmulator: () => new Promise((res, rej) => {
        ipc.connectTo(
            ipc.config.id,
            () => {
                ipc.of.testing.on(
                    'connect',
                    function () {
                        if (!ipc.of.testing){
                            //TODO: This is undefined on retry
                            console.log('FAILED ipc.of.testing', JSON.stringify(ipc));
                            rej();
                        }
                        ipc.of.testing.emit('get_emulator', {
                            clientId
                        });
                        console.log('ipc.of.testing', JSON.stringify(ipc));
                    });
                ipc.of.testing.on(
                    'got_emulator_for_' + clientId,
                    e => {
                        res(e);
                        ipc.disconnect(ipc.config.id);
                    }
                );
            }
        );
    }),
    releaseEmulator: udid => new Promise(res => {
        ipc.connectTo(
            ipc.config.id,
            () => ipc.of.testing.on(
                    'connect',
                    function () {
                        ipc.of.testing.emit('release_emulator', {
                            udid
                        });
                        res();
                        ipc.disconnect(ipc.config.id);
                    })
        );
    })
});