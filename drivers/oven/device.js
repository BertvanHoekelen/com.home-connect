'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceOven extends HomeConnectDevice {

	onInit() {
		super.onInit();
	}

	async _parseStatus({ key, value }) {
		await super._parseStatus(...arguments);

		if( key === 'Cooking.Oven.Status.CurrentCavityTemperature' )
			return this.setCapabilityValue('measure_temperature', value);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}
	
	startProgram( programId, { temperature, duration }) {
		return this._setProgram(programId, [
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