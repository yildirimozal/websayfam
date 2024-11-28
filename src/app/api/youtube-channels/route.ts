import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import YoutubeChannel from '@/models/YoutubeChannel';
import { getChannelInfo } from '@/lib/youtube';

const CHANNEL_IDS = [
  'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
  'UCsBjURrPoezykLs9EqgamOA', // Fireship
  'UCW5YeuERMmlnqo4oq8vwUpg', // The Net Ninja
  'UCvmINlrza7JHB1zkIOuXEbw'  // Academind
];

async function updateChannelInfo(channelId: string) {
  try {
    console.log(`Kanal bilgileri güncelleniyor: ${channelId}`);
    const channelInfo = await getChannelInfo(channelId);
    console.log('Alınan kanal bilgileri:', channelInfo);
    
    const updatedChannel = await YoutubeChannel.findOneAndUpdate(
      { channelId: channelId },
      {
        ...channelInfo,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    console.log('Güncellenen kanal:', updatedChannel);
    return channelInfo;
  } catch (error) {
    console.error(`Kanal güncellenirken hata (${channelId}):`, error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('Veritabanına bağlanılıyor...');
    await connectToDatabase();
    console.log('Veritabanı bağlantısı başarılı');

    // Tüm kanalları veritabanından çek
    let channels = await YoutubeChannel.find().sort({ title: 1 });
    console.log('Mevcut kanallar:', channels);

    // Eğer hiç kanal yoksa, varsayılan kanalları ekle
    if (channels.length === 0) {
      console.log('Kanal bulunamadı, varsayılan kanallar ekleniyor...');
      const initialChannelPromises = CHANNEL_IDS.map(updateChannelInfo);
      await Promise.all(initialChannelPromises);
      channels = await YoutubeChannel.find().sort({ title: 1 });
      console.log('Varsayılan kanallar eklendi:', channels);
    } else {
      // 1 saatten eski veriler varsa güncelle
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const outdatedChannels = channels.filter(channel => !channel.updatedAt || channel.updatedAt < oneHourAgo);
      
      if (outdatedChannels.length > 0) {
        console.log('Eski kanallar güncelleniyor:', outdatedChannels);
        const updatePromises = outdatedChannels.map(channel => updateChannelInfo(channel.channelId));
        await Promise.all(updatePromises);
        channels = await YoutubeChannel.find().sort({ title: 1 });
        console.log('Kanallar güncellendi:', channels);
      }
    }

    return NextResponse.json(channels);
  } catch (error) {
    console.error('Kanallar alınırken hata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Kanallar alınırken bir hata oluştu', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { channelId } = await request.json();
    const channelInfo = await updateChannelInfo(channelId);
    
    return NextResponse.json(channelInfo);
  } catch (error) {
    console.error('Kanal eklenirken hata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Kanal eklenirken bir hata oluştu', details: errorMessage },
      { status: 500 }
    );
  }
}
