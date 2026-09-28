export const HazeParsVertex = `
#ifdef USE_FOG
	varying float vFogDepth;
	varying vec3 vHazeRay;
#endif`;

export const HazeVertex = `
#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
	vHazeRay = ( vec4( mvPosition.xyz, 0.0 ) * viewMatrix ).xyz;
#endif`;

export const HazeParsFragment = `
#ifdef USE_FOG
	uniform vec3 fogColor;
	uniform vec3 hazeSunDirection;
	uniform vec4 hazeGlow;
	varying float vFogDepth;
	varying vec3 vHazeRay;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`;

export const HazeFragment = `
#ifdef USE_FOG
	float hazeDistance = length( vHazeRay );
	#ifdef FOG_EXP2
		float hazeDepth = fogDensity * hazeDistance;
		float fogFactor = 1.0 - exp( - hazeDepth * hazeDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, hazeDistance );
	#endif
	float sunward = max( dot( vHazeRay / max( hazeDistance, 0.0001 ), hazeSunDirection ), 0.0 );
	vec3 hazeColour = fogColor + hazeGlow.rgb * pow( sunward, hazeGlow.a );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, hazeColour, fogFactor );
#endif`;
