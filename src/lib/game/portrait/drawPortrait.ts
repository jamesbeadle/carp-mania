import type { PortraitLook } from '../../domain/portrait/portraitLook';
import { Beards, HairColours, HairStyles, HatColours, Hats, JacketColours, SkinTones } from '../../domain/portrait/portraitParts';
import { beard, hairBehind, hairInFront, hat } from './portraitHeadwear';
import { backdrop, face, PortraitCanvas, SceneColours, shoulders } from './portraitScene';

const BareHead = 'None';
const CloserIn = 'translate(-16 -10) scale(1.27)';

export function drawPortrait(look: PortraitLook) {
	const skin = SkinTones[look.skin];
	const hair = HairColours[look.hairColour];
	const hairStyle = HairStyles[look.hairStyle];
	const hatKind = Hats[look.hat];
	const isUnderAHat = hatKind !== BareHead;
	const figure = [
		hairBehind(hairStyle, hair),
		shoulders(JacketColours[look.jacket], skin),
		face(skin, hair),
		beard(Beards[look.beard], hair, SceneColours.Lips),
		hairInFront(hairStyle, hair, isUnderAHat),
		hat(hatKind, HatColours[look.hat])
	];
	const size = PortraitCanvas.Size;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img">${backdrop()}<g transform="${CloserIn}">${figure.join('')}</g></svg>`;
}
