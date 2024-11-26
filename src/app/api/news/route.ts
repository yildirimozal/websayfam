import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/models/News';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const API_URL = 'https://newsapi.org/v2/everything';
const UPDATE_INTERVAL = 3600000; // 1 saat (milisaniye)
const PAGE_SIZE = 15; // Daha fazla haber çek
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=AI+News'; // Varsayılan görsel

async function saveNews(articles: any[]) {
  const savedNews = [];
  
  for (const article of articles) {
    try {
      // Görsel URL'sini kontrol et ve varsayılan görsel kullan eğer yoksa
      const imageUrl = article.urlToImage || DEFAULT_IMAGE;

      const news = new News({
        title: article.title,
        description: article.description || '',
        url: article.url,
        imageUrl: imageUrl,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name
      });
      
      await news.save();
      console.log('Saved news:', news.title);
      
      savedNews.push(news);
    } catch (error) {
      console.error('Error saving article:', {
        title: article.title,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      continue;
    }
  }

  if (savedNews.length === 0) {
    throw new Error('No articles could be saved');
  }

  return savedNews;
}

export async function GET() {
  try {
    console.log('Starting news fetch...');
    await connectToDatabase();

    // Son güncelleme zamanını kontrol et
    const lastUpdate = await News.findOne().sort({ createdAt: -1 });
    const currentTime = new Date();
    
    // Eğer son 1 saat içinde güncellenmiş haberler varsa, tüm haberleri döndür
    if (lastUpdate && (currentTime.getTime() - lastUpdate.createdAt.getTime()) < UPDATE_INTERVAL) {
      console.log('Using cached news from database');
      const allNews = await News.find().sort({ publishedAt: -1 });
      return NextResponse.json(allNews);
    }

    // Son güncellemeden 1 saat geçmişse, yeni haberleri çek
    console.log('Fetching new articles from NewsAPI');
    const query = encodeURIComponent('yapay zeka OR yapay zekâ OR yapay öğrenme OR makine öğrenmesi OR robotik OR otomasyon');
    const response = await fetch(
      `${API_URL}?q=${query}&language=tr&sortBy=publishedAt&pageSize=${PAGE_SIZE}&domains=webrazzi.com,shiftdelete.net,chip.com.tr,log.com.tr,technopat.net&apiKey=${NEWS_API_KEY}`,
      { next: { revalidate: UPDATE_INTERVAL } }
    );

    if (!response.ok) {
      console.error('News API error:', response.status, response.statusText);
      throw new Error('News API request failed');
    }

    const data = await response.json();
    console.log('Fetched articles count:', data.articles.length);
    
    // Eski haberleri temizle
    await News.deleteMany({});
    console.log('Cleared old news from database');
    
    // Yeni haberleri kaydet
    const savedNews = await saveNews(data.articles);
    console.log('Successfully saved news count:', savedNews.length);
    
    return NextResponse.json(savedNews);

  } catch (error) {
    console.error('Error in GET handler:', error instanceof Error ? error.message : 'Unknown error');
    
    // Hata durumunda veritabanındaki haberleri döndür
    try {
      const allNews = await News.find().sort({ publishedAt: -1 });
      console.log('Fallback: Last saved news count:', allNews.length);
      
      if (allNews.length > 0) {
        return NextResponse.json(allNews);
      }
    } catch (dbError) {
      console.error('Database error:', dbError instanceof Error ? dbError.message : 'Unknown error');
    }

    return NextResponse.json(
      { error: 'Haberler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
