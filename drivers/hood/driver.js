'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const levelMap = require('./consts/level');
const ventingLevelMap = require('./consts/ventingLevel');
const programMap = require('./consts/program');

class HomeConnectDriverHood extends HomeConnectDriver {

	onOAuth2Init() {
		super.onOAuth2Init();

		new Homey.FlowCardAction('program_venting')
			.register()
			.registerRunListener( args => {
				const types = args.venting_level.split('_');

				return args.device.startVenting(levelMap[types[0]], ventingLevelMap[args.venting_level]);
			});

		new Homey.FlowCardAction('program_automatic')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap['automatic'])
			});

		new Homey.FlowCardAction('program_delayed_shut_off')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap['delayed_shut_off'])
			});
	}

	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'Hood';
	}
	
}

module.exports = HomeConnectDriverHood;