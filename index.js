const Mfrc522 = require('mfrc522-rpi');
const SoftSPI = require('rpi-softspi');
const { resolve } = require('path');
const { spawn } = require('child_process');

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log('scanning...');
console.log('Please put chip or keycard in the antenna inductive zone!');
console.log('Press Ctrl-C to stop.');

const UIDS = ['5dff884f65', '1dff884f25'];

let proc;
let currentUid;

function play(uid) {
    const idx = UIDS.findIndex((id) => id === uid);
    if (idx === -1) {
        console.error('unknown UID: ' + uid);
        return;
    }

    if (uid === currentUid) {
        return;
    }

    currentUid = uid;

    const file = resolve(process.cwd(), `${idx + 1}.mp3`);

    console.info(`playing ${file}`);

    if (proc) {
        proc.kill();
    }

    proc = spawn('mpg123', ['-o', 'alsa', file], { stdio: 'inherit' });
}

function stop() {
    if (proc) {
        proc.kill();
        currentUid = undefined;
    }
}

const softSPI = new SoftSPI({
    clock: 23, // pin number of SCLK
    mosi: 19, // pin number of MOSI
    miso: 21, // pin number of MISO
    client: 24, // pin number of CS
});

// GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
// I believe that channing pattern is better for configuring pins which are optional methods to use.
const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);

setInterval(function () {
    //# reset card
    mfrc522.reset();

    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        stop();
        return;
    }

    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        console.log('UID Scan Error');
        return;
    }
    //# If we have the UID, continue
    const uid = response.data.map((part) => part.toString(16)).join('');

    if (uid !== currentUid) {
        console.log('Card read UID: %s', uid);

        play(uid);
    }

    //# Stop
    // mfrc522.stopCrypto();
}, 1000);
