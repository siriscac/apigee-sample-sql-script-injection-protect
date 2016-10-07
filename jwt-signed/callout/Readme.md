# jwt_signed callout

This directory contains the Java source code and Java jars required to
compile a Java callout for Apigee Edge that does generation and
parsing / validation of signed JWT. It uses the Nimbus library for JOSE. 

The API Proxy subdirectory, which is a sibling to this one, includes the pre-built JAR file. Therefore you do not need to build this Java code in order to use the JWT verifier. 

However, you may wish to modify this code for your own purposes. In that case, you will modify the Java code, re-build, then copy that JAR into the appropriate apiproxy/resources/java directory for the API Proxy.  


## License

This project and all the code contained within is licensed under the [Apache 2.0 Source license](LICENSE).


## Using the Jar

You do not need to build the JAR in order to use it. 
To use it: 

1. Include the Java callout policy in your
   apiproxy/resources/policies directory. The configuration should look like
   this:
    ```xml
    <JavaCallout name="JavaJwtHandler" enabled='true'
                 continueOnError='false' async='false'>
      <DisplayName>Java JWT Creator</DisplayName>
      <Properties>...</Properties>
      <ClassName>com.apigee.callout.jwt.JwtCreatorCallout</ClassName>
      <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
    </JavaCallout>
   ```

