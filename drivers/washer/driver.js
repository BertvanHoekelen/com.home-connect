'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const programMap = {
	'cotton': 'LaundryCare.Washer.Program.Cotton',
	'easycare': 'LaundryCare.Washer.Program.EasyCare',
	'mix': 'LaundryCare.Washer.Program.Mix',
	'silk': 'LaundryCare.Washer.Program.DelicatesSilk',
	'wool': 'LaundryCare.Washer.Program.Wool',
}

const temperatureMap = {
	'cold': 'LaundryCare.Washer.EnumType.Temperature.Cold',
	'20c': 'LaundryCare.Washer.EnumType.Temperature.GC20',
	'30c': 'LaundryCare.Washer.EnumType.Temperature.GC30',
	'40c': 'LaundryCare.Washer.EnumType.Temperature.GC40',
	'50c': 'LaundryCare.Washer.EnumType.Temperature.GC50',
	'60c': 'LaundryCare.Washer.EnumType.Temperature.GC60',
	'70c': 'LaundryCare.Washer.EnumType.Temperature.GC70',
	'80c': 'LaundryCare.Washer.EnumType.Temperature.GC80',
	'90c': 'LaundryCare.Washer.EnumType.Temperature.GC90',
}

const spinMap = {
	'off': 'LaundryCare.Washer.EnumType.SpinSpeed.Off',
	'400rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM400',
	'600rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM600',
	'800rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM800',
	'1000rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM1000',
	'1200rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM1200',
	'1400rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM1400',
	'1600rpm': 'LaundryCare.Washer.EnumType.SpinSpeed.RPM1600',
}

class HomeConnectDriverOven extends HomeConnectDriver {
	
	onInit() {
		super.onInit();
		
		new Homey.FlowCardAction('program_washer')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap[args.program], {
					temperature: temperatureMap[args.temperature],
					spin: spinMap[args.spin]
				})
			})
		}
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'Washer';
	}

}

module.exports = HomeConnectDriverOven;