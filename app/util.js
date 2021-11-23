export const toEuler = (q) => {
    const x = q.x;
    const y = q.y;
    const z = q.z;
    const w = q.w;

    var sqw = w * w;
    var sqx = x * x;
    var sqy = y * y;
    var sqz = z * z;

	var unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
	var test = x*y + z*w;
    let heading, attitude, bank;
	if (test > 0.499*unit) { // singularity at north pole
		heading = 2 * Math.atan2(x, w);
		attitude = Math.PI/2;
		bank = 0;
		return;
	}
	if (test < -0.499*unit) { // singularity at south pole
		heading = -2 * Math.atan2(x, w);
		attitude = -Math.PI/2;
		bank = 0;
		return;
	}
        heading = Math.atan2(2*y*w-2*x*z , sqx - sqy - sqz + sqw);
	attitude = Math.asin(2*test/unit);
	bank = Math.atan2(2*x*w-2*y*z , -sqx + sqy - sqz + sqw)
	
	heading*=(180/Math.PI)
	attitude*=(180/Math.PI)
	bank*=(180/Math.PI)
	return [
        -heading, // x
        -bank, // y
        attitude // z
    ];
};
