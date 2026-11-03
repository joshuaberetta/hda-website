// Every ar translation, as one chunk that only ar visitors download.
export default import.meta.glob<string>('/content/**/*.ar.{md,yml}', { query: '?raw', import: 'default', eager: true });
