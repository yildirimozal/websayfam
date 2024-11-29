import axios from 'axios';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

const SCHOLAR_URL = 'https://scholar.google.com/citations?user=_RKTpkMAAAAJ&hl=tr';

export interface Publication {
  title: string;
  journal: string;
  year: number;
  citations: number;
  url: string;
}

export async function getScholarPublications(): Promise<Publication[]> {
  try {
    const response = await axios.get(SCHOLAR_URL);
    const $ = cheerio.load(response.data);
    const publications: Publication[] = [];

    // Google Scholar sayfasındaki yayın listesini seç
    $('tr.gsc_a_tr').slice(0, 10).each((_, element) => {
      const title = $(element).find('.gsc_a_at').text();
      const journal = $(element).find('.gsc_a_venue').text();
      const year = parseInt($(element).find('.gsc_a_y').text()) || new Date().getFullYear();
      const citations = parseInt($(element).find('.gsc_a_c').text()) || 0;
      const url = 'https://scholar.google.com' + $(element).find('.gsc_a_at').attr('href');

      publications.push({
        title,
        journal,
        year,
        citations,
        url
      });
    });

    return publications;
  } catch (error) {
    console.error('Google Scholar verisi çekilirken hata:', error);
    return [];
  }
}
