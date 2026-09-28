import { CloudLayer, CoverThreshold } from './cloudCover';
import { glslFloat as f } from './glslNumber';

const Haze = { ThinningMetres: 180, ShadeFadeFrom: 0.12, ShadeFadeTo: 0.45, ShadeNearMetres: 250, ShadeFarMetres: 800 } as const;
const Patches = { Softness: 0.3, Middle: 2.03, Fine: 4.1, BroadWeight: 0.55, MiddleWeight: 0.3, FineWeight: 0.15 } as const;

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
	${CoverThreshold}
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
		float atLow = exp( - low / ${f(Haze.ThinningMetres)} );
		if ( climb < 1.0 ) return atLow;
		return ${f(Haze.ThinningMetres)} * ( atLow - exp( - ( low + climb ) / ${f(Haze.ThinningMetres)} ) ) / climb;
	}
	float cloudShadeAt( vec3 worldPosition ) {
		vec2 overhead = worldPosition.xz + hazeSunDirection.xz / max( hazeSunDirection.y, ${f(CloudLayer.LowestSun)} ) * ${f(CloudLayer.HeightMetres)};
		vec2 layer = overhead / ${f(CloudLayer.ShadowPatchMetres)} + hazeClouds.xy;
		float broad = hazeNoise( layer ) * ${f(Patches.BroadWeight)};
		float middle = hazeNoise( layer * ${f(Patches.Middle)} + 7.1 ) * ${f(Patches.MiddleWeight)};
		float billow = broad + middle + hazeNoise( layer * ${f(Patches.Fine)} + 3.7 ) * ${f(Patches.FineWeight)};
		float threshold = coverThreshold( hazeClouds.z );
		return smoothstep( threshold, threshold + ${f(Patches.Softness)}, billow );
	}
#endif`;

export const HazeFragment = `
#ifdef USE_FOG
	float hazeDistance = length( vHazeRay );
	#ifdef FOG_EXP2
		float hazeDepth = fogDensity * hazeDistance * hazeThinning( cameraPosition.y, vHazeRay.y );
		float fogFactor = 1.0 - exp( - hazeDepth * hazeDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, hazeDistance );
	#endif
	float shadeShare = hazeClouds.w * ( 1.0 - smoothstep( ${f(Haze.ShadeFadeFrom)}, ${f(Haze.ShadeFadeTo)}, fogFactor ) );
	shadeShare *= 1.0 - smoothstep( ${f(Haze.ShadeNearMetres)}, ${f(Haze.ShadeFarMetres)}, hazeDistance );
	if ( shadeShare > 0.0 ) gl_FragColor.rgb *= 1.0 - shadeShare * cloudShadeAt( cameraPosition + vHazeRay );
	float sunward = max( dot( vHazeRay / max( hazeDistance, 0.0001 ), hazeSunDirection ), 0.0 );
	vec3 hazeColour = fogColor + hazeGlow.rgb * pow( sunward, hazeGlow.a );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, hazeColour, fogFactor );
#endif`;
