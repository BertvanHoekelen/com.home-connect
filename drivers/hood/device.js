'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');
const levelMap = require('./consts/level');
const ventingLevelMap = require('./consts/ventingLevel');

class HomeConnectDeviceHood extends HomeConnectDevice {

	_parseNotify ({ key, value }) {
		super._parseNotify({ key, value });

		if( key === levelMap['venting'] || key === levelMap['intensive']) {
			const level = this.keyByValue(ventingLevelMap, value);

			if ( ! level.includes('off')) {
				this.setCapabilityValue('venting_level', level);
			}
		}
	}

	onOAuth2Init() {
		super.onOAuth2Init();

		this.registerCapabilityListener('venting_level', this.onCapabilityVentingLevel.bind(this));
	}

	keyByValue(object, value) {
		const inverted = Object.keys(object).reduce(function (reverted, key) {
			reverted[object[key]] = key;

			return reverted;
			}, {});

		return inverted[value];
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

module.exports = HomeConnectDeviceHood;