2. Deploy your API Proxy, using 
   pushapi (See https://github.com/carloseberhardt/apiploy)
   or a similar alternative tool.

For some examples of how to configure the callout, see the related api proxy bundle. 



## Dependencies

Jars available in Edge:   
 - Apigee Edge expressions v1.0
 - Apigee Edge message-flow v1.0
 - Apache commons lang v2.6 - String and Date utilities
 - Apache commons codec 1.7 - Base64 and Hex codecs
 - not-yet-commons-ssl v0.3.9 - RSA private/public crypto

Jars not available in Edge:
 - Nimbus JOSE JWT v3.1.2
 - json-smart v1.3
 - Google Guava 18.0 (for collections utilities and cache)
 - Apache commons lang3 v3.4 - FastDateFormat

All these jars must be available on the classpath for the compile to
succeed. The build.sh script should download all of these files for
you, automatically.


### Manual Download of Depencencies?

Maven will download all of these dependencies for you. If you wish to download them manually: 

The first 5 jars are available in Apigee Edge. 

The first two are
produced by Apigee; contact Apigee support to obtain these jars to allow
the compile, or get them here: 
https://github.com/apigee/api-platform-samples/tree/master/doc-samples/java-cookbook/lib

The rest of the Jars are available on your choice of maven repository.

The FOUR jars that are not available in Edge MUST BE INCLUDED in your API Proxy scripts.
The pom.xml file will copy these JARs to the apiproxy resources directory, if you build from source. Otherwise, you need to make sure you include these JARs into the api proxy bundle.


## Configuring the Callout Policy:

There are two callout classes, one to generate a JWT and one to validate
and parse a JWT. How the JWT is generated or validated, respectively,
depends on configuration information you specify for the callout, in the
form of properties on the policy.  Some examples follow. 

**Generate a JWT using HS256**
```xml
  <JavaCallout name='JavaCallout-JWT-Create' enabled='true'>
    <DisplayName>JavaCallout-JWT-Create</DisplayName>
    <Properties>
      <Property name="algorithm">HS256</Property>
      <!-- the key is likely the client_secret -->
      <Property name="secret-key">{organization.name}</Property>
      <!-- claims -->
      <Property name="subject">{apiproxy.name}</Property>
      <Property name="issuer">http://dinochiesa.net</Property>
      <Property name="audience">{desired_jwt_audience}</Property>
      <Property name="expiresIn">86400</Property> <!-- in seconds -->
    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtCreatorCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

This class conjures a JWT with the standard claims: 
 - subject (sub)  
 - audience (aud)  
 - issuer (iss)  
 - issuedAt (iat)  
 - expiration (exp)  
 - id (jti)  

It uses HMAC-SHA256 for signing. 

The values for the properties can be specified as string values, or
as variables to de-reference, when placed inside curly braces.

It emits the dot-separated JWT into the variable named
    jwt_jwt

There is no way to explicitly set the "issued at" (iat) time.  The iat
time automatically gets the value accurately indicating when the JWT is
generated.



**Generate a JWT using RS256**

To generate a key signed with RS256, you can specify the private RSA key inside the policy configuration, like this:

```xml
  <JavaCallout name='JavaCallout-JWT-Create-RS256-2' >
    <DisplayName>JavaCallout-JWT-Create-RS256-2</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>

      <!-- private-key and private-key-password used only for algorithm = RS256 -->
      <Property name="private-key">
      -----BEGIN PRIVATE KEY-----
      Proc-Type: 4,ENCRYPTED
      DEK-Info: DES-EDE3-CBC,049E6103F40FBE84

      EZVWs5v4FoRrFdK+YbpjCmW0KoHUmBAW7XLvS+vK3BdSM2Yx/hPhDO9URCVl9Oar
      ApEZC1CxzsyRfvKDtiKWfQKdYKLccl8pA4Jj0sCxVgL4MBFDNDDEau4vRfXBv2EF
      ....
      7ZOF1UXVaoldDs+izZo5biVF/NNIBtg2FkZd4hh/cFlF1PV+M5+5mA==
      -----END PRIVATE KEY-----
      </Property>

      <!-- this value should not be hardcoded. Put it in the vault! -->
      <Property name="private-key-password">deecee123</Property>

      <!-- standard claims -->
      <Property name="subject">{apiproxy.name}</Property>
      <Property name="issuer">http://dinochiesa.net</Property>
      <Property name="audience">Optional-String-or-URI</Property>
      <Property name="expiresIn">86400</Property> <!-- in seconds -->

      <!-- custom claims to inject into the JWT -->
      <Property name="claim_primarylanguage">English</Property>
      <Property name="claim_shoesize">8.5</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtCreatorCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

The private key should be in pkcs8 format.
You can produce a keypair in the correct format with this set of shell commands:
```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
openssl pkcs8 -topk8 -inform pem -in private.pem -outform pem -nocrypt -out private-pkcs8.pem
```

The private key need not be encrypted. If it is, obviously you need to
specify the private-key-password. That password can be (should be!) a variable - specify it in curly braces in that case. You should retrieve it from secure storage before invoking this policy. 

The resulting JWT is signed with RSA, using the designated private-key. 


**Generate a JWT using RS256 - specify PEM file as resource in JAR**

You can also specify the PEM as a named file resource that is bundled in the jar itself. To do this, you need to recompile the jar with your desired pemfile contained within it. The class looks for the file in the jarfile under the /resources directory. The configuration looks like this:

```xml
  <JavaCallout name='JavaCallout-JWT-Create'>
    <DisplayName>JavaCallout-JWT-Create</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>

      <!-- pemfile + private-key-password} used only for algorithm = RS256 -->
      <Property name="pemfile">private.pem</Property>
      <Property name="private-key-password">{var.that.contains.password.here}</Property>

      <!-- claims to inject into the JWT -->
      <Property name="subject">{apiproxy.name}</Property>
      <Property name="issuer">http://dinochiesa.net</Property>
      <Property name="audience">{context.var.that.contains.audience.name}</Property>
      <Property name="expiresIn">86400</Property> <!-- in seconds -->

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtCreatorCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

The pemfile need not be encrypted. If it is, obviously you need to
specify the password .  The file must be in PEM format, not DER
format. The class looks for the file in the jarfile under the /resources
directory.


**Generating a JWT with custom claims**

If you wish to embed other claims into the JWT, you can do so by using
the Properties elements, like this: 

```xml
  <JavaCallout name='JavaCallout-JWT-Create'>
    <DisplayName>JavaCallout-JWT-Create</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>

      <!-- pemfile + private-key-password} used only for algorithm = RS256 -->
      <Property name="pemfile">private.pem</Property>
      <Property name="private-key-password">deecee123</Property>

      <!-- standard claims to embed -->
      <Property name="subject">{apiproxy.name}</Property>
      <Property name="issuer">http://dinochiesa.net</Property>
      <Property name="audience">Optional-String-or-URI</Property>
      <Property name="expiresIn">86400</Property> <!-- in seconds -->

      <!-- custom claims to embed in the JWT. -->
      <!-- Property names must begin with claim_ . -->
      <Property name="claim_shoesize">9</Property>
      <Property name="claim_gender">M</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtCreatorCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```


**Parsing and Verifying a JWT - HS256**

For parsing and verifying a JWT, you need to specify a different Java class. Configure it like so for HS256: 

```xml
  <JavaCallout name='JavaCallout-JWT-Parse'>
    <DisplayName>JavaCallout-JWT-Parse</DisplayName>
    <Properties>
      <Property name="algorithm">HS256</Property>

      <Property name="jwt">{request.formparam.jwt}</Property>

      <!-- name of var that holds the shared key (likely the client_secret) -->
      <Property name="secret-key">{organization.name}</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtParserCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

