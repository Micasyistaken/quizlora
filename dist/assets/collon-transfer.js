(function () {
  'use strict';
  const MAX_BYTES = 5 * 1024 * 1024;
  const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
  const safeId = value => typeof value === 'string' && /^[a-z][a-z0-9_-]{0,79}$/i.test(value);
  const safeUserKey = value => typeof value === 'string' && /^[\p{L}0-9_.-]{3,20}$/u.test(value);
  const plainText = value => typeof value === 'string' && value.length <= 20000 && !/[<>\u0000-\u001f]/.test(value);
  const biographyText = value => typeof value === 'string' && value.length <= 200 && !/[\u0000-\u0009\u000b-\u001f]/.test(value);
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function hasUnsafeKey(value) {
    const pending = [value];
    while (pending.length) {
      const entry = pending.pop();
      if (!entry || typeof entry !== 'object') continue;
      if (Array.isArray(entry)) { for (const child of entry) pending.push(child); continue; }
      for (const [key, child] of Object.entries(entry)) {
        if (forbidden.has(key)) return true;
        if (child && typeof child === 'object') pending.push(child);
      }
    }
    return false;
  }
  function hasUnsafeValue(value) {
    const pending = [{entry:value,path:[]}];
    while (pending.length) {
      const {entry,path} = pending.pop();
      if (typeof entry === 'string' && !(path.length === 3 && path[0] === 'users' && path[2] === 'bio' ? biographyText(entry) : plainText(entry))) return true;
      if (!entry || typeof entry !== 'object') continue;
      if (Array.isArray(entry)) { for (const child of entry) pending.push({entry:child,path}); continue; }
      for (const [key, child] of Object.entries(entry)) {
        if (key === 'id' && typeof child === 'string' && !safeId(child)) return true;
        if (child && typeof child === 'object' || typeof child === 'string') pending.push({entry:child,path:[...path,key]});
      }
    }
    return false;
  }
  function validQuestion(q, categories) {
    return isRecord(q) && safeId(q.id) && plainText(q.q) && Array.isArray(q.o) &&
      q.o.length === 4 && q.o.every(plainText) && Number.isInteger(q.a) && q.a >= 0 && q.a < 4 &&
      plainText(q.e) && Number.isInteger(q.d) && q.d >= 1 && q.d <= 3 && categories.has(q.cat) &&
      (q.sub === undefined || categories.has(q.sub));
  }
  function validUser(key, user) {
    return safeUserKey(key) && isRecord(user) && safeUserKey(user.name) &&
      user.name.toLowerCase() === key.toLowerCase() &&
      plainText(user.email) && plainText(user.hash) &&
      (user.bio === undefined || biographyText(user.bio)) && isRecord(user.done) &&
      Number.isFinite(user.credits) && Number.isFinite(user.skill) && Number.isFinite(user.streak) &&
      isRecord(user.cat) && isRecord(user.sub) && Array.isArray(user.log) &&
      Array.isArray(user.follows) && Array.isArray(user.friends) && Array.isArray(user.owned) &&
      isRecord(user.eq) && isRecord(user.j) && Number.isFinite(user.j.level) &&
      Number.isFinite(user.j.stone) && Array.isArray(user.badges) && isRecord(user.m) &&
      isRecord(user.claimed) && isRecord(user.priv) && Array.isArray(user.acts) &&
      Object.entries(user.done).every(([id,progress]) => safeId(id) && isRecord(progress) &&
        Array.isArray(progress.runs) && progress.runs.every(run => isRecord(run) &&
          Number.isFinite(run.c) && Number.isFinite(run.n))) &&
      [user.cat,user.sub].every(stats => Object.values(stats).every(record =>
        isRecord(record) && Number.isFinite(record.a) && Number.isFinite(record.c))) &&
      user.follows.every(safeId) && user.friends.every(safeUserKey) &&
      user.owned.every(safeId) && Object.values(user.eq).every(safeId) &&
      (!user.resume || isRecord(user.resume) && safeId(user.resume.quizId));
  }
  function isValidData(data) {
    if (!isRecord(data) || data.v !== 1 || !Array.isArray(data.cats) || !data.cats.length ||
      !Array.isArray(data.quizzes) || !data.quizzes.length || !isRecord(data.users) ||
      !Array.isArray(data.extra) || !Array.isArray(data.store) ||
      !Array.isArray(data.sugs) || !Array.isArray(data.reports) ||
      !Array.isArray(data.seasons) || !data.seasons.length || !Array.isArray(data.missions) ||
      hasUnsafeKey(data) || hasUnsafeValue(data)) return false;
    const categoryIds = new Set(data.cats.map(c => c?.id));
    const categoryById = new Map(data.cats.map(c => [c?.id,c]));
    for (const category of data.cats) {
      const seen = new Set();
      let current = category;
      while (current?.p !== null) {
        if (!current || seen.has(current.id)) return false;
        seen.add(current.id);
        current = categoryById.get(current.p);
      }
    }
    return data.cats.every(c => isRecord(c) && safeId(c.id) && plainText(c.n) &&
        safeId(c.i) && /^#[0-9a-f]{6}$/i.test(c.c) && (c.p === null || categoryIds.has(c.p))) &&
      categoryIds.size === data.cats.length &&
      data.quizzes.every(q => isRecord(q) && safeId(q.id) && plainText(q.t) &&
        categoryIds.has(q.cat) && ['yayin','taslak'].includes(q.st) &&
        Array.isArray(q.qs) && q.qs.length > 0 && q.qs.every(x => validQuestion(x, categoryIds))) &&
      data.extra.every(q => validQuestion(q, categoryIds) && ['yayin','taslak'].includes(q.st)) &&
      data.seasons.every(s => isRecord(s) && Number.isInteger(s.id) && s.id > 0 &&
        plainText(s.n) && Number.isFinite(s.a) && s.a > 0 &&
        (s.b === null || Number.isFinite(s.b) && s.b >= s.a)) &&
      new Set(data.seasons.map(s => s.id)).size === data.seasons.length &&
      Object.entries(data.users).every(([key,user]) => validUser(key,user)) &&
      (data.me === null || typeof data.me === 'string' && isRecord(data.users[data.me])) &&
      (data.theme === null || ['light','dark'].includes(data.theme)) &&
      isRecord(data.s) && Array.isArray(data.s.groups) &&
      data.s.groups.every(group => Array.isArray(group) && group.every(id => categoryIds.has(id))) &&
      isRecord(data.s.stoneTimes);
  }
  function makeExport(data) {
    if (!isValidData(data)) throw new Error('Bu cihazdaki veri yedeklenebilir biçimde değil.');
    const copy = JSON.parse(JSON.stringify(data));
    return { kind:'collon-local-backup', format:1, exportedAt:new Date().toISOString(), data:copy };
  }
  function parseImport(text) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BYTES) {
      return {ok:false,error:'Dosya 5 MB sınırını aşıyor veya okunamıyor.'};
    }
    let backup;
    try { backup = JSON.parse(text); }
    catch (_) { return {ok:false,error:'Bu dosya geçerli bir JSON yedeği değil.'}; }
    if (!isRecord(backup) || backup.kind !== 'collon-local-backup' || backup.format !== 1) {
      return {ok:false,error:'Bu dosya desteklenen bir Collon yedeği değil.'};
    }
    if (!isValidData(backup.data)) {
      return {ok:false,error:'Yedek eksik, güvenli değil veya desteklenmeyen bir veri sürümünde.'};
    }
    const data = backup.data;
    return {ok:true,data,summary:{users:Object.keys(data.users).length,categories:data.cats.length,quizzes:data.quizzes.length,activeProfile:data.me || null}};
  }
  window.CollonTransfer = Object.freeze({makeExport,parseImport,MAX_BYTES});
})();
