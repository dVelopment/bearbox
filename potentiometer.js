const ADS1115 = require('ads1115');

const i2c = require('i2c-bus');

let max = 17000;
let min = 1;

i2c.openPromisified(1).then(async (bus) => {
    const ads1115 = await ADS1115(bus);
    // ads1115.gain = 1

    async function measure() {
        let value = await ads1115.measure('0+GND');

        max = Math.max(value, max);
        min = Math.min(value, min);

        const percent = 100 - Math.round(((value - min) * 100) / (max - min));
        console.log(value, '=>', percent, '%');

        setTimeout(measure, 500);
    }

    setTimeout(measure, 500);
});
