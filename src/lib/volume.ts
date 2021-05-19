import { execSync } from 'child_process';
import ADS1115 from 'ads1115';
import i2c from 'i2c-bus';

const mixer = 'Master';

const regex = /Front Left: \d+ \[(\d+)%\]/;

function read(): number {
    const output = execSync(`amixer get ${mixer}`).toString();

    const match = output.match(regex);

    if (match) {
        return parseInt(match[1], 10);
    }

    console.warn('could not parse output', output);

    return -1;
}

function write(percent: number): void {
    console.log(`set volume to ${percent}%`);
    execSync(`amixer set ${mixer} ${Math.min(100, Math.max(0, percent))}%`);
}

export default async function start(
    minVolume: number,
    maxVolume: number,
): Promise<() => void> {
    let currentVolume = read();

    const bus = await i2c.openPromisified(1);
    const ads1115 = await ADS1115(bus);

    let max = 17000;
    let min = 1;

    let timer: NodeJS.Timeout | undefined = undefined;

    async function measure() {
        timer = undefined;
        const value = await ads1115.measure('0+GND');

        max = Math.max(value, max);
        min = Math.min(value, min);

        const percent = 100 - Math.round(((value - min) * 100) / (max - min));
        const volume =
            Math.round((percent * (maxVolume - minVolume)) / 100) + minVolume;

        if (volume !== currentVolume) {
            write(volume);
            currentVolume = volume;
        }

        timer = setTimeout(measure, 500);
    }

    timer = setTimeout(measure, 500);

    return () => {
        if (timer) {
            clearTimeout(timer);
        }
    };
}
