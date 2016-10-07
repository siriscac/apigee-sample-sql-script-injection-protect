/* 
 * Parse the application session data (JSON String) from 'application-session-cache'
 * 
 * 
 * extract.application.session.data-1.0.js
*/

var sessionData;
var sessionDataAsJson;

// Get application session data (string)
sessionData = context.getVariable("session.Payload");
// JSON string to JSON object for easy manipulation of session data 
sessionDataJson = JSON.parse(sessionData);

var requestPayload = context.getVariable("request.content");
requestPayload = JSON.parse(requestPayload);

// Set flow variables 
context.setVariable("response_type_token",sessionDataJson.response_type_token);
context.setVariable("response_type_code",sessionDataJson.response_type_code);
context.setVariable("response_type_id_token",sessionDataJson.response_type_id_token);
context.setVariable("nonce",sessionDataJson.nonce);
context.setVariable("redirect_uri",sessionDataJson.redirect_uri);
context.setVariable("client_id",sessionDataJson.client_id);
context.setVariable("apigee.client_id",sessionDataJson.client_id);
context.setVariable("req_state",sessionDataJson.req_state);
context.setVariable("scope",sessionDataJson.scope);
context.setVariable("acr_values",sessionDataJson.acr_values);

context.setVariable("customerId",requestPayload.customerId);
context.setVariable("accountNumber",requestPayload.accountNumber);

context.setVariable("to",sessionDataJson.to);
context.setVariable("amount",sessionDataJson.amount);
context.setVariable("currency",sessionDataJson.currency);
context.setVariable("sort_code",sessionDataJson.sort_code);
context.setVariable("IBAN",sessionDataJson.IBAN);

if(sessionDataJson.response_type_code)
	context.setVariable("code","code");
if(sessionDataJson.response_type_token)
	context.setVariable("token","token");

