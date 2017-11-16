'use strict';

const Homey = require('homey');
const HomeConnectApi = require('./HomeConnectApi');

class HomeConnectDevice extends Homey.Device {

	onInit() {

		let data = this.getData();
		this._haId = data.haId;

		let store = this.getStore();
		this._api = new HomeConnectApi();
		this._api.setToken( store.token );
		this._api.enableEvents( this._haId )
			.then(() => this.log('Listening for events') )
			.catch( this.error )
		this._api.on('event', this._onEvent.bind(this))

		this.log('onInit', this._haId);

		this.sync()
			.catch( err => {
				this.error(err);
				this.setUnavailable(err);
			});
	}

	sync() {

		let getStatus = this._api.getStatus( this._haId )
			.then( result => {
				if( !Array.isArray(result.status) )
					throw new Error('Invalid response');

				result.status.forEach(statusObj => {
					this._parseStatus( statusObj.key, statusObj.value )
						.catch( this.error )
				});

			})

		let getSettings = this._api.getSettings( this._haId )
			.then( result => {
				if( !Array.isArray(result.settings) )
					throw new Error('Invalid response');

				result.settings.forEach(settingObj => {
					this._parseSetting( settingObj.key, settingObj.value )
						.catch( this.error )
				});

			})

		return Promise.all([ getStatus, getSettings ]);
	}

	_parseStatus( key, value ) {
		// overload this method in device.js
	}

	_parseSetting( key, value ) {
		// overload this method in device.js
	}

	_setSetting( key, value ) {
		return this._api.setSetting( this._haId, key, value );
	}

	_onEvent( message ) {
		console.log('message', message)
	}
}

module.exports = HomeConnectDevice;