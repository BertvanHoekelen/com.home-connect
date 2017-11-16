'use strict';

const events = require('events');
const querystring = require('querystring');

const Homey = require('homey');
const EventSource = require('eventsource');
const rp = require('request-promise-native');

const scopes = [
	'IdentifyAppliance',
	'Monitor',
	'Control',
	'Images',
	'Settings',
];

const DEBUG = process.env.DEBUG === '1';
if( DEBUG ) console.log('WARNING: App is communicating with DEVELOPER servers, not PRODUCTION.\nRun app with --install to use PRODUCTION servers.\n');

class HomeConnectApi extends events.EventEmitter {

	constructor() {
		super();

		let apiUrlSubdomain = ( DEBUG ) ? 'developer' : 'api';

		this._clientId = Homey.env.CLIENT_ID;
		this._clientSecret = Homey.env.CLIENT_SECRET;
		this._oAuth2AuthorizationUrl = `https://${apiUrlSubdomain}.home-connect.com/security/oauth/authorize`;
		this._oAuth2TokenUrl = `https://${apiUrlSubdomain}.home-connect.com/security/oauth/token`
		this._apiUrl = `https://${apiUrlSubdomain}.home-connect.com/api`;
		this._redirectUri = 'https://callback.athom.com/oauth2/callback';
		this._token = null;
		this._events = {};

		if( typeof this._clientId !== 'string' )
			throw new Error('Missing Client ID');

		if( typeof this._clientSecret !== 'string' )
			throw new Error('Missing Client Secret');

	}

	/*
		OAuth2 Methods
	*/

	getOAuth2AuthorizationUrl() {
		let qs = querystring.stringify({
			client_id: this._clientId,
			redirect_uri: this._redirectUri,
			response_type: 'code',
			scope: scopes.join(' ')
		});
		return `${this._oAuth2AuthorizationUrl}?${qs}`;
	}

	async getOAuth2Token( code ) {
		return rp.post({
			url: this._oAuth2TokenUrl,
			json: true,
			form: {
				client_id: this._clientId,
				client_secret: this._clientSecret,
				redirect_uri: this._redirectUri,
				grant_type: 'authorization_code',
				code: code,
			}
		});
	}

	async refreshOAuth2Token() {

		if( typeof this._token !== 'object' )
			throw new Error('Missing token');
			
		return rp.post({
			url: this._oAuth2TokenUrl,
			json: true,
			form: {
				refresh_token: this._token,
				grant_type: 'refresh_token',
			}
		})
	}

	getToken() {
		return this._token;
	}

	setToken( token ) {
		this._token = token;
	}

	async enableEvents( haId ) {
		if( this._events[ haId ] ) return;
		
		if( typeof this._token !== 'object' )
			throw new Error('Missing token');
				
		this._events[ haId ] = new EventSource(`${this._apiUrl}/homeappliances/${haId}/events`, {
			headers: {
				'Accept-Language': 'en-US',
				'Authorization': `Bearer ${this._token.access_token}`
			}
		});
		
		[ 'status', 'event', 'notify' ].forEach( eventType => {
			this._events[ haId ].on(eventType.toUpperCase(), e => {								
				try {
					let data = JSON.parse(e.data);
					this.emit(eventType, data.items);
				} catch( err ) {}
			})
		})
		
		return new Promise((resolve, reject) => {
			this._events[ haId ].onopen = ( e ) => {
				if( e.type === 'open' )
					return resolve();
				return reject( new Error('Invalid response') );
			};

			this._events[ haId ].onerror = ( err ) => {
				if( err && err.status )
					return reject( new Error(`Invalid status code, got: ${err.status}`) );
				reject( err )
			};
		});
	}

	async disableEvents( haId ) {
		if( typeof this._events[ haId ] === 'undefined' ) return;

		this._events[ haId ].close();
		this._events[ haId ] = null;
	}

	/*
		API Helper methods
	*/
	async _call( method, path, data ) {

		if( typeof this._token !== 'object' )
			throw new Error('Missing token');
			
		return rp({
			method: method,
			url: `${this._apiUrl}${path}`,
			json: data || true,
			headers: {
				'Accept': 'application/vnd.bsh.sdk.v1+json',
				'Content-Type': 'application/vnd.bsh.sdk.v1+json',
				'Authorization': `Bearer ${this._token.access_token}`
			}
		}).then( result => {
			if( result && result.data )
				return result.data;
			return result;
		}).catch( err => {
			
			// check if access_token is expired, try to refresh it
			if( err.statusCode === 401 )
				return this.refreshOAuth2Token()
					.then( token => {
						this.setToken(token);
						this.emit('token', this._token);
					})
			
			if( err && err.error && err.error.error ) {
				throw new Error( err.error.error.description || err.error.error.key )
			} else {
				throw err;
			}
		})
	}

	_get( path ) {
		return this._call( 'GET', path );
	}

	_post( path, data ) {
		return this._call( 'POST', path, data );
	}

	_put( path, data ) {
		return this._call( 'PUT', path, data );
	}

	_delete( path, data ) {
		return this._call( 'DELETE', path, data );
	}

	/*
		API Methods
	*/
	getHomeAppliances() {
		return this._get('/homeappliances');
	}

	getStatus( haId ) {
		return this._get(`/homeappliances/${haId}/status`);
	}

	getSettings( haId ) {
		return this._get(`/homeappliances/${haId}/settings`);
	}

	setSetting( haId, key, value ) {
		return this._put(`/homeappliances/${haId}/settings/${key}`, {
			data: {
			    key: key,
			    value: value
			}
		});
	}
	
	setProgram( haId, programId, options ) {
		return this._put(`/homeappliances/${haId}/programs/active`, {
			data: {
				key: programId,
				options: options
			}
		});
	}
	
	stopProgram( haId ) {
		return this._delete(`/homeappliances/${haId}/programs/active`);		
	}

}

module.exports = HomeConnectApi;