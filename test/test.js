var assert = chai.assert;

var pathname = window.location.pathname
var splits = pathname.split('/')
//expected /v1/o/:orgname/e/:env/samples/:sample/test.html
var org = splits[3]
var env = splits[5]
var sample = splits[7]
var client_id;
var secret;

describe('SQL/Script threat protection', function(){
	it('Inject SQL', function(done){
		var url = 'http://' + org + '-' + env + '.apigee.net/catalog?query=delete * from table'
			$.ajax({
				url:url,
				complete:function(xhr,statusText){
					try{
						var s = assert.equal(200, xhr.status)
					} catch(e){
						e.message = xhr.statusText
						done(e);
					}
				},
				error: function(xhr,err){}
			})				
	})

	it('Inject Script', function(done){
		var url = 'http://' + org + '-' + env + '.apigee.net/catalog?query=<script>function abc(){}</script>'
			$.ajax({
				url:url,
				complete:function(xhr,statusText){
					try{
						var s = assert.equal(200, xhr.status)
					} catch(e){
						e.message = xhr.statusText
						done(e);
					}
				},
				error: function(xhr,err){}
			})				
	})

	it('General query', function(done){
		var url = 'http://' + org + '-' + env + '.apigee.net/catalog?query=product'
			$.ajax({
				url:url,
				complete:function(xhr,statusText){
					try{
						var s = assert.equal(200, xhr.status)
						done()
					} catch(e){
						e.message = xhr.statusText
						done(e);
					}
				},
				error: function(xhr,err){}
			})				
	})
})	