class rpc {
    constructor() {
        const { Client } = require('discord-rpc');
        const client = new Client({ transport: 'ipc' });

        client.on('ready', () => {
            console.log('Discord RPC connected');
            client.setActivity({
                details: 'EKC-Client',
                largeImageKey: 'ekc_outline',
                startTimestamp: Date.now(),
                buttons: [{ label: 'Join Server', url: 'https://discord.gg/CvvBXY4Y5V' }],
            });
        });

        client.login({ clientId: '1091132902370197614' }).catch(console.error);
    }
}

module.exports = rpc;
