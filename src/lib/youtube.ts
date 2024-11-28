import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

interface ChannelInfo {
  channelId: string;
  title: string;
  thumbnailUrl: string;
  customUrl: string;
}

export async function getChannelInfo(channelId: string): Promise<ChannelInfo> {
  try {
    const response = await youtube.channels.list({
      part: ['snippet'],
      id: [channelId]
    });

    if (!response.data.items?.length) {
      throw new Error('Kanal bulunamadı');
    }

    const channel = response.data.items[0];
    const snippet = channel.snippet!;

    return {
      channelId: channelId,
      title: snippet.title || '',
      thumbnailUrl: snippet.thumbnails?.default?.url || '',
      customUrl: `https://www.youtube.com/channel/${channelId}`
    };
  } catch (error) {
    console.error('YouTube API hatası:', error);
    throw error;
  }
}
