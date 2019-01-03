'use strict';

const Homey = require('homey');
const HomeConnectOAuth2Client = require('./lib/HomeConnectOAuth2Client');
const { OAuth2App } = require('homey-oauth2app');

const SCOPES = [
	'IdentifyAppliance',
	'Monitor',
	'Control',
	'Images',
	'Settings',
];

const DEBUG = false; // process.env.DEBUG === '1'
if( DEBUG ) console.log('WARNING: App is communicating with DEVELOPER servers, not PRODUCTION.\nRun app with --install to use PRODUCTION servers.\n');

module.exports = class HomeConnectApp extends OAuth2App {

	onOAuth2Init() {

		const apiUrlSubdomain = ( DEBUG ) ? 'simulator' : 'api';
		
  	//this.enableOAuth2Debug();  	
  	this.setOAuth2Config({
    	client: HomeConnectOAuth2Client,
    	apiUrl: `https://${apiUrlSubdomain}.home-connect.com/api`,
    	tokenUrl: `https://${apiUrlSubdomain}.home-connect.com/security/oauth/token`,
    	authorizationUrl: `https://${apiUrlSubdomain}.home-connect.com/security/oauth/authorize`,
    	scopes: SCOPES,
  	});
  	
		this.log('HomeConnectApp is running...');
	}

}