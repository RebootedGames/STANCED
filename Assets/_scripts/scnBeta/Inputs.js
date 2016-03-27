#pragma strict
var rb  : Rigidbody;
var com : Transform;

@Header("INPUTS")
var steer	 : float;
var brake	 : float;
var throttle : float;

@Header("CONSTANTS")
var width  	   : float;
var wheelBase  : float;
var turnCircle : float;
var steerAngle : float;

function Start () {
	rb = GetComponent.<Rigidbody>();
}
function Update () {
	steer 	 = Input.GetAxis("Steer");
	throttle = Input.GetAxis("Accelerate");
	brake	 = Input.GetAxis("Brake");

	steerAngle = Mathf.Atan(wheelBase / (turnCircle - width)) * Mathf.Rad2Deg * steer;

	rb.centerOfMass = com.transform.localPosition;
}