This class accepts a signed JWT in dot-separated format, verifies the
signature with the specified key, and then parses the resulting claims. 

It sets these context variables: 

      jwt_jwt - the jwt string you passed in 
      jwt_claims - a json-formatted string of all claims
      jwt_issuer
      jwt_audience
      jwt_subject
      jwt_issueTime
      jwt_issueTimeFormatted ("yyyy-MM-dd'T'HH:mm:ss.SSSZ")
      jwt_hasExpiry  (true/false)
      jwt_expirationTime
      jwt_expirationTimeFormatted
      jwt_secondsRemaining
      jwt_timeRemainingFormatted   (HH:mm:ss.xxx)
      jwt_signed (true/false indicating if JWT is signed)
      jwt_verified (true/false indicating if signature has been verified)
      jwt_isExpired  (true/false)
      jwt_isValid  (true/false)
      jwt_reason - human explanation for the reason a JWT is not valid


The "Formatted" versions of the times are for diagnostic or display
purposes. It's easier to understand a time when displayed that way. 

The isValid indicates whether the JWT should be honored - true if and
only if the signature verifies and the times are valid, and all the required claims match.

### Let's talk about Verification

The policy may return SUCCESS or ABORT - in other words it may succeed, or it may put the proxy into Fault processing. Faults occur only case of an un-foreseeable runtime error, or when there is an incorrect configuration. Examples of incorrect configuration: 

* if you specify algorithm=RS256 but do not specify a 
  certificate or public-key with which to perform the validation. 
* if you specify algorithm=HS256 but do not specify a secret-key. 
* if you do not specify a jwt property

In all other cases, the callout will return SUCCESS, even if the signature does not verify properly, or if it is expired, and so on. SUCCESS indicates that the policy has completed its check, it does not indicate that the policy found the provided JWT to satisfy the configured constraints. For this reason, api proxy logic should check for the presence and value of variables like jwt_isValid, jwt_isExpired, and jwt_verified. 

It is possible for a JWT to be signed and verified but not valid, according to the configured claims you are enforcing. If the JWT signature is not verifiable, then the JWT will also be not valid (jwt_isValid = false).


**Parsing and Verifying a JWT - RS256**

To parse and verify a RS256 JWT, then you need to use a configuration like this:

