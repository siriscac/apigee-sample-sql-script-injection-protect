var gulp = require('gulp');
var apigeetool = require('apigeetool')
var gutil = require('gulp-util')

var seedsdk = require('seed-sdk')

var PROXY_NAME = 'apigee-sample-oauth-client-credentials'
var DEVELOPER_EMAIL = 'test123@apigeeseed.com'
var PRODUCT_NAME = 'apigee-sample-oauth-product'
var APP_NAME = 'seed-sample-oauth'
var SAMPLE_NAME = 'oauth-client-credentials'
gulp.task('default', function() {
  // place code for your default task here
});

var opts = {
    organization: gutil.env.org,
    token: gutil.env.token,
    environments: gutil.env.env,    
    environment: gutil.env.env,
    debug: gutil.env.debug    
}

gulp.task('deploy',function(){
	opts.api = PROXY_NAME
	//product stuff
	opts.productName = PRODUCT_NAME
    opts.productDesc = 'abc123'
    opts.proxies = PROXY_NAME
    opts.environments = 'test'
    //developer stuff
    opts.email = DEVELOPER_EMAIL
    opts.firstName = 'seed1'
    opts.lastName = 'seed2'
    opts.userName = PROXY_NAME + 'apigeeseed123'

    //app stuff
    opts.name = PROXY_NAME + '_app'
    opts.apiproducts = PRODUCT_NAME

    var sdk = apigeetool.getPromiseSDK()
	return sdk.deployProxy(opts)
			  .then(function(){ return sdk.createProduct(opts)})
			  .then(function(){ return sdk.createDeveloper(opts)})
			  .then(function(){ return sdk.createApp(opts)})
			  .then(function(app){
			  	opts.client_id=app.credentials[0].consumerKey
			  	opts.client_secret=app.credentials[0].consumerSecret			  	
			  	opts.appName = opts.name
			  	opts.sample = SAMPLE_NAME
			  	delete opts.name		  	
			  	delete opts.token
			  	return seedsdk.storeTestData(opts)
			  }).then(function(){
			  	console.log('success')
			  })
})

gulp.task('clean',function(){
	opts.api = PROXY_NAME
	//product stuff
	opts.productName = PRODUCT_NAME    
    //developer stuff
    opts.email = DEVELOPER_EMAIL    
    //app stuff
    opts.name = PROXY_NAME + '_app'
    
    var sdk = apigeetool.getPromiseSDK()
	return sdk.deleteApp(opts)
			  .then(function(){ return sdk.deleteDeveloper(opts)})
			  .then(function(){ return sdk.deleteProduct(opts)})
			  .then(function(){ return sdk.undeploy(opts)})
			  .then(function(){ return sdk.delete(opts)})
			  .then(function(app){
			  	console.log(app)
			  })
})