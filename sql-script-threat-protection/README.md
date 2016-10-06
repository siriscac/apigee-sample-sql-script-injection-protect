# SQL-Script Inject Protection 
API-first architectures enable companies to expose APIs as "products." Using the API product approach, you can configure API security with policies that support authentication, authorization, and threat protection that persist across channels. Threat protection features such as rate limiting and OWASP Top-10 Injection protection act as a defense layer for all channel interactions. This sample demonstrates threat protection policy on Apigee Edge to keep your data safe by protecting your APIs and microservices from SQL/Script injection

## Video Demonstration
[![SQL-Script Inject Protection](http://img.youtube.com/vi/rC8kZJgwBFM/0.jpg)](https://youtu.be/rC8kZJgwBFM)


## Blacklist Patterns
This sample covers the following blacklist patterns


* SQL Injection:  ```[\s]*((delete)|(exec)|(drop\s*table)|(insert)|(shutdown)|(update)|(\bor\b))``` |
* Server-Side Include Injection: ```<!--\s*<!--(include|exec|echo|config|printenv)\s+.*```   (XML encoded: ```&lt;!--\s*&lt;!--(include|exec|echo|config|printenv)\s+.*```)                                                                                                         

## License

```
Copyright 2016 Apigee Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
