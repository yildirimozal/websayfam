export async function translateText(text: string): Promise<string> {
  try {
    // Boş metin kontrolü
    if (!text || text.trim() === '') {
      throw new Error('Empty text');
    }

    console.log('Translating text:', text);

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'tr',
        format: 'text',
      })
    });

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Translation response:', data);

    if (data.data && data.data.translations && data.data.translations[0]) {
      return data.data.translations[0].translatedText;
    }

    throw new Error('Invalid translation response');
  } catch (error) {
    console.error('Translation error:', error);
    throw error; // Hata durumunda yukarıya fırlat
  }
}
