// import {
//     describe,
//     it
// } from 'mocha';
// import {
//     expect
// } from 'chai';
// import getDriver from '../getDriver';
// import {
//     basename
// } from 'path';
// import mlog from 'mocha-logger';
// import ipcClient from '../ipc/client';

// describe('When a test fails 3/4 of the time ' + basename(__filename), function () {
//     mlog.log('Describe start');
//     before(async ()=>{
//         mlog.log('Before');
//     });
//     after(()=>{
//         mlog.log('After');
//     });
//     beforeEach(async () =>{
//         const c1 = await ipcClient(1);
//         const e1 = await c1.getEmulator();
//         const e2 = await (await ipcClient(2)).getEmulator();
//         mlog.log('Before Each ', e1,e2);
//     });
//     it('Retries', () =>{
//         if ((Math.random() * 1000) % 8 > 2){
//             throw new Error('Kaboom!');
//         }
//         expect(true).to.eq(true);
//     });
// });