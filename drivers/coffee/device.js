'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceCoffee extends HomeConnectDevice {
	
	async onCapabilityOnoff( value ) {
  	return this._setSetting('BSH.Common.Setting.PowerState', value
  	 ? 'BSH.Common.EnumType.PowerState.On'
  	 : 'BSH.Common.EnumType.PowerState.Standby'
    );
	}
	
	async _parseEvent({ key, value })
	  await super._parseEvent(...arguments);
	  
	  if( key === 'ConsumerProducts.CoffeeMaker.Event.WaterTankEmpty' )
			this.driver.triggerFlowWaterTankEmpty( this ).catch(this.error);
	  
	  if( key === 'ConsumerProducts.CoffeeMaker.Event.BeanContainerEmpty' )
			this.driver.triggerFlowBeanContainerEmpty( this ).catch(this.error);
	  
  }

	async _parseStatus({ key, value }) {
		await super._parseStatus(...arguments);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}
	
	async startProgram( programId, { beanAmount, fillQuantity }) {
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