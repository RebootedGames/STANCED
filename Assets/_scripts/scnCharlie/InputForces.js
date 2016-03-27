#pragma strict
var rb  : Rigidbody;
var com : Transform;

@Header("WHEELS")
var flwheel : WheelForces;
var frwheel : WheelForces;
var rlwheel : WheelForces;
var rrwheel : WheelForces;

@Header("INPUTS")
var steer	  : float;
var brake	  : float;
var throttle  : float;
var handbrake : float;

@Header("CONSTANTS")
var width  	   : float;
var wheelBase  : float;
var turnCircle : float;
var steerAngle : float;

@Header("ENGINE")
var torqueCurve : AnimationCurve;
var engineRPMAcceleration : float;
var torque		: float;
var engineRPM	: float;
var minRPM		: float;
var maxRPM		: float;

@Header("TRANSMISSION")
var gearRatios  : float[];
var currentGear : int;
@Space(10)
var kmh			: int;
var mph			: int;
@Space(10)
var finalDrive			   : float;
var transmissionEfficiency : float;

function Start () {
	rb = GetComponent.<Rigidbody>();
}
function Update () {
	rb.centerOfMass = com.transform.localPosition;
	var localVelocity : Vector3 = transform.InverseTransformDirection(rb.velocity);

	if (engineRPM < maxRPM)
		throttle = Input.GetAxis("Accelerate");
	else
		throttle = 0;

	brake 	  = Input.GetAxis("Brake");
	steer	  = Input.GetAxis("Steer");
	handbrake = Input.GetAxis("Handbrake");

	if (Input.GetKeyDown("joystick button 1") && currentGear <= gearRatios.Length-2) 
		currentGear++;
	if (Input.GetKeyDown("joystick button 2") && currentGear >= 1)
		currentGear--;

	engineRPM  = (((rlwheel.angularVelocity + rrwheel.angularVelocity) / 2) * gearRatios[currentGear] * finalDrive) * 60 / (2 * Mathf.PI);

	engineRPMAcceleration = torque / 0.015;
	engineRPM += throttle * engineRPMAcceleration * Time.deltaTime;
	engineRPM -= engineRPM / 60;
	torque     = torqueCurve.Evaluate(engineRPM) * gearRatios[currentGear] * finalDrive * transmissionEfficiency;

	rlwheel.driveTorque = throttle * torque / 2;
	rrwheel.driveTorque = throttle * torque / 2;

	flwheel.brakeFrictionTorque = brake * 4000;
	frwheel.brakeFrictionTorque = brake * 4000;
	rlwheel.brakeFrictionTorque = brake * 4000 * 0.2;
	rrwheel.brakeFrictionTorque = brake * 4000 * 0.2;

	flwheel.steerAngle = Mathf.Atan(wheelBase / (turnCircle - width)) * Mathf.Rad2Deg;
	frwheel.steerAngle = Mathf.Atan(wheelBase / (turnCircle - width)) * Mathf.Rad2Deg;

	kmh = Mathf.Abs(Mathf.Round(localVelocity.z * 3.6));
	mph = Mathf.Abs(Mathf.Round(localVelocity.z * 2.23694));
}

function OnGUI () {
	GUI.Label(new Rect(Screen.width-50, Screen.height-30, 150, 150), kmh.ToString());
	GUI.Label(new Rect(Screen.width-50, Screen.height-45, 150, 150), currentGear.ToString());
	GUI.Label(new Rect(Screen.width-50, Screen.height-60, 150, 150), Mathf.Round(engineRPM).ToString());
}