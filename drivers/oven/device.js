'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceOven extends HomeConnectDevice {

	onInit() {
		super.onInit();

		this.registerCapabilityListener('onoff', this._onCapabilityOnoff.bind(this));
	}

	async _parseStatus( key, value ) {
		//this.log('_parseStatus', key, value)

		if( key === 'Cooking.Oven.Status.CurrentCavityTemperature' )
			return this.setCapabilityValue('measure_temperature', value);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}

	async _parseSetting( key, value ) {
		//this.log('_parseSetting', key, value)

		if( key === 'BSH.Common.Setting.PowerState' )
			return this.setCapabilityValue('onoff', value === 'BSH.Common.EnumType.PowerState.On' );
	}

	_onCapabilityOnoff( value ) {
		return this._setSetting('BSH.Common.Setting.PowerState', value ? 'BSH.Common.EnumType.PowerState.On' : 'BSH.Common.EnumType.PowerState.Off' )
	}
	
	setProgramPreheat({ temperature, duration }) {
		return this._setProgram('Cooking.Oven.Program.HeatingMode.PreHeating', [
			{
				'key': 'Cooking.Oven.Option.SetpointTemperature',
				'value': temperature,
				'unit': '°C'
			},
			{
				'key': 'BSH.Common.Option.Duration',
				'value': duration,
				'unit': 'seconds'
			}
		])
	}

}

module.exports = HomeConnectDeviceOven;