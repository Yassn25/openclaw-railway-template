import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(process.argv[2]??'src/server.js','utf8');
function callback(marker){
 const start=source.indexOf(marker);assert.ok(start>=0);
 const end=source.indexOf('\n});',start);assert.ok(end>start);
 return source.slice(start,end+4);
}
const handlers={};
const proxy={on:(name,fn)=>handlers[name]=fn,web:()=>{proxy.forwarded=true}};
for(const event of ['proxyReq','proxyReqWs']){
 new Function('proxy','PROXY_ORIGIN','rebuildForwardedHeaders','process','OPENCLAW_GATEWAY_TOKEN',callback(`proxy.on("${event}",`))(proxy,'https://example.invalid',()=>{}, {env:{}},'FAKE_SERVER_SECRET');
 for(const incoming of [undefined,'Bearer FAKE_CLIENT_SECRET','Bearer INVALID']){
  const headers={};if(incoming)headers.Authorization=incoming;
  handlers[event]({setHeader:(k,v)=>headers[k]=v},{url:'/openclaw'},null,null,null);
  assert.equal(headers.Authorization,incoming,'Proxy overwrote caller authentication');
  assert.ok(!JSON.stringify(headers).includes('FAKE_SERVER_SECRET'));
 }
}
let route;
new Function('app','isConfigured','isGatewayReady','proxy','GATEWAY_TARGET','OPENCLAW_GATEWAY_TOKEN',callback('app.use(async (req, res) => {'))({use:f=>route=f},()=>true,()=>true,proxy,'http://127.0.0.1:18789','FAKE_SERVER_SECRET');
let redirects=[];
await route({path:'/openclaw',query:{}},{redirect:x=>redirects.push(x)});
assert.deepEqual(redirects,[],'Anonymous UI request leaked token in redirect');
assert.equal(proxy.forwarded,true);
console.log('PASS: HTTP and WebSocket preserve absent/valid/invalid caller auth; UI does not redirect with server token.');

const boot=source.slice(source.indexOf("const server = app.listen("),source.indexOf('server.on("upgrade"'));
assert.ok(!boot.includes('clawArgs(["doctor", "--fix"])'),"Boot must not implicitly repair production config");

const gatewayStart=source.slice(source.indexOf("async function startGateway()"),source.indexOf("gatewayLastStartTime = Date.now()",source.indexOf("async function startGateway()")));
const arraySource=gatewayStart.slice(gatewayStart.indexOf("const args = ["))+"\nreturn args;";
const startupArgs=new Function("INTERNAL_GATEWAY_PORT","OPENCLAW_GATEWAY_TOKEN",arraySource)(18789,"BSF_FAKE_PROCESS_SECRET");
assert.ok(!startupArgs.includes("--token"),"Gateway token must not be a command-line argument");
assert.ok(!JSON.stringify(startupArgs).includes("BSF_FAKE_PROCESS_SECRET"));
