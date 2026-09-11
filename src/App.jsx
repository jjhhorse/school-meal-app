import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, Search, Utensils, X } from 'lucide-react';
import { getWeekdays, getWeeklyMealInfo, searchSchools } from './api';

const OFFICES = [['B10','서울특별시교육청'],['C10','부산광역시교육청'],['D10','대구광역시교육청'],['E10','인천광역시교육청'],['F10','광주광역시교육청'],['G10','대전광역시교육청'],['H10','울산광역시교육청'],['I10','세종특별자치시교육청'],['J10','경기도교육청'],['K10','강원도교육청'],['M10','충청북도교육청'],['N10','충청남도교육청'],['P10','전북특별자치도교육청'],['Q10','전라남도교육청'],['R10','경상북도교육청'],['S10','경상남도교육청'],['T10','제주특별자치도교육청']];
const WEEKDAYS = ['월','화','수','목','금'];
const SAVED_SCHOOL_KEY = 'neis-selected-school';
const toInputDate = (date) => { const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); };

function getSavedSchool() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_SCHOOL_KEY));
    return saved?.office && saved?.school?.code && saved?.school?.name ? saved : null;
  } catch {
    return null;
  }
}

function MealCard({ meal, weekday, date, reference }) {
  const dishes = meal?.DDISH_NM?.split('<br/>').filter(Boolean) || [];
  const nutrition = ['탄수화물', '단백질', '지방'].map((label) => ({
    label,
    value: meal?.NTR_INFO?.match(new RegExp(`${label}[^:]*:\\s*([^<]+)`))?.[1] || '-',
  }));
  return <article className={`meal-card ${meal ? '' : 'empty'} ${reference ? 'reference' : ''}`}>
    <div className="meal-date"><b>{weekday}</b><span>{date.slice(4,6)}.{date.slice(6,8)}</span></div>
    {meal ? <><h3>중식</h3><ul>{dishes.map((dish) => <li key={dish}>{dish.replace(/\s*\([^)]*\)/g, '')}</li>)}</ul><small>{meal.CAL_INFO || '열량 정보 없음'}</small><div className="nutrition"><strong>영양성분</strong><div>{nutrition.map((item) => <span key={item.label}><b>{item.label}</b>{item.value}</span>)}</div></div></> : <div className="no-meal">등록된 급식이<br />없어요</div>}
  </article>;
}

export default function App() {
  const saved = getSavedSchool();
  const [office, setOffice] = useState(saved?.office || 'B10'); const [query, setQuery] = useState(saved?.school?.name || ''); const [schools, setSchools] = useState([]); const [school, setSchool] = useState(saved?.school || null); const [date, setDate] = useState(toInputDate(new Date())); const [meals, setMeals] = useState([]); const [status, setStatus] = useState(null); const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (school) localStorage.setItem(SAVED_SCHOOL_KEY, JSON.stringify({ office, school }));
    else localStorage.removeItem(SAVED_SCHOOL_KEY);
  }, [office, school]);
  async function findSchool(event) { event.preventDefault(); if (!query.trim()) return setStatus({ type: 'error', text: '학교명을 입력해 주세요.' }); setLoading(true); setStatus(null); try { const result = await searchSchools(office, query); setSchools(result); setSchool(null); if (!result.length) setStatus({ type: 'empty', text: '검색 결과가 없습니다.' }); } catch (error) { setStatus({ type: 'error', text: error.message }); } finally { setLoading(false); } }
  async function findMeals(event) { event.preventDefault(); if (!school) return setStatus({ type: 'error', text: '검색 결과에서 학교를 먼저 선택해 주세요.' }); setLoading(true); setStatus(null); try { const result = await getWeeklyMealInfo(office, school.code, date); setMeals(result); setStatus({ type: result.length ? 'success' : 'empty', text: result.length ? '선택한 주의 급식입니다.' : '선택한 주에 등록된 중식이 없습니다.' }); } catch (error) { setMeals([]); setStatus({ type: 'error', text: error.message }); } finally { setLoading(false); } }
  const dates = getWeekdays(date); const byDate = Object.fromEntries(meals.map((meal) => [meal.MLSV_YMD, meal]));
  return <main className="shell"><header><div className="brand"><span><Utensils size={17} /></span>오늘 뭐 먹지?</div><small>학교 급식 한눈에 보기</small></header>
    <section className="hero"><div><p>NEIS SCHOOL MEAL</p><h1>이번 주<br /><em>맛있는</em> 계획</h1><label>우리 학교의 점심 메뉴를<br />간단하게 확인해 보세요.</label></div><img className="hero-photo" src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=720&q=85" alt="신선한 음식이 담긴 식탁" /></section>
    <section className="panel"><div className="heading"><div><i>01 / FIND YOUR SCHOOL</i><h2>학교를 찾아주세요</h2></div><small>* 필수 입력</small></div>
      <form className="form" onSubmit={findSchool}><label>시도교육청<div className="select"><select value={office} onChange={(e) => { setOffice(e.target.value); setSchools([]); setSchool(null); }}>{OFFICES.map(([code,name]) => <option key={code} value={code}>{name}</option>)}</select><ChevronDown size={16} /></div></label><label>학교명<div className="input"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="학교명을 입력해 주세요" /><button aria-label="학교 검색" disabled={loading}>{loading ? '...' : <Search size={18} />}</button></div></label></form>
      {schools.length > 0 && <div className="results"><small>검색 결과 <b>{schools.length}</b></small>{schools.map((item) => <button className="result" type="button" key={item.code} onClick={() => { setSchool(item); setSchools([]); setStatus(null); }}><span><b>{item.name}</b><small>{item.kind} · {item.address}</small></span><em>선택</em></button>)}</div>}
      {school && <div className="selected"><span><b>{school.name}</b> 학교가 선택되었습니다</span><button type="button" onClick={() => setSchool(null)} aria-label="선택한 학교 지우기"><X size={16} /></button></div>}
    </section>
    <section className="panel meals"><div className="heading"><div><i>02 / CHECK THIS WEEK</i><h2>급식 조회</h2></div><small>월요일 - 금요일 · 중식</small></div><form className="date-form" onSubmit={findMeals}><label><CalendarDays size={18} /> 조회 기준일 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><button disabled={loading}>이번 주 메뉴 보기 <b>→</b></button></form>{status && <div className={`status ${status.type}`}>{status.text}</div>}<div className="grid">{dates.map((item,index) => <MealCard key={item} meal={byDate[item]} weekday={WEEKDAYS[index]} date={item} reference={item === date.replaceAll('-','')} />)}<blockquote className="quote-card">인생에서 성공하는 비결 중 하나는<br className="mobile-quote-break" /> 좋아하는 음식을 먹고 힘내 싸우는 것이다<small>Mark Twain</small></blockquote></div><p className="note">NEIS Open API의 학교·급식 정보를 바탕으로 제공됩니다.</p></section><footer>ⓘ 급식 정보는 학교 사정에 따라 변경될 수 있습니다.</footer>
  </main>;
}
