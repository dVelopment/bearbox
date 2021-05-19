const mixer = 'Master';
const { execSync } = require('child_process');

const regex = /Front Left: \d+ \[(\d+)%\]/;
function read() {
    const output = execSync(`amixer get ${mixer}`).toString();

    const match = output.match(regex);

    if (match) {
        return parseInt(match[1], 10);
    }

    console.warn('could not parse output', output);

    return -1;
}

function write(percent) {
    execSync(`amixer set ${mixer} ${percent}%`);
}

write(42);
console.log(read());
