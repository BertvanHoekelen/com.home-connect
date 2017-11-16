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
		this._api.enableEvents( this._haId ).catch( this.error )
		this._api.on('status', this._onStatus.bind(this))
		this._api.on('notify', this._onNotify.bind(this))
		this._api.on('event', this._onEvent.bind(this))

		this.log('onInit', this._haId);

		this.sync()
			.catch( err => {
				this.error(err);
				this.setUnavailable(err);
			});
	}
	
	onDeleted() {
		this._api.disableEvents();
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
	
	_setProgram( programId, options ) {
		return this._api.setProgram( this._haId, programId, options );
	}
	
	_stopProgram() {
		return this._api.stopProgram( this._haId );
	}

	_onStatus( items ) {
		//this.log('_onStatus', items);
		
		Array.isArray(items) && items.forEach( item => {
			this._parseStatus( item.key, item.value );
		})
	}
	
	_onNotify( items ) {
		this.log('_onNotify', items);
		
	}
	
	_onEvent( items ) {
		this.log('_onEvent', items);
	}
}

module.exports = HomeConnectDevice;