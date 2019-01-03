'use strict';

const Homey = require('homey');
const { OAuth2Driver } = require('homey-oauth2app');

module.exports = class HomeConnectDriver extends OAuth2Driver {
	
	onOAuth2Init() {		
		this._initFlow();
	}
	
	_initFlow() {
		this._flowCardTriggerProgramFinished = new Homey.FlowCardTriggerDevice('program_finished')
			.register()
			
		this._flowCardTriggerDoorOpened = new Homey.FlowCardTriggerDevice('door_opened')
			.register()
			
		this._flowCardTriggerDoorClosed = new Homey.FlowCardTriggerDevice('door_closed')
			.register()
			
		this._flowCardActionProgramStop = new Homey.FlowCardAction('program_stop')
			.register()
			.registerRunListener( args => {
				return args.device.stopProgram();
			})		
	}
	
	async triggerFlowProgramFinished( device ) {
		return this._flowCardTriggerProgramFinished.trigger( device );
	}
	
	async triggerFlowDoorOpened( device ) {
		return this._flowCardTriggerDoorOpened.trigger( device );
	}
	
	async triggerFlowDoorClosed( device ) {
		return this._flowCardTriggerDoorClosed.trigger( device );
	}
	
	async onPairListDevices({ oAuth2Client }) {
  	const { homeappliances } = await oAuth2Client.getHomeAppliances();
  	return homeappliances.filter(homeAppliance => {
    	return !!this._onPairFilter(homeAppliance);
  	}).map(homeAppliance => {
    	const {
      	haId,
      	name,
    	} = homeAppliance;
    	
    	return {
      	name,
      	data: { haId },
    	}
  	});
	}
	
	_onPairFilter( homeAppliance ) {
		return true;
	}

}