```xml
  <JavaCallout name='JavaCallout-JWT-Parse-RS256-2'>
    <DisplayName>JavaCallout-JWT-Parse-RS256-2</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>
      <Property name="jwt">{request.formparam.jwt}</Property>
      <Property name="timeAllowance">30000</Property>

      <!-- public-key used only for algorithm = RS256 -->
      <Property name="public-key">
      -----BEGIN PUBLIC KEY-----
      MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtxlohiBDbI/jejs5WLKe
      Vpb4SCNM9puY+poGkgMkurPRAUROvjCUYm2g9vXiFQl+ZKfZ2BolfnEYIXXVJjUm
      zzaX9lBnYK/v9GQz1i2zrxOnSRfhhYEb7F8tvvKWMChK3tArrOXUDdOp2YUZBY2b
      sl1iBDkc5ul/UgtjhHntA0r2FcUE4kEj2lwU1di9EzJv7sdE/YKPrPtFoNoxmthI
      OvvEC45QxfNJ6OwpqgSOyKFwE230x8UPKmgGDQmED3PNrio3PlcM0XONDtgBewL0
      3+OgERo/6JcZbs4CtORrpPxpJd6kvBiDgG07pUxMNKC2EbQGxkXer4bvlyqLiVzt
      bwIDAQAB
      -----END PUBLIC KEY-----
      </Property>

      <!-- claims to verify. Can include custom claims. -->
      <Property name="claim_iss">http://dinochiesa.net</Property>
      <Property name="claim_shoesize">8.5</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtParserCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

By default, the Parser callout, whether using HS256 or RS256, verifies
that the nbf (not-before) and exp (expiry) claims are valid - in other
words the JWT is within it's documented valid time range. By default the
Parser allows a 1s skew for exp and nbf claims. You can modify this with
an additional property, as shown above, "timeAllowance". This is useful
if the time on the issuing system is skewed from the time on the
validating system. Set this value in milliseconds. In the example above,
the value 30000 means that a JWT with a nbf time that is less than 30
seconds in the future will be treated as valid.  Similarly a JWT with an
exp which is less than 30 seconds in the past will also be treated as
valid. Use a negative value (eg, -1) to disable validity checks on nbf
and exp.

Beyond times, you may wish to verify other arbitrary claims on the
JWT. At this time the only supported check is for string equivalence. So
you may verify the issuer, the audience, or the value of any custom
custom claim (either public/registered, or private).

Regarding audience - the spec states that the audience is an array of
strings. The parser class validates that the audience value you pass
here (as a string) is present as one of the elements in that array.
Currently there is no way to verify that the JWT is directed to more
than one audience. To do so, you could invoke the Callout twice, with different
configurations.


**Parse a JWT, and Verify specific claims**

To verify specific claims in the JWT, use additional properties.
Do this by specifying Property elements with name attributes that begin with claim_ :

```xml
  <JavaCallout name='JavaCallout-JWT-Parse'>
    <DisplayName>JavaCallout-JWT-Parse</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>

      <!-- name of var that holds the jwt -->
      <Property name="jwt">{request.formparam.jwt}</Property>

      <!-- name of the pemfile. This must be a resource in the JAR! 
      <Property name="pemfile">rsa-public.pem</Property>

      <!-- specific claims to verify, and their required values. -->
      <Property name="claim_sub">A6EE23332295D597</Property>
      <Property name="claim_aud">http://example.com/everyone</Property>
      <Property name="claim_iss">urn://edge.apigee.com/jwt</Property>
      <Property name="claim_shoesize">9</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtParserCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

All the context variables described above are also set in this scenario.

As above, the isValid variable indicates whether the JWT should be
honored. In this case, though, it is true if and only if the times
are valid AND if all of the claims listed as required in the
configuration are present in the JWT, and their respective values
are equal to the values provided in the <Property> elements.

To specify required claims, you must use the claim names as used within the JSON-serialized JWT.  Hence "claim_sub" and "claim_iss", not "claim_subject" and
"claim_issuer".

Verifying specific claims works whether the algorithm is HS256 or RS256.


**Parsing and Verifying a JWT - RS256 - pemfile**

You can also specify the public key as a named file resource in the jar.
To do this, you need to recompile the jar with your desired pemfile contained within it. The class looks for the file in the jarfile under the /resources directory. The configuration looks like this:

```xml
  <JavaCallout name='JavaCallout-JWT-Parse'>
    <DisplayName>JavaCallout-JWT-Parse</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>

      <Property name="jwt">{request.formparam.jwt}</Property>

      <!-- name of the pemfile. This must be a resource in the JAR. -->
      <Property name="pemfile">rsa-public.pem</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtParserCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

**Parsing and Verifying a JWT - RS256 - certificate**

You can also specify a serialized X509 certificate which contains the public key. 

```xml
  <JavaCallout name='JavaCallout-JWT-Parse-RS256-3'>
    <DisplayName>JavaCallout-JWT-Parse-RS256-3</DisplayName>
    <Properties>
      <Property name="algorithm">RS256</Property>
      <Property name="jwt">{request.formparam.jwt}</Property>

      <!-- certificate used only for algorithm = RS256 -->
      <Property name="certificate">
      -----BEGIN CERTIFICATE-----
      MIIC4jCCAcqgAwIBAgIQ.....aKLWSqMhozdhXsIIKvJQ==
      -----END CERTIFICATE-----
      </Property>

      <!-- claims to verify -->
      <Property name="claim_iss">https://sts.windows.net/fa2613dd-1c7b-469b-8f92-88cd26856240/</Property>
      <Property name="claim_ver">1.0</Property>

    </Properties>

    <ClassName>com.apigee.callout.jwt.JwtParserCallout</ClassName>
    <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
  </JavaCallout>
