#pragma strict
var rb		 : Rigidbody;
var WheelL   : Wheels; 
var WheelR   : Wheels; 
var AntiRoll : float; 

function FixedUpdate () { 
	var hit : RaycastHit; 
	var travelL : float = 1.0; 
	var travelR : float = 1.0;

	var groundedL : boolean = WheelL.onGround; 
	if (groundedL) 
		travelL = (-WheelL.transform.InverseTransformPoint(WheelL.contactPoint).y - WheelL.wheelRadius) / WheelL.suspensionLength; 
	
	var groundedR : boolean = WheelR.onGround; 
	if (groundedR) 
		travelR = (-WheelR.transform.InverseTransformPoint(WheelR.contactPoint).y - WheelR.wheelRadius) / WheelR.suspensionLength; 
	
	var antiRollForce : float = (travelL - travelR) * AntiRoll; 
	if (groundedL) 
		rb.AddForceAtPosition(WheelL.transform.up * antiRollForce, WheelL.transform.position); 
	if (groundedR) 
		rb.AddForceAtPosition(WheelR.transform.up * -antiRollForce, WheelR.transform.position); 
}