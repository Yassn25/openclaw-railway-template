import assert from 'node:assert/strict';
import {t as resolveGatewayAuthToken} from '/usr/local/lib/node_modules/openclaw/dist/auth-token-resolution-UNCC-T33.mjs';
const cfg={gateway:{auth:{mode:'token',token:{source:'env',provider:'default',id:'OPENCLAW_GATEWAY_TOKEN'}}}};
const result=await resolveGatewayAuthToken({cfg,env:{OPENCLAW_GATEWAY_TOKEN:'BSF_FAKE_SECRET_FOR_TEST'}});
assert.equal(result.token,'BSF_FAKE_SECRET_FOR_TEST');
assert.equal(result.secretRefConfigured,true);
console.log('Environment SecretRef works without CLI token; fake credential only.');
