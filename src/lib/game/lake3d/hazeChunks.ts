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
	uniform vec4 hazeClouds;
	varying float vFogDepth;
	varying vec3 vHazeRay;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
	float hazeHash( vec2 cell ) {
		vec3 scrambled = fract( cell.xyx * 0.1031 );
		scrambled += dot( scrambled, scrambled.yzx + 33.33 );
		return fract( ( scrambled.x + scrambled.y ) * scrambled.z );
	}
	float hazeNoise( vec2 point ) {
		vec2 whole = floor( point );
		vec2 blend = smoothstep( 0.0, 1.0, fract( point ) );
		float bottom = mix( hazeHash( whole ), hazeHash( whole + vec2( 1.0, 0.0 ) ), blend.x );
		float top = mix( hazeHash( whole + vec2( 0.0, 1.0 ) ), hazeHash( whole + vec2( 1.0, 1.0 ) ), blend.x );
		return mix( bottom, top, blend.y );
	}
	float hazeThinning( float cameraHeight, float rayRise ) {
		float low = max( min( cameraHeight, cameraHeight + rayRise ), 0.0 );
		float climb = abs( rayRise );
		float atLow = exp( - low / 180.0 );
		if ( climb < 1.0 ) return atLow;
		return 180.0 * ( atLow - exp( - ( low + climb ) / 180.0 ) ) / climb;
	}
	float cloudShadeAt( vec3 worldPosition ) {
		vec2 overhead = worldPosition.xz + hazeSunDirection.xz / max( hazeSunDirection.y, 0.2 ) * 1400.0;
		vec2 layer = overhead / 520.0 + hazeClouds.xy;
		float billow = hazeNoise( layer ) * 0.55 + hazeNoise( layer * 2.03 + 7.1 ) * 0.3 + hazeNoise( layer * 4.1 + 3.7 ) * 0.15;
		float cover = hazeClouds.z;
		float threshold = 0.72 - 0.5 * cover - 0.3 * pow( cover, 4.0 );
		return smoothstep( threshold, threshold + 0.18, billow );
	}
#endif`;

export const HazeFragment = `
#ifdef USE_FOG
	if ( hazeClouds.w > 0.0 ) gl_FragColor.rgb *= 1.0 - hazeClouds.w * cloudShadeAt( cameraPosition + vHazeRay );
	float hazeDistance = length( vHazeRay );
	#ifdef FOG_EXP2
		float hazeDepth = fogDensity * hazeDistance * hazeThinning( cameraPosition.y, vHazeRay.y );
		float fogFactor = 1.0 - exp( - hazeDepth * hazeDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, hazeDistance );
	#endif
	float sunward = max( dot( vHazeRay / max( hazeDistance, 0.0001 ), hazeSunDirection ), 0.0 );
	vec3 hazeColour = fogColor + hazeGlow.rgb * pow( sunward, hazeGlow.a );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, hazeColour, fogFactor );
#endif`;
