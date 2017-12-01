'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceOven extends HomeConnectDevice {

	onInit() {
		super.onInit();
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
	}
	
	setProgramPreheat({ temperature, duration }) {
		return this._setOvenProgram('Cooking.Oven.Program.HeatingMode.PreHeating', {
			temperature,
			duration
		})
	}
	
	setProgramPizza({ temperature, duration }) {
		return this._setOvenProgram('Cooking.Oven.Program.HeatingMode.PizzaSetting', {
			temperature,
			duration
		})
	}
	
	setProgramHotAir({ temperature, duration }) {
		return this._setOvenProgram('Cooking.Oven.Program.HeatingMode.HotAir', {
			temperature,
			duration
		})
	}
	
	setProgramTopBottom({ temperature, duration }) {
		return this._setOvenProgram('Cooking.Oven.Program.HeatingMode.TopBottomHeating', {
			temperature,
			duration
		})
	}
	
	_setOvenProgram( programId, { temperature, duration }) {
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