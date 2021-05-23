import { resolve } from 'path';
import { play, stop } from './lib/player';
import scan from './lib/nfc';
import volume from './lib/volume';

let currentUid: string | undefined;

const UIDS = ['5dff884f65', '1dff884f25'];

function onUidFound(uid: string) {
    const idx = UIDS.findIndex((id) => id === uid);

    if (idx === -1) {
        console.error('unknown UID:' + uid);
        return;
    }

    if (uid === currentUid) {
        return;
    }

    currentUid = uid;

    const file = resolve(process.cwd(), `${idx + 1}.mp3`);

    console.info(`playing ${file}`);

    play(file);
}

function onCardRemoved() {
    currentUid = undefined;
    stop();
}

volume(50, 90).then(() => {
    scan(onUidFound, onCardRemoved);
});
