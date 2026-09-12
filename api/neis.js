const API_BASE = 'https://open.neis.go.kr/hub';

export default async function handler(req, res) {
  try {
    const { endpoint, ...params } = req.query;

    if (!endpoint) {
      return res.status(400).json({
        error: 'endpoint가 필요합니다.'
      });
    }

    const allowedEndpoints = [
      'schoolInfo',
      'mealServiceDietInfo'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return res.status(400).json({
        error: '허용되지 않은 API입니다.'
      });
    }

    const url = new URL(`${API_BASE}/${endpoint}`);

    const queryParams = {
      KEY: process.env.NEIS_API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 100,
      ...params
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `NEIS API 오류 (${response.status})`
      });
    }

    const payload = await response.json();

    const result =
      payload?.[endpoint]?.[0]?.head?.find(
        (item) => item.RESULT
      )?.RESULT;

    if (result && result.CODE !== 'INFO-000') {
      return res.status(400).json({
        error: result.MESSAGE || 'NEIS API 요청에 실패했습니다.'
      });
    }

    return res.status(200).json(payload);

  } catch (error) {
    console.error('NEIS API proxy error:', error);

    return res.status(500).json({
      error: 'NEIS API 요청 중 오류가 발생했습니다.'
    });
  }
}