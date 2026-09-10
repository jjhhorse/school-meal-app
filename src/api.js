const API_KEY = '3aeace82f952472ab2151a44cf0e736b';
const API_BASE = 'https://open.neis.go.kr/hub';

async function request(endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries({ KEY: API_KEY, Type: 'json', pIndex: 1, pSize: 100, ...params }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NEIS API 오류 (${response.status})`);
  const payload = await response.json();
  const result = payload?.[endpoint]?.[0]?.head?.find((item) => item.RESULT)?.RESULT;
  if (result && result.CODE !== 'INFO-000') throw new Error(result.MESSAGE || 'NEIS API 요청에 실패했습니다.');
  return payload;
}

export async function searchSchools(educationOfficeCode, schoolName) {
  const payload = await request('schoolInfo', { ATPT_OFCDC_SC_CODE: educationOfficeCode, SCHUL_NM: schoolName.trim() });
  return (payload?.schoolInfo?.[1]?.row ?? []).map((school) => ({ code: school.SD_SCHUL_CODE, name: school.SCHUL_NM, address: school.ORG_RDNMA || school.ORG_RDNDA || '', kind: school.SCHUL_KND_SC_NM || '' }));
}

function formatDate(date) { return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`; }
export function getWeekdays(referenceDate) {
  const date = new Date(`${referenceDate}T12:00:00`);
  const monday = new Date(date);
  monday.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
  return Array.from({ length: 5 }, (_, index) => { const weekday = new Date(monday); weekday.setDate(monday.getDate() + index); return formatDate(weekday); });
}
export async function getWeeklyMealInfo(educationOfficeCode, schoolCode, referenceDate) {
  const results = await Promise.all(getWeekdays(referenceDate).map(async (date) => {
    try {
      const payload = await request('mealServiceDietInfo', { ATPT_OFCDC_SC_CODE: educationOfficeCode, SD_SCHUL_CODE: schoolCode, MLSV_YMD: date, MMEAL_SC_CODE: 2 });
      return payload?.mealServiceDietInfo?.[1]?.row?.[0] ?? null;
    } catch (error) { if (error.message.includes('해당하는 데이터가 없습니다')) return null; throw error; }
  }));
  return results.filter(Boolean);
}
