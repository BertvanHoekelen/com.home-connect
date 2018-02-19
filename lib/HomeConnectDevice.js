'use strict';

const Homey = require('homey');
const HomeConnectApi = require('./HomeConnectApi');

const DEBUG = process.env.DEBUG === '1';

class HomeConnectDevice extends Homey.Device {

	onInit() {

		let data = this.getData();
		this._haId = data.haId;
		
		this._driver = this.getDriver();

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
				return this._api.enableEvents( this._haId ).catch( err => {
					this.error( err.message || err.toString() )
				})
			})
			.then(() => {
				this.log('Subscribed to live events');
			})
			.catch( err => {
				this.setUnavailable(err);
				this.error( err.message || err.toString() );
			});
	}
	
	onDeleted() {
		this._api.disableEvents();
	}

	async sync() {
		return this._api.getStatus( this._haId )
			.then( result => {
				if( !Array.isArray(result.status) )
					throw new Error('Invalid response');

				result.status.forEach(statusObj => {
					this._parseStatus({
						key: statusObj.key,
						value: statusObj.value,
						event: false,
					})
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

	// extend this method in device.js
	async _parseStatus({ key, value, event }) {
		DEBUG && this.log('_parseStatus', key, value, event);	
		
		if( event && key === 'BSH.Common.Status.DoorState' && value === 'BSH.Common.EnumType.DoorState.Open' )
			return this._driver.triggerFlowDoorOpened( this );
		
		if( event && key === 'BSH.Common.Status.DoorState' && value === 'BSH.Common.EnumType.DoorState.Closed' )
			return this._driver.triggerFlowDoorClosed( this );
		
	}

	// extend this method in device.js
	async _parseSetting( key, value ) {
		DEBUG && this.log('_parseSetting', key, value);	
	}

	// extend this method in device.js	
	async _parseEvent({ key, value }) {
		DEBUG && this.log('_parseEvent', key, value);
			
		if( key === 'BSH.Common.Event.ProgramFinished' )
			return this._driver.triggerFlowProgramFinished( this );
	}

	// extend this method in device.js	
	async _parseNotify({ key, value }) {
		DEBUG && this.log('_parseNotify', key, value);	
	}

	async _setSetting( key, value ) {
		return this._api.setSetting( this._haId, key, value );
	}
	
	async _setProgram( programId, options ) {
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
			this._parseStatus({
				key: item.key,
				value: item.value,
				event: true
			})
				.catch( this.error );
		})
	}
	
	_onNotify( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseNotify({
				key: item.key,
				value: item.value,
				event: true,
			})
				.catch( this.error )
		})
		
	}
	
	_onEvent( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseEvent({
				key: item.key,
				value: item.value,
				event: true
			})
				.catch( this.error )
		})
	}
	
	_onToken( token ) {
		this.log('Refreshed OAuth2 token');
		this.setStoreValue('token', token)
			.catch( this.error );
	}
}

module.exports = HomeConnectDevice;