'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const programMap = {
	'auto1': 'Dishcare.Dishwasher.Program.Auto1',
	'auto2': 'Dishcare.Dishwasher.Program.Auto2',
	'auto3': 'Dishcare.Dishwasher.Program.Auto3',
	'eco50': 'Dishcare.Dishwasher.Program.Eco50',
	'quick45': 'Dishcare.Dishwasher.Program.Quick45',
}

class HomeConnectDriverDishwasher extends HomeConnectDriver {
	
	onInit() {
		super.onInit();
		
		new Homey.FlowCardAction('program_dishwasher')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap[args.program], {})
			})
		}
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'Dishwasher';
	}

}

module.exports = HomeConnectDriverDishwasher;