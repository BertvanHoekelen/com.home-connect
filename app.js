'use strict';

const Homey = require('homey');

class HomeConnectApp extends Homey.App {

	onInit() {
		this.log('HomeConnectApp is running...');
	}

}

module.exports = HomeConnectApp;