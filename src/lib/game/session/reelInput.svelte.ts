const ReelKey = 'Space';

export class ReelInput {
	isReeling = $state(false);

	press(event: PointerEvent) {
		const control = event.currentTarget as HTMLElement | null;
		control?.setPointerCapture(event.pointerId);
		this.isReeling = true;
	}

	release() {
		this.isReeling = false;
	}

	answerTheKey(event: KeyboardEvent, isDown: boolean) {
		if (event.code !== ReelKey) return;
		event.preventDefault();
		this.isReeling = isDown;
	}
}
