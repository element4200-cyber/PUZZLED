import {PUMP_SDK} from '@pump-fun/pump-sdk';
import {Connection,Keypair,VersionedTransaction,TransactionMessage,ComputeBudgetProgram} from '@solana/web3.js';
export async function launchToken({wallet,name,symbol,uri,rpc,onStatus}) {
  if(!wallet?.publicKey || typeof wallet.signTransaction!=='function') throw new Error('Connect a Solana wallet that supports transaction signing.');
  if(new TextEncoder().encode(name).length>32 || new TextEncoder().encode(symbol).length>13) throw new Error('Name or ticker exceeds the on-chain byte limit.');
  if(uri.length>200 || !/^(https:\/\/|ipfs:\/\/)/.test(uri)) throw new Error('Enter a public HTTPS or IPFS metadata URI, up to 200 characters.');
  const connection=new Connection(rpc,'confirmed');
  const mint=Keypair.generate();
  onStatus('Building your pump.fun creation transaction…');
  const instruction=await PUMP_SDK.createV2Instruction({mint:mint.publicKey,name,symbol,uri,creator:wallet.publicKey,user:wallet.publicKey,mayhemMode:false});
  const latest=await connection.getLatestBlockhash();
  const message=new TransactionMessage({payerKey:wallet.publicKey,recentBlockhash:latest.blockhash,instructions:[ComputeBudgetProgram.setComputeUnitLimit({units:300000}),instruction]}).compileToV0Message();
  const tx=new VersionedTransaction(message);
  tx.sign([mint]);
  const simulation=await connection.simulateTransaction(tx,{sigVerify:false,commitment:'confirmed'});
  if(simulation.value.err) throw new Error('Creation simulation failed: '+JSON.stringify(simulation.value.err)+'. Check your SOL balance and RPC endpoint.');
  onStatus('Review the coin creation and network fees in your wallet.');
  const signed=await wallet.signTransaction(tx);
  onStatus('Submitting your signed transaction…');
  const signature=await connection.sendRawTransaction(signed.serialize(),{skipPreflight:false,maxRetries:3});
  onStatus('Submitted. Waiting for Solana confirmation…');
  try {
    const result=await connection.confirmTransaction({signature,...latest},'confirmed');
    if(result.value.err) throw new Error('Solana rejected the transaction: '+JSON.stringify(result.value.err));
  } catch(error) { error.signature=signature; error.mint=mint.publicKey.toBase58(); throw error; }
  return {signature,mint:mint.publicKey.toBase58()};
}
