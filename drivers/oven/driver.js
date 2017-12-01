'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const programMap = {
	'preheat': 'Cooking.Oven.Program.HeatingMode.PreHeating',
	'pizza': 'Cooking.Oven.Program.HeatingMode.PizzaSetting',
	'hotair': 'Cooking.Oven.Program.HeatingMode.HotAir',
	'topbottom': 'Cooking.Oven.Program.HeatingMode.TopBottomHeating',
}

class HomeConnectDriverOven extends HomeConnectDriver {
	
	onInit() {
		super.onInit();
		
		new Homey.FlowCardAction('program_oven')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap[args.program], {
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