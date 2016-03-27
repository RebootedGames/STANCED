#pragma strict
var rb	  : Rigidbody;
var model : Transform;
var dummy : GameObject;
var input : Inputs;

@Header("WHEEL TYPE")
var frontWheels		 : boolean;
var rearWheels		 : boolean;

@Header("SUSPENSION")
var suspensionLength : float;
var wheelRadius		 : float;
var springConstant	 : float;
var damperConstant	 : float;
var massMultiplier	 : float;

@Header("GRIP")
var mu	: float;
@Range(-6, 0)
var camber : float;
var brakeForce			: float;

var angularVelocity		: float;
private var angularAcceleration : float;

private var normalForce			: float;
private var driveForce			: float;
private var tractionForce		: float;
private var tractionTorque		: float;
private var totalTorque			: float;
var brakeTorque	: float;
var localVelocity : Vector3;

private var springVelocity 		: float;
private var previousCompression : float;
private var currentCompression 	: float;
private var springForce	   		: float;
private var damperForce	   		: float;
var contactPoint : Vector3;

var sx 		: float;
var fx 		: float;
var df0 	: float;
var fxmax 	: float;

var onGround : boolean;

function Sqr (squared : float) : float {
	return squared * squared;
}
// STANDARD FUNCTIONS //
function Start () {
	rb 	  = transform.parent.GetComponent.<Rigidbody>();
	dummy = new GameObject("dummy." + gameObject.name);
	dummy.transform.position = transform.position;
	dummy.transform.parent   = transform.parent;

	springConstant = rb.mass * -Physics.gravity.y * massMultiplier;
}
function Update () {
	model.RotateAround(transform.position, transform.right, Mathf.Abs(angularVelocity) * 60 * Time.deltaTime * Mathf.Sign(localVelocity.z));
}
function FixedUpdate () {
	var hit : RaycastHit;
	onGround = Physics.Raycast(dummy.transform.position, -dummy.transform.up, hit, suspensionLength + wheelRadius);

	if (onGround) {
		previousCompression = currentCompression;
		currentCompression  = suspensionLength - (hit.distance - wheelRadius);
		springVelocity		= (currentCompression - previousCompression) / Time.deltaTime;
		springForce			= springConstant * currentCompression;
		damperForce			= damperConstant * springVelocity;
		contactPoint		= hit.point;

		var longForce : Vector3 = dummy.transform.forward * totalTorque / 2;
		var latForce  : Vector3 = dummy.transform.right * input.steerAngle * Mathf.Deg2Rad / 2 *  Mathf.Sign(transform.InverseTransformDirection(rb.velocity).z) * (transform.InverseTransformDirection(rb.velocity).z / 10000);

		if (frontWheels)
			rb.AddForceAtPosition(dummy.transform.up * (springForce + damperForce) + latForce, hit.point);
		else
			rb.AddForceAtPosition(dummy.transform.up * (springForce + damperForce) + longForce, hit.point);

		localVelocity = transform.InverseTransformDirection(rb.velocity);
		rb.AddForceAtPosition(-dummy.transform.right * normalForce * localVelocity.x, hit.point);

		model.transform.position = hit.point + (wheelRadius * transform.parent.up);
	} else {
		model.transform.position = dummy.transform.position - (suspensionLength * transform.parent.up);
	}

	SlipRatio ();

	var side : float = -Mathf.Sign(transform.localPosition.x);
	if (frontWheels) {
		model.localEulerAngles.y = input.steerAngle;
		model.localEulerAngles.z = side * camber;
    } else {
    	model.localEulerAngles.y = 0;
		model.localEulerAngles.z = side * camber;
	}

	Grip();
}

function Grip () {
	brakeTorque	   = (brakeForce / wheelRadius) * input.brake;
	driveForce     = 3000 / wheelRadius;
	normalForce    = rb.mass * 9.81 * 0.25 * mu;
	tractionForce  = Mathf.Min(driveForce, normalForce);
	tractionTorque = tractionForce * wheelRadius;
	totalTorque	   = (driveForce  - tractionTorque) * input.throttle - brakeTorque;
}

function SlipRatio () {
	angularVelocity = rb.velocity.magnitude / wheelRadius;

	sx = (wheelRadius * angularVelocity - localVelocity.z) / Mathf.Abs(wheelRadius * angularVelocity);
	fx = df0 * sx;

	if (fx > fxmax)
		fx = fxmax;
	if (fx < -fxmax)
		fx = -fxmax;
}