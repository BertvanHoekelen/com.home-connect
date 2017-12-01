'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceDryer extends HomeConnectDevice {

	async _parseStatus( key, value ) {
		//this.log('_parseStatus', key, value)

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}
	
	startProgram( programId, { target }) {
		return this._setProgram(programId, [
			{
				'key': 'LaundryCare.Dryer.Option.DryingTarget',
				'value': target,
			}
		])
	}

}

module.exports = HomeConnectDeviceDryer;