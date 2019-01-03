'use strict';

const HomeConnectDevice = require('../../lib/HomeConnectDevice');

class HomeConnectDeviceDishwasher extends HomeConnectDevice {

	async _parseStatus({ key, value }) {
		await super._parseStatus(...arguments);

		if( key === 'BSH.Common.Status.DoorState' )
			return this.setCapabilityValue('alarm_contact', value === 'BSH.Common.EnumType.DoorState.Open' );
	}
	
	async startProgram( programId, {}) {
		return this._setProgram(programId, [])		
	}

}

module.exports = HomeConnectDeviceDishwasher;