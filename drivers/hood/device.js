'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

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

class HomeConnectDeviceHood extends HomeConnectDevice {

	_parseNotify ({ key, value }) {
		super._parseNotify({ key, value });

		if( key === levelMap['venting'] || key === levelMap['intensive']) {
			const level = keyByValue(ventingLevelMap, value);

			if ( ! level.includes('off')) {
				this.setCapabilityValue('venting_level', level);
			}
		}
	}

	onOAuth2Init() {
		super.onOAuth2Init();

		this.registerCapabilityListener('venting_level', this.onCapabilityVentingLevel.bind(this));
	}

	async startVenting(level, ventingLevel) {
		return this._setProgram('Cooking.Common.Program.Hood.Venting', [
			{
				'key': level,
				'value': ventingLevel,
			},
		])
	}

	async startProgram( programId ) {
		return this._setProgram(programId, [])
	}

	/*
   * Capability Listeners
   */
	async onCapabilityVentingLevel( value ) {
		const types = value.split('_');

		return this.startVenting(levelMap[types[0]], ventingLevelMap[value])
	}
	
}

function keyByValue(object, value) {
	const inverted = Object.keys(object).reduce(function (reverted, key) {
		reverted[object[key]] = key;

		return reverted;
	}, {});

	return inverted[value];
}

module.exports = HomeConnectDeviceHood;