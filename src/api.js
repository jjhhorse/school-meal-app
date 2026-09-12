

async function request(endpoint, params) {
  const query = new URLSearchParams({
    endpoint,
    Type: 'json',
    pIndex: '1',
    pSize: '100',
    ...params
  });

  const response = await fetch(`/api/neis?${query.toString()}`);

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(
      errorPayload.error || `NEIS API 오류 (${response.status})`
    );
  }

  return await response.json();
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
