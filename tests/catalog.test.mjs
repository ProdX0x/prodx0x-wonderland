import test from 'node:test';
import assert from 'node:assert/strict';
import {apps,validateApps} from '../src/apps.js';
test('les six créations conservent leur ordre et couvrent les quatre appareils',()=>{const result=validateApps(apps);assert.equal(result[0].name,'Iris');assert.equal(result.length,6);assert.deepEqual(new Set(result.map(a=>a.device)),new Set(['iphone','tv','mac','ipad']));});
test('une nouvelle création devient la première sans modifier le moteur',()=>{const result=validateApps([{name:'Nouvelle idée',device:'iphone'},...apps]);assert.equal(result.length,7);assert.equal(result[0].name,'Nouvelle idée');assert.equal(result[1].name,'Iris');});
test('un catalogue de trente applications ou un catalogue vide est accepté',()=>{assert.equal(validateApps(Array.from({length:30},(_,i)=>({name:`Création ${i}`,device:'ipad'}))).length,30);assert.deepEqual(validateApps([]),[]);});
test('les données incorrectes donnent un diagnostic explicite',()=>{assert.throws(()=>validateApps([{name:'Test',device:'unknown'}]),/appareil invalide/);assert.throws(()=>validateApps([apps[0],apps[0]]),/dupliqué/);});
