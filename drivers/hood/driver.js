'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const ventingLevelMap = {
	'venting_off': ' Cooking.Hood.EnumType.Stage.FanOff',
	'venting_1': 'Cooking.Hood.EnumType.Stage.FanStage01',
	'venting_2': 'Cooking.Hood.EnumType.Stage.FanStage02',
	'venting_3': 'Cooking.Hood.EnumType.Stage.FanStage03',
	'venting_4': 'Cooking.Hood.EnumType.Stage.FanStage04',
	'venting_5': 'Cooking.Hood.EnumType.Stage.FanStage05',
	'intensive_off': 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStageOff',
	'intensive_1': 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStage1',
	'intensive_2': 'Cooking.Hood.EnumType.IntensiveStage.IntensiveStage2',
};

const levelMap = {
	'venting': 'Cooking.Common.Option.Hood.VentingLevel',
	'intensive': 'Cooking.Common.Option.Hood.IntensiveLevel',
};

const programMap = {
	'automatic': 'Cooking.Common.Program.Hood.Automatic',
	'venting': 'Cooking.Common.Program.Hood.Venting',
	'delayed_shut_off': 'Cooking.Common.Program.Hood.DelayedShutOff',
};

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