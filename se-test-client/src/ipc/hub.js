import ipc from 'node-ipc';


ipc.config.id = 'testing';
ipc.config.retry = 1500;
ipc.config.sync = true;
ipc.config.silent = true;

export default data => {
    ipc.serve(() => {
        ipc.server.on('get_emulator', (r, socket) => {
            const tmr = setInterval(() => {
                const em = data.getEmulator();
                if (!em) {
                    return;
                }
                clearInterval(tmr);
                data.incrementQueueLength(em.udid);
                ipc.server.emit(socket, 'got_emulator_for_' + r.clientId, em);
            });
        });
        ipc.server.on('release_emulator', r => {
            data.decrementQueueLength(r.udid);
        });
    });
    ipc.server.start();
    console.log('IPC Hub started');
};