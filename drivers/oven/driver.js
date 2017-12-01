'use strict';

const Homey = require('homey');
const HomeConnectDriver = require('../../lib/HomeConnectDriver');

class HomeConnectDriverOven extends HomeConnectDriver {
	
	onInit() {
		super.onInit();
		
		[
			{
				id: 'program_oven_preheat',
				fn: 'setProgramPreheat'
			},
			{
				id: 'program_oven_pizza',
				fn: 'setProgramPizza'
			},
			{
				id: 'program_oven_hotair',
				fn: 'setProgramHotAir'
			},
			{
				id: 'program_oven_topbottom',
				fn: 'setProgramTopBottom'
			}			
		].forEach(flowAction => {
		
			new Homey.FlowCardAction(flowAction.id)
				.register()
				.registerRunListener( args => {
					return args.device[ flowAction.fn ]({
						temperature: args.temperature,
						duration: ( args.duration ) ? args.duration / 1000 : 1200
					})
				})
			
		})
	}
	
	_onPairFilter( homeAppliance ) {
		return homeAppliance.type === 'Oven';
	}

}

module.exports = HomeConnectDriverOven;