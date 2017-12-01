'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceDishwasher extends HomeConnectDevice {

	async _parseStatus( key, value ) {
		//this.log('_parseStatus', key, value)

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}
	
	startProgram( programId, {}) {
		return this._setProgram(programId, [])		
	}

}

module.exports = HomeConnectDeviceDishwasher;