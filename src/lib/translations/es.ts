// Every es translation, as one chunk that only es visitors download.
export default import.meta.glob<string>('/content/**/*.es.{md,yml}', { query: '?raw', import: 'default', eager: true });
