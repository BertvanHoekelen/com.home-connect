'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const programMap = {
	'cotton': 'LaundryCare.Dryer.Program.Cotton',
	'synthetic': 'LaundryCare.Dryer.Program.Synthetic',
	'mix': 'LaundryCare.Dryer.Program.Mix',
}

const targetMap = {
	'irondry': 'LaundryCare.Dryer.EnumType.DryingTarget.IronDry',
	'cupboarddry': 'LaundryCare.Dryer.EnumType.DryingTarget.CupboardDry',
	'cupboarddryplus': 'LaundryCare.Dryer.EnumType.DryingTarget.CupboardDryPlus',
}

class HomeConnectDriverDryer extends HomeConnectDriver {
	
	onInit() {
		super.onInit();
		
		new Homey.FlowCardAction('program_dryer')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap[args.program], {
					target: targetMap[args.target],
				})
			})
		}
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'Dryer';
	}

}

module.exports = HomeConnectDriverDryer;