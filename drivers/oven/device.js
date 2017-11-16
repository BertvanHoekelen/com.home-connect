'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceOven extends HomeConnectDevice {

	onInit() {
		super.onInit();

		this.registerCapabilityListener('target_temperature', this._onCapabilityTargetTemperature.bind(this));
		this.registerCapabilityListener('onoff', this._onCapabilityOnoff.bind(this));
	}

	async _parseStatus( key, value ) {
		console.log('_parseStatus', key, value)

		if( key === 'Cooking.Oven.Status.CurrentCavityTemperature' )
			return this.setCapabilityValue('measure_temperature', value);
	}

	async _parseSetting( key, value ) {
		console.log('_parseSetting', key, value)

		if( key === 'BSH.Common.Setting.PowerState' )
			return this.setCapabilityValue('onoff', value === 'BSH.Common.EnumType.PowerState.On' );
	}

	_onCapabilityOnoff( value ) {
		this.log('_onCapabilityOnoff', value);
		return this._setSetting('BSH.Common.Setting.PowerState', value ? 'BSH.Common.EnumType.PowerState.On' : 'BSH.Common.EnumType.PowerState.Off' )
	}

	_onCapabilityTargetTemperature( value ) {
		this.log('_onCapabilityTargetTemperature', value);

		return Promise.resolve();
	}

}

module.exports = HomeConnectDeviceOven;