```

This particular example verifies the issuer is a given URL from windows.net.  This is what Azure Active Directory uses when generating JWT. (This URL is unique to the Active Directory instance, so it is not re-usable when verifying your own AAD-generated tokens.) 



**Parsing and Verifying a JWT - RS256 - using modulus + exponent**

Suppose you have not the PEM-representation of the public key, and not a
certificate, but the modulus and public exponent of the RSA key, in
base64 encoded format. In this case you can specify the public key with
those values, using the modulus and exponent properties:


```xml
<JavaCallout name='JavaCallout-JWT-Parse-xxx'>
  <Properties>
    <Property name="algorithm">RS256</Property>
    <Property name="jwt">{request.formparam.jwt}</Property>

    <!-- these properties are used only for algorithm = RS256 -->
    <Property name="modulus">{context.var.containing.modulus}</Property>
    <Property name="exponent">{context.var.containing.public.exponent}</Property>

    <!-- claims to verify -->
    <Property name="claim_iss">http://server.example.com</Property>
    <Property name="claim_aud">s6BhdRkqt3</Property>

  </Properties>

  <ClassName>com.apigee.callout.jwt.JwtParserCallout</ClassName>
  <ResourceURL>java://jwt-signed-edge-callout.jar</ResourceURL>
</JavaCallout>
```

This is useful when, for example, verifying keys that have been issued
by Salesforce.com, which publishes its keys in JWK form, with modulus
and exponent.  The modulus and exponent should be in base64 format.
The policy will eliminate any whitespace in these strings. They can be
URL-safe base64 or non-URL-safe base64. 

You can also specify these values statically in the configuration file. 

The order of precedence the callout uses for determining the public key is this: 

A. public-key  
B. modulus and exponent   
C. certificate  
D. pemfile  

If you specify more than one of {A,B,C,D} the callout will use the first
one it finds. It's not the order in which the properties appear in the
file; it's the order described here. 


## Some comments about Performance

Performance of this policy will vary depending on many factors: the machine (CPU, memory) that supports the message processor, the other things running on the machine, the other traffic being handled by the message processor, and so on.

In my tests, it takes between 4ms and 12ms to generate a HS256-signed JWT on the Trial (free) version of hosted Apigee Edge. Caching the MACSigner in the Java code optimizes that. When the key is in cache, HS256 signing takes <1ms. Verifying signatures with HS256 takes about 1ms, with caching. 

The signers and verifiers for RS256 are also cached, as of 2016 March 20. I haven't measured verification or creation of RS256-signed JWT. The cache will make a difference only at high load.



## Runtime Errors 

When verifying a JWT, you may see one of the following errors: 

| Error Reason | Explanation | 
|--------------|-------------|
| the signature could not be verified. | If using RS256, the certificate or public keydoes not match the private key used to sign the token.  Or, if using HS256, the secret key does not match the secret key used to sign the token.  Or, the token has been modified after having been signed. For example a claim in the JWT was added or removed after signing, or an existing claim was modified after signing. |
| notBeforeTime is in the future | the not-before-time (nbf) claim on the token is in the future. This means the issuer intended that the token should not yet be used. | 
| the token is expired | the expiry (exp) claim on the token is in the past. This means the issuer intended that the token should not be used past that time. | 
| there is a mismatch in a claim | One of the claims to be verified did not match what was found in the token. |
| audience violation | None of the audience values on token token match the audience given in the policy configuration |
| Algorithm mismtatch | the token is signed with an algorithm that does not match what is provided in the policy configuration |




## Building the Jar

To build the binary JAR yourself, follow 
these instructions. 

1. unpack (if you can read this, you've already done that).

2. build the binary with [Apache maven](https://maven.apache.org/). You need to first install it, and then you can:  
   ```
   mvn clean package
   ```

3. maven will copy all the required jar files to your apiproxy/resources/java directory. 
   If for some reason your project directory is not set up properly, you can do this manually. 
   copy target/jwt-signed-edge-callout.jar to your apiproxy/resources/java directory. 
   Also copy from the target/lib directory, these depedencies:  
     json-smart-1.3.jar
     nimbus-jose-jwt-3.1.2.jar
     guava-18.0.jar



More Notes:
--------

- This callout does not support JWT with encrypted claim sets. 
- This callout does not support ES256 algorithms


