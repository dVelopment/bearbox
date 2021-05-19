const rpio = require('rpio');
const button1 = 11;
const button2 = 8;

rpio.open(button1, rpio.INPUT);
rpio.open(button2, rpio.INPUT);

let state1 = false;
let state2 = false;

function read() {
    const newState1 = rpio.read(button1);
    const newState2 = rpio.read(button2);
    if (newState1 && !state1) {
        console.log('button 1');
    }
    if (newState2 && !state2) {
        console.log('button 2');
    }
    state1 = newState1;
    state2 = newState2;

    setTimeout(read, 50);
}

setTimeout(read, 50);
