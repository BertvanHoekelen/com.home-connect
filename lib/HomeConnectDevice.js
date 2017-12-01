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
		this._api.on('status', this._onStatus.bind(this))
		this._api.on('notify', this._onNotify.bind(this))
		this._api.on('event', this._onEvent.bind(this))
		this._api.on('token', this._onToken.bind(this))

		this.log('onInit', this._haId);

		this.sync()
			.then(() => {
				return this._api.enableEvents( this._haId ).catch( this.error )
			})
			.then(() => {
				this.log('Subscribed to live events');
			})
			.catch( err => {
				this.setUnavailable(err);
				this.error(err);
			});
	}
	
	onDeleted() {
		this._api.disableEvents();
	}

	sync() {
		return this._api.getStatus( this._haId )
			.then( result => {
				if( !Array.isArray(result.status) )
					throw new Error('Invalid response');

				result.status.forEach(statusObj => {
					this._parseStatus( statusObj.key, statusObj.value )
						.catch( this.error )
				});
				
				return this._api.getSettings( this._haId ).catch( err => {
					return { settings: [] };
				})
			})
			.then( result => {
				if( !Array.isArray(result.settings) )
					throw new Error('Invalid response');

				result.settings.forEach(settingObj => {
					this._parseSetting( settingObj.key, settingObj.value )
						.catch( this.error )
				});

			})

		
	}

	async _parseStatus( key, value ) {
		// overload this method in device.js
		this.log('_parseStatus', key, value);	
	}

	async _parseSetting( key, value ) {
		// overload this method in device.js
		this.log('_parseSetting', key, value);	
	}
	
	_parseEvent( key, value ) {
		// overload this method in device.js
		this.log('_parseEvent', key, value);
	}
	
	_parseNotify( key, value ) {
		// overload this method in device.js	
		this.log('_parseNotify', key, value);	
	}

	_setSetting( key, value ) {
		return this._api.setSetting( this._haId, key, value );
	}
	
	_setProgram( programId, options ) {
		return this._api.setProgram( this._haId, programId, options );
	}
	
	async startProgram() {
		throw new Error('Not implemented');
	}
	
	async stopProgram() {
		return this._api.stopProgram( this._haId );
	}

	_onStatus( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseStatus( item.key, item.value );
		})
	}
	
	_onNotify( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseNotify( item.key, item.value );
		})
		
	}
	
	_onEvent( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseEvent( item.key, item.value );
		})
	}
	
	_onToken( token ) {
		this.log('Refreshed OAuth2 token');
		this.setStoreValue('token', token)
			.catch( this.error );
	}
}

module.exports = HomeConnectDevice;