'use strict';

const Homey = require('homey');
const HomeConnectApi = require('./HomeConnectApi');

class HomeConnectDriver extends Homey.Driver {
	
	onInit() {
		super.onInit();
		
		new Homey.FlowCardAction('program_stop')
			.register()
			.registerRunListener( args => {
				return args.device.stopProgram();
			})
	}

	onPair( socket ) {

		let homeConnectApi = new HomeConnectApi();

		let apiUrl = homeConnectApi.getOAuth2AuthorizationUrl();
		new Homey.CloudOAuth2Callback(apiUrl)
			.on('url', url => {
				socket.emit('url', url);
			})
			.on('code', async code => {
				try {
					let token = await homeConnectApi.getOAuth2Token(code);
					homeConnectApi.setToken(token);
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
	
			return homeConnectApi.getHomeAppliances()
				.then( result => {
	
					if( !Array.isArray(result.homeappliances) )
						throw new Error('Invalid response');
	
					let devices = [];
					result.homeappliances.forEach( homeAppliance => {
						
						if( this._onPairFilter(homeAppliance) !== true ) return;
						
						devices.push({
							data: {
								haId: homeAppliance.haId
							},
							name: homeAppliance.name,
							store: {
								token: homeConnectApi.getToken()
							}
						});
					});
	
					callback( null, devices );
	
				})
				.catch( err => {
					this.error(err);
					socket.emit('error', err);
				})
		});

	}
	
	_onPairFilter( homeAppliance ) {
		return true;
	}

}

module.exports = HomeConnectDriver;