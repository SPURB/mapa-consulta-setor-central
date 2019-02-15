import { getRandomInt } from '../../../src/presenter'

export default {
	default: QUnit.test( "getRandomint", function( assert ) {
		assert.ok( Number.isInteger(getRandomInt(1,10)), "Is integer!" );
	})
}