const Mopidy = require('mopidy');

const mopidy = new Mopidy({
    webSocketUrl: 'ws://10.0.0.44:6680/mopidy/ws',
});

async function browse(uri) {
    try {
        const result = await mopidy.library.browse({ uri });

        console.log(result);
        return result;
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

mopidy.on('state:online', () => {
    // mopidy.playlists.asList().then(
    //     (list) => {
    //         console.log('list', list);
    //
    //         Promise.all(
    //             list.map(({ uri }) =>
    //                 mopidy.playlists.getItems({ uri }).then(console.log),
    //             ),
    //         ).then(
    //             () => {
    //                 process.exit(0);
    //             },
    //             (errors) => {
    //                 console.error(errors.message);
    //                 process.exit(1);
    //             },
    //         );
    //     },
    //     (error) => {
    //         console.error(error.message);
    //         process.exit(1);
    //     },
    // );
    // mopidy.playlists.getItems({ uri: 'm3u' }).then(
    //     (item) => {
    //         console.log('item', item);
    //     },
    //     (error) => {
    //         console.error(error.message);
    //         process.exit(1);
    //     },
    // );
    browse(null).then((list) =>
        Promise.all(
            list
                .filter(({ uri }) => /^(?:file)/.test(uri))
                .map(({ uri }) => browse(uri)),
        ).then(() => {
            process.exit(0);
        }),
    );
});
