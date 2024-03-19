const client = new (require('discord-rpc-revamp').Client)();
client.connect({ clientId: '1218201961296564297' }).catch(console.error);

class rpc {
    constructor() {
        client.on('ready', _ => {
            client.setActivity({
                details: 'EKC-Client',
                largeImageKey: 'kour',
                startTimestamp: Date.now(),
            }).then(_ => {
                console.log('[MAIN]'.bgGreen, 'Discord RPC Set'.blue);
            });
        
            client.subscribe('ACTIVITY_JOIN');
            client.subscribe('ACTIVITY_JOIN_REQUEST');
        
            client.on('ACTIVITY_JOIN', data => {});
        });

    }
}

module.exports = rpc;
