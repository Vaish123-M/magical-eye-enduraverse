// Place these files in frontend/public/audio/:
// ok_hindi.mp3, not_ok_hindi.mp3, ok_marathi.mp3, not_ok_marathi.mp3

export function playInspectionAudio(status, language = 'hindi') {
  // Use actual file names present in /audio/
  const files = {
    OK: {
      hindi: '/audio/Saman sahi hai.mp3',
      marathi: '/audio/Saman sahi hai.mp3', // update if you add Marathi
    },
    NOT_OK: {
      hindi: '/audio/Saman galat hai.mp3',
      marathi: '/audio/Saman galat hai.mp3', // update if you add Marathi
    },
  };
  const file = files[status]?.[language];
  if (!file) return;
  const audio = new Audio(file);
  audio.play();
}
