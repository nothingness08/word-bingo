import SpeechSynthesisUtterance from "./speechSynthesis";

const speakText = (definition) => {
    let SpeechSynthesisUtterance = null;
    if(typeof window !== 'undefined'){
        SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
    }

    if(definition.trim() !== ''){
    const utterance = new SpeechSynthesisUtterance(definition);
      utterance.rate = .85;
      utterance.pitch = 1.15;
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang === 'en-GB' && voice.name.includes('Female'));

       if (englishVoice) {
            utterance.rate = 1;
            utterance.pitch = .75;
            utterance.voice = englishVoice;
       } else {
           console.log('English voice not found. Using the default voice.');
       }
       speechSynthesis.speak(utterance);
    }
}

export default speakText;