class SpeechSynthesisUtterance {
    constructor() {
        this.lang = '';
        this.pitch = 1.0;
        this.rate = 1.0;
        this.text = '';
        this.voice = null;
        this.volume = 1.0;

        this.onstart = null;
        this.onend = null;
        this.onerror = null;
        this.onpause = null;
        this.onresume = null;
        this.onmark = null;
        this.onboundary = null;
    }
}

export default SpeechSynthesisUtterance