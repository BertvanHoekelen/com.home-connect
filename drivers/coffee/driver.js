'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

const programMap = {
	'espresso': 'ConsumerProducts.CoffeeMaker.Program.Beverage.Espresso',
	'espressomacchiato': 'ConsumerProducts.CoffeeMaker.Program.Beverage.EspressoMacchiato',	
	'coffee': 'ConsumerProducts.CoffeeMaker.Program.Beverage.Coffee',	
	'cappuccino': 'ConsumerProducts.CoffeeMaker.Program.Beverage.Cappuccino',	
	'lattemacchiato': 'ConsumerProducts.CoffeeMaker.Program.Beverage.LatteMacchiato',	
	'cafelatte': 'ConsumerProducts.CoffeeMaker.Program.Beverage.CaffeLatte',
}

const beanAmountMap = {
	'mild': 'ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Mild',
	'normal': 'ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Normal',
	'strong': 'ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Strong',
	'verystrong': 'ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.VeryStrong',
	'doubleshot': 'ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.DoubleShot',
	'doubleshotplus': 'ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.DoubleShotPlus',
}

class HomeConnectDriverCoffee extends HomeConnectDriver {
	
	onOAuth2Init() {
		super.onOAuth2Init();
		
		new Homey.FlowCardAction('program_coffee')
			.register()
			.registerRunListener( args => {
				return args.device.startProgram( programMap[args.program], {
					beanAmount: beanAmountMap[args.bean_amount],
					fillQuantity: args.fill_quantity
				})
			})
			
		this._flowCardTriggerWaterTankEmpty = new Homey.FlowCardTriggerDevice('water_tank_empty')
			.register()
			
		this._flowCardTriggerBeanContainerEmpty = new Homey.FlowCardTriggerDevice('bean_container_empty')
			.register()
  }
	
	async triggerFlowWaterTankEmpty( device ) {
		return this._flowCardTriggerWaterTankEmpty.trigger( device );
	}
	
	async triggerFlowBeanContainerEmpty( device ) {
		return this._flowCardTriggerBeanContainerEmpty.trigger( device );
	}
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'CoffeeMaker';
	}

}

module.exports = HomeConnectDriverCoffee;