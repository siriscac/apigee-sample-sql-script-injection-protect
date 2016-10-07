var assert = chai.assert;
var pathname = window.location.pathname
var splits = pathname.split('/')
//expected /v1/o/:orgname/e/:env/samples/:sample/test.html
var org = splits[3]
var env = splits[5]
var sample = splits[7]

getTestData(org,env,sample,function(data){
  //i don have any data for this proxy
})

var create_url = 'https://' + org + '-' + env + '.apigee.net/jwt_signed/create-hs256'
var verify_url = 'https://' + org + '-' + env + '.apigee.net/jwt_signed/validate-hs256'

describe('Running tests for JWT', function() {
  var jwt=''
    it('Get a JWT token', function(done) {

      $.ajax({
          url:create_url,
          method: 'POST',
          data : 'key=12345678912345678912345678912345',
          headers: {
          'Content-Type':'application/x-www-form-urlencoded'
          },
          success:function(body){ 
            console.log(body)
            jwt=body.jwt
            assert(body)
            done()
          },
          error: function(xhr,status,error){
            done(error)
          }
      })
    })
      

    it('Verify the generated JWT', function(done){
      $.ajax({
          url:verify_url,
          method: 'POST',
          data : 'key=12345678912345678912345678912345&jwt=' + jwt,
          headers: {
          'Content-Type':'application/x-www-form-urlencoded'
          },
          success:function(body){ 
            console.log(body)            
            done()
          },
          error: function(xhr,status,error){
            done(error)
          }
      })
    })
})


