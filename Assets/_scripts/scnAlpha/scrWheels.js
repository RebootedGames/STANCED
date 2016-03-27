#pragma strict
var rb 	    : Rigidbody;
var model	: GameObject;
var car  	: scrCarSpecifications;
var input	: scrInputs;

@Header ("SUSPENSION")
var suspensionLength : float;
var springConstant	 : float;
var damperConstant	 : float;
var staticFriction	 : float;

@Header ("WHEELS")
var frontWheels	: boolean;
var rearWheels	: boolean;
var longVector	: Vector3;
var latVector	: Vector3;
var pacejkaFX	: Vector3;
var pacejkaFY	: Vector3;

var slip			   : float;
var alpha			   : float;
var fLateral		   : float;
var corneringStiffness : float;

private var dummy		   : GameObject;
private var springForce    : float;
private var damperForce    : float;
private var previousLength : float;
private var currentLength  : float;
private var springVelocity : float;

function Start () {
	springConstant = rb.mass * 4 * -Physics.gravity.y;
	dummy 		   = new GameObject("dummyWheelTransform");
	dummy.transform.parent   = transform.parent;
	dummy.transform.position = transform.position;
}
function FixedUpdate () {
	var hit : RaycastHit;
	if (Physics.Raycast(dummy.transform.position, -dummy.transform.up, hit, suspensionLength + car.wheelRadius)) {
		previousLength  = currentLength;
		currentLength   = suspensionLength - (hit.distance - car.wheelRadius);
		springVelocity  = (currentLength - previousLength) / Time.deltaTime;
		springForce		= springConstant  * currentLength;
		damperForce	    = damperConstant * springVelocity;

		if (rearWheels)
			rb.AddForceAtPosition(dummy.transform.up * (springForce + damperForce) + input.longForce, hit.point);
		else
			rb.AddForceAtPosition(dummy.transform.up * (springForce + damperForce) + input.latForce, hit.point);

		model.transform.position = hit.point + (car.wheelRadius * transform.parent.up);
	} else {
		model.transform.position = dummy.transform.position - (suspensionLength * transform.parent.up);
	}

	if (frontWheels) {
		model.transform.localRotation = Quaternion.Euler (0, input.steer * car.steerAngle, 0);
	}

	LateralVelocity();
}

function PacejkaFX (Fz : float, slip : float) : float {
	var B  : float = 10;
	var C  : float = 1.65;
	var D  : float = 1.1;
	var E  : float = -2;

	var Fx : float = Fz * D * Mathf.Sin(C * Mathf.Atan(B * slip - E * (B * slip - Mathf.Atan(B * slip))));
	return Fx;
}
function PacejkaFY (Fz : float, angle : float) : float {
	var B  : float = 10;
	var C  : float = 1.3;
	var D  : float = 1.1;
	var E  : float = -2;

	var Fy : float = Fz * D * Mathf.Sin(C * Mathf.Atan(B * angle - E * (B * angle - Mathf.Atan(B * angle))));
	return Fy;
}

function LateralVelocity () {
	if (frontWheels) 
		fLateral = corneringStiffness * alpha;
	else if (rearWheels)
		fLateral = corneringStiffness * alpha;

	alpha = Mathf.Atan(transform.InverseTransformDirection(rb.velocity).z / Mathf.Abs(transform.InverseTransformDirection(rb.velocity).x));
	slip  = (input.angularVelocity * car.wheelRadius - transform.InverseTransformDirection(rb.velocity).z) / transform.InverseTransformDirection(rb.velocity).z;

	pacejkaFX = rb.velocity.magnitude * Mathf.Cos(alpha) * rb.velocity;
	pacejkaFY = rb.velocity.magnitude * Mathf.Sin(alpha) * rb.velocity;
}