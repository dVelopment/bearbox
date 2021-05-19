import { ChildProcess, spawn } from 'child_process';

let proc: ChildProcess | undefined;

export function stop() {
    if (proc) {
        proc.kill();
        proc = undefined;
    }
}

export function play(file: string): void {
    stop();

    proc = spawn('mpg123', ['-o', 'alsa', file], { stdio: 'inherit' });

    proc.on('close', () => {
        proc = undefined;
    });
}
