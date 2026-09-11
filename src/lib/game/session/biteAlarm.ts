const AlarmTone = { HighHertz: 2600, LowHertz: 2100, BeepSeconds: 0.09, GapMilliseconds: 170, Volume: 0.18 } as const;

export class BiteAlarm {
	private audio: AudioContext | null = null;
	private beeping: ReturnType<typeof setInterval> | null = null;
	private isHighTone = true;
	isMuted = false;

	arm() {
		if (this.audio) return;
		this.audio = new AudioContext();
	}

	start() {
		if (this.beeping || !this.audio) return;
		this.beeping = setInterval(() => this.beep(), AlarmTone.GapMilliseconds);
		this.beep();
	}

	stop() {
		if (!this.beeping) return;
		clearInterval(this.beeping);
		this.beeping = null;
	}

	private beep() {
		if (this.isMuted || !this.audio) return;
		const oscillator = this.audio.createOscillator();
		const gain = this.audio.createGain();
		oscillator.type = 'square';
		oscillator.frequency.value = this.isHighTone ? AlarmTone.HighHertz : AlarmTone.LowHertz;
		this.isHighTone = !this.isHighTone;
		gain.gain.setValueAtTime(AlarmTone.Volume, this.audio.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + AlarmTone.BeepSeconds);
		oscillator.connect(gain).connect(this.audio.destination);
		oscillator.start();
		oscillator.stop(this.audio.currentTime + AlarmTone.BeepSeconds);
	}
}
