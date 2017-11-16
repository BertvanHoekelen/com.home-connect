'use strict';

const Homey = require('homey');
const homeConnectApi = require('../services/HomeConnectApi');

class HomeConnectDriver extends Homey.Driver {

	onPair( socket ) {

		let token = null;

		let apiUrl = homeConnectApi.getOAuth2AuthorizationUrl();
		new Homey.CloudOAuth2Callback(apiUrl)
			.on('url', url => {
				socket.emit('url', url);
			})
			.on('code', async code => {
				try {
					token = await homeConnectApi.getOAuth2Token(code);
					socket.emit('authorized');
				} catch( err ) {
					this.error( err );
					socket.emit('error', err);
				}
			})
			.generate()
			.catch( err => {
				socket.emit('error', err);
			})

		socket.on('list_devices', ( data, callback ) => {
			this._onPairListDevices( token )
				.then( result => {
					callback( null, result );
				}).catch( err => {
					callback( err );
				})
		});

	}

}

module.exports = HomeConnectDriver;