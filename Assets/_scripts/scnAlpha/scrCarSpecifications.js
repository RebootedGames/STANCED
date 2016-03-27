#pragma strict
var rb    : Rigidbody;
var com   : Transform;

@Header ("CAR SPECIFICATIONS")
// DIMENSIONS //
var width		: float;
var height		: float;
var length		: float;
var mass		: float;
var turnCircle	: float;
var steerAngle  : float;
var wheelBase	: float;
var wheelRadius : float;


function Start () {
	rb 		   = GetComponent.<Rigidbody>();
	mass	   = rb.mass;
	steerAngle = Mathf.Atan(wheelBase / (turnCircle - width)) * Mathf.Rad2Deg;
}

function Update () {
	rb.centerOfMass = com.transform.localPosition;
}