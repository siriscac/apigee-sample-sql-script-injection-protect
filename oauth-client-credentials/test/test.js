var assert = chai.assert;

var pathname = window.location.pathname
var splits = pathname.split('/')
//expected /v1/o/:orgname/e/:env/samples/:sample/test.html
var org = splits[3]
var env = splits[5]
var sample = splits[7]
var client_id;
var secret;

describe('OAuth Client Credentials', function(){
	before(function(done){
		new Promise(function(resolve,reject){
		  getTestData(org,env,sample,function(data){
			  client_id = data.entities[0].client_id;
			  secret = data.entities[0].client_secret;			
        resolve()
		  })
		}).then(done) 
	})
	it('Get Access Token', function(done){
		var url = 'https://' + org + '-' + env + '.apigee.net/weatheroauth'
				$.ajax({
					url:url,
					method: 'POST',
					data: 'grant_type=client_credentials',
					beforeSend: function (xhr) {
				    	xhr.setRequestHeader ("Authorization", "Basic " + btoa(client_id + ":" + secret));
					},
					headers: {
						'Content-Type':'application/x-www-form-urlencoded'
					},
					complete:function(xhr,statusText){ done()},
					error: function(xhr,err){done(err)}
				})
				
	})
})	