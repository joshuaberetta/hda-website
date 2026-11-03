// Every fr translation, as one chunk that only fr visitors download.
export default import.meta.glob<string>('/content/**/*.fr.{md,yml}', { query: '?raw', import: 'default', eager: true });
