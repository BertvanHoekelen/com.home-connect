'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

class HomeConnectDriverOven extends HomeConnectDriver {
	
	onInit() {
		super.onInit();
		
		new Homey.FlowCardAction('program_oven_preheat')
			.register()
			.registerRunListener( args => {
				return args.device.setProgramPreheat({
					temperature: args.temperature,
					duration: ( args.duration ) ? args.duration / 1000 : 1200
				})
			})
	}
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'Oven';
	}

}

module.exports = HomeConnectDriverOven;