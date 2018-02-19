'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceCoffee extends HomeConnectDevice {

	async _parseStatus({ key, value }) {
		await super._parseStatus(...arguments);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}
	
	startProgram( programId, { beanAmount, fillQuantity }) {
		return this._setProgram(programId, [
			{
				'key': 'ConsumerProducts.CoffeeMaker.Option.BeanAmount',
				'value': beanAmount,
			},
			{
				'key': 'ConsumerProducts.CoffeeMaker.Option.FillQuantity',
				'value': fillQuantity
			}
		])		
	}

}

module.exports = HomeConnectDeviceCoffee;