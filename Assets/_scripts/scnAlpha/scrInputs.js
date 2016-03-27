#pragma strict
var rb  : Rigidbody;
var car : scrCarSpecifications;
var wheel : scrWheels[];

@Header ("INPUTS")
var throttle  : float;
var brake	  : float;
var handbrake : float;
var steer 	  : float;

@Header ("CONSTANTS")
var drag	  : float;
var roll	  : float;
var frontal	  : float;
var rho		  : float;

@Header ("CAR SPECS")
var kmh			: int;
var gear		: int;
var torqueCurve : AnimationCurve;
var torque		: float;
var gearRatios	: float[];
var finalDrive	: float;
var minRPM		: float;
var currentRPM	: float;
var redline		: float;

		var velocity 		: Vector3;
	    var angularVelocity : float;
private var dragForce		: float;
private var brakeForce		: float;
private var rollResistance	: float;

@HideInInspector
var longForce	: Vector3;
var latForce	: Vector3;

function Sqrd (squared : float) : float {
	return squared * squared;
}
function Start () {
	rb 	= GetComponent.<Rigidbody>();
	car = GetComponent(scrCarSpecifications);
}
function Update () {
	if (currentRPM < redline)
		throttle  = Input.GetAxis("Accelerate");
	else
		throttle  = 0;

	if (kmh > 2)
		brake  	  = Input.GetAxis("Brake");
	else
		brake	  = 0;

	steer	  	  = Input.GetAxis("Steer");
	handbrake 	  = Input.GetButton("Handbrake") ? 1 : 0;

	if (Input.GetButtonDown("ShiftUp"))
		gear++;
	if (Input.GetButtonDown("ShiftDown"))
		gear--;

	kmh = transform.InverseTransformDirection(rb.velocity).z * 3.6;

	rb.AddTorque (30 * steer * transform.up);
}
function FixedUpdate () {
	velocity  = transform.InverseTransformDirection(rb.velocity);

	Drag();
	Torque();

	longForce = transform.forward * (torque + -dragForce + -rollResistance + -brakeForce);
	latForce  = transform.right   * (steer * car.steerAngle) * (60 / (2 * Mathf.PI));
}

// PHYSICS //
function Torque () {
	angularVelocity = rb.velocity.magnitude / car.wheelRadius;
	currentRPM 		= minRPM + angularVelocity * gearRatios[gear] * finalDrive * (60 / (2 * Mathf.PI));
	torque			= throttle * torqueCurve.Evaluate(currentRPM) *gearRatios[gear] * finalDrive * 0.7 / car.wheelRadius;

	brakeForce		= brake * 5000 * Mathf.Sign(transform.InverseTransformDirection(rb.velocity).z);
}
function Drag () {
	if (kmh < 10 && !throttle) {
		rb.drag   = 3;
	} else if (!throttle && kmh > 9) {
		dragForce = 0.5 * drag * frontal * rho * Sqrd(transform.InverseTransformDirection(rb.velocity).z) * 15 * Mathf.Sign(transform.InverseTransformDirection(rb.velocity).z);
		rb.drag = 0;
	} else {
		dragForce = 0.5 * drag * frontal * rho * Sqrd(transform.InverseTransformDirection(rb.velocity).z) * Mathf.Sign(transform.InverseTransformDirection(rb.velocity).z);
		rb.drag = 0;
	}

	roll = 30 * (0.5 * drag * frontal * rho);
	rollResistance = roll * transform.InverseTransformDirection(rb.velocity).z * Mathf.Sign(velocity.z);
}