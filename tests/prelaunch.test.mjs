import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {PUMP_SDK} from '@pump-fun/pump-sdk';
import {Keypair,VersionedTransaction,TransactionMessage,ComputeBudgetProgram} from '@solana/web3.js';
import {colors,piecePaths} from '../dist/puzzle.js';

const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
// Execute the actual browser simulation handler in an isolated DOM stub.
// No network or wallet objects are supplied, so accidental external execution fails.
function simulation(trigger,items,counter=0){
  let html='',saves=0;
  const state={trigger,items,counter};
  const context=vm.createContext({state,colors,Math,Number,save(){saves++;},dialog(content){html=content;},$(){return {};},closeDialog(){}});
  vm.runInContext(source.split('\n').find(line=>line.startsWith('const escape=')),context);
  vm.runInContext(source.match(/const behaviors=\[[\s\S]*?\n\];/)[0],context);
  vm.runInContext(source.split('\n').find(line=>line.startsWith('function simulate()')),context);
  vm.runInContext('simulate()',context);
  return {html,counter:state.counter,saves};
}

for(const trigger of ['buy','sell'])test(`${trigger} event simulates configured buyback, burn, and holder reward in order`,()=>{
  const result=simulation(trigger,[{id:'buyback',value:'0.025'},{id:'burn',value:'2000'},{id:'airdrop',value:'0.05'}]);
  assert.match(result.html,new RegExp(`LOCAL SIMULATION · ${trigger.toUpperCase()} EVENT`));
  assert.match(result.html,/SIMULATED · Buy back with 0\.025 SOL/);
  assert.match(result.html,/SIMULATED · Burn 2000 tokens/);
  assert.match(result.html,/SIMULATED · Distribute 0\.05 SOL among 100 holders/);
  assert.ok(result.html.indexOf('Buy back')<result.html.indexOf('Burn 2000'));
  assert.ok(result.html.indexOf('Burn 2000')<result.html.indexOf('Distribute'));
  assert.equal(result.saves,1);
});

test('failed condition skips every following money action and counter',()=>{
  const result=simulation('sell',[{id:'condition',value:'2'},{id:'buyback',value:'1'},{id:'burn',value:'10'},{id:'counter',value:'count'}],7);
  assert.match(result.html,/STOP/);
  assert.match(result.html,/SKIPPED · Buy back tokens/);
  assert.match(result.html,/SKIPPED · Burn tokens/);
  assert.equal(result.counter,7);
  assert.doesNotMatch(result.html,/SIMULATED · Buy back with/);
});

test('passing condition runs the following action and increments local counter',()=>{
  const result=simulation('buy',[{id:'condition',value:'0.5'},{id:'buyback',value:'0.01'},{id:'counter',value:'purchases'}],4);
  assert.match(result.html,/PASS/);
  assert.match(result.html,/purchases = 5/);
  assert.equal(result.counter,5);
});

for(const n of [3,4,5])test(`${n}-piece puzzle creates exactly ${n} closed paths`,()=>{
  const paths=piecePaths(n);
  assert.equal(paths.length,n);
  assert.ok(paths.every(p=>p.startsWith('M ')&&p.endsWith(' Z')));
});

test('official pump.fun SDK builds a create_v2 transaction with a mint signature',async()=>{
  const mint=Keypair.generate(),creator=Keypair.generate();
  const ix=await PUMP_SDK.createV2Instruction({mint:mint.publicKey,name:'PUZZLED',symbol:'PIECE',uri:'https://example.com/metadata.json',creator:creator.publicKey,user:creator.publicKey,mayhemMode:false});
  assert.equal(ix.programId.toBase58(),'6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
  assert.equal(ix.keys.length,16);
  assert.equal(ix.keys[0].pubkey.toBase58(),mint.publicKey.toBase58());
  assert.equal(ix.keys[0].isSigner,true);
  const message=new TransactionMessage({payerKey:creator.publicKey,recentBlockhash:Keypair.generate().publicKey.toBase58(),instructions:[ComputeBudgetProgram.setComputeUnitLimit({units:300000}),ix]}).compileToV0Message();
  const transaction=new VersionedTransaction(message);
  transaction.sign([mint]);
  assert.equal(transaction.signatures.length,2);
  assert.ok(transaction.signatures.some(signature=>signature.some(byte=>byte!==0)));
  assert.ok(transaction.serialize().length>0);
});
