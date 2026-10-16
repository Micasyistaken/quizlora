import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const source = readFileSync(resolve('dist/assets/collon-transfer.js'), 'utf8');
const context = { TextEncoder, window: {} };
vm.runInNewContext(source, context);
const transfer = context.window.CollonTransfer;
const sample = () => ({v:1,catalogVersion:2,cats:[{id:'c1',n:'Genel',i:'globe',c:'#123456',p:null}],quizzes:[{id:'q1',t:'Genel',cat:'c1',st:'yayin',qs:[{id:'q1-1',q:'Soru 1',o:['A','B','C','D'],a:0,e:'Açıklama',d:1,cat:'c1',sub:'c1'}]}],extra:[],store:[],sugs:[],reports:[],seasons:[{id:1,n:'Sezon 1',a:1700000000000,b:null}],missions:[],users:{demo:{name:'Demo',email:'demo@example.test',hash:'digest',credits:0,skill:1000,streak:0,done:{q1:{runs:[{c:7,n:10}]}},cat:{},sub:{},log:[],follows:[],friends:[],owned:[],eq:{},j:{level:1,stone:1,cool:0},badges:[],m:{},claimed:{},priv:{stats:true,coll:true,badges:true},acts:[]}},me:'demo',theme:'dark',s:{groups:[['c1']],duelSec:20,duelCredit:15,duelBonus:30,cool:120,stoneBase:90,stoneStep:5,stoneTimes:{},suggestMin:100}});

test('round trip preserves profile and quiz progress', () => {
  const exported = transfer.makeExport(sample());
  const parsed = transfer.parseImport(JSON.stringify(exported));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.users.demo.done.q1.runs[0].c, 7);
  assert.equal(parsed.summary.users, 1);
});

test('invalid files never produce importable data', () => {
  for (const text of ['{', '{}', JSON.stringify({kind:'collon-local-backup',format:1,data:{v:2,cats:[],quizzes:[],users:{}}}), JSON.stringify({kind:'collon-local-backup',format:1,data:{v:1,cats:[],quizzes:[]}}), 'x'.repeat(5*1024*1024+1), '{"kind":"collon-local-backup","format":1,"data":{"v":1,"cats":[],"quizzes":[],"users":{"__proto__":{}}}}']) {
    assert.equal(transfer.parseImport(text).ok, false);
  }
});

test('export refuses an incompatible current record', () => {
  assert.throws(() => transfer.makeExport({v:2,cats:[],quizzes:[],users:{}}));
});

test('export accepts a normal multiline profile biography and preserves it', () => {
  const data = sample();
  data.users.demo.bio = 'İlk satır\nİkinci satır: 2 < 3';
  const result = transfer.parseImport(JSON.stringify(transfer.makeExport(data)));
  assert.equal(result.ok, true);
  assert.equal(result.data.users.demo.bio, data.users.demo.bio);
});

test('import refuses incomplete application records before replacing browser data', () => {
  const missingSettings = sample();
  delete missingSettings.s;
  const brokenCategories = sample();
  brokenCategories.cats = [null];
  const danglingProfile = sample();
  danglingProfile.me = 'unknown';
  const incompleteProfile = sample();
  incompleteProfile.users.demo = {};
  const missingQuizzes = sample();
  missingQuizzes.quizzes = [];
  const missingSeasons = sample();
  missingSeasons.seasons = [];
  const malformedSeason = sample();
  malformedSeason.seasons[0].a = 'not-a-date';
  const injectedQuizId = sample();
  injectedQuizId.quizzes[0].id = 'q1" onmouseover="alert(1)';
  const injectedColor = sample();
  injectedColor.cats[0].c = 'red;" onclick="alert(1)';
  const injectedMarkup = sample();
  injectedMarkup.quizzes[0].t = '<img src=x onerror=alert(1)>';
  const incompleteQuestion = sample();
  incompleteQuestion.quizzes[0].qs[0] = {};
  const malformedProgress = sample();
  malformedProgress.users.demo.done.q1 = {runs:null};
  const cyclicCategory = sample();
  cyclicCategory.cats[0].p = 'c1';
  for (const data of [missingSettings, brokenCategories, danglingProfile, incompleteProfile, missingQuizzes, missingSeasons, malformedSeason, injectedQuizId, injectedColor, injectedMarkup, incompleteQuestion, malformedProgress, cyclicCategory]) {
    assert.equal(transfer.parseImport(JSON.stringify({kind:'collon-local-backup',format:1,data})).ok, false);
  }
});
