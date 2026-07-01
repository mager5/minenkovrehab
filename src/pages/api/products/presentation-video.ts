import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const PRESENTATION_VIDEO_PATH = 'My Bucket/Resection/Presentation.mp4';
const EXPIRES_IN_SECONDS = 60 * 60 * 6;

function getSelfBaseUrl(req: NextApiRequest) {
  const host = req.headers.host;
  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader?.split(',')[0]?.trim();
  const proto = forwardedProto || 'http';
  return `${proto}://${host}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res
      .status(405)
      .json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(PRESENTATION_VIDEO_PATH, EXPIRES_IN_SECONDS);

    if (error || !data?.signedUrl) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Не удалось создать ссылку на видео',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        url: `${getSelfBaseUrl(req)}/api/products/presentation-video/stream`,
        proxyUrl: `${getSelfBaseUrl(req)}/api/products/presentation-video/stream`,
        filePath: PRESENTATION_VIDEO_PATH,
        signedUrl: data.signedUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Не удалось получить видео презентации',
    });
  }
}
