import Mfrc522 from 'mfrc522-rpi';
import SoftSPI from 'rpi-softspi';

export default function start(
    onCardFound: (uuid: string) => void,
    onCardRemoved: () => void,
): () => void {
    const softSPI = new SoftSPI({
        clock: 23, // pin number of SCLK
        mosi: 19, // pin number of MOSI
        miso: 21, // pin number of MISO
        client: 24, // pin number of CS
    });

    // GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
    // I believe that channing pattern is better for configuring pins which are optional methods to use.
    const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);
    let lastUid: string | null = null;

    function read() {
        mfrc522.reset();

        // scan for cards
        let response = mfrc522.findCard();

        if (!response.status) {
            lastUid = null;
            onCardRemoved();
            return;
        }

        // get the UID of the card
        response = mfrc522.getUid();

        if (!response.status) {
            console.warn('UID scan error');
            return;
        }

        const uid = response.data
            .map((part: number) => part.toString(16))
            .join('');

        if (uid !== lastUid) {
            lastUid = uid;
            onCardFound(uid);
        }

        mfrc522.stopCrypto();
    }

    const interval = setInterval(read, 1000);

    return () => {
        clearInterval(interval);
    };
}
