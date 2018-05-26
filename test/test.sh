## auth ##
# login
curl -X POST "http://localhost:3000/api/v1/auth/login" -H  "accept: application/json" -d '{"username":"vilten2","password":"AAAaaa11","mfaToken":""}' -H "Content-Type: application/json"
# logout
curl "http://localhost:3000/api/v1/auth/logout" -H  "accept: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MDNmOTk0OS00MjAyLTRhZmUtOGZmNy0wNDM2YTM2MzMwODQiLCJ1c2VybmFtZSI6InZpbHRlbiIsImVtYWlsIjoidmlsdGVuQHZpbHRlbi5zayIsInBob25lIjoiKzQyMTk1MDc5MDAwMCIsInJvbGVzIjpbImN1c3RvbWVyIl0sImlhdCI6MTUyNTI1MjY1NywiZXhwIjoxNTI1MzM5MDU3LCJpc3MiOiJ2aWx0ZW5zcm8ifQ.ZRDENPaT2eE_RIr48Pw4i-AmOPmaoejKRJNNFRBsUcOgJ50nyIqA7blGf1k0MoBjOU1MoPLCH7G7HsOL9k_9ig"

## client ##
# signup
curl -X POST "http://localhost:3000/api/v1/client/signup" -H  "accept: application/json" -d '{"username":"vilten2","password":"AAAaaa11","fullName":"Viliam Tencer","email":"vilten@vilten.sk","phone":"+421950790000"}' -H "Content-Type: application/json"
# activateUser
curl -X POST "http://localhost:3000/api/v1/client/activate-user" -H  "accept: application/json" -d '{"username":"vilten2","activationCode":"AAAaaa11"}' -H "Content-Type: application/json"
# resendActivation
curl -X POST "http://localhost:3000/api/v1/client/resend-activation" -H  "accept: application/json" -d '{"username":"vilten2"}' -H "Content-Type: application/json"
# forgotPassword
curl -X POST "http://localhost:3000/api/v1/client/forgot-password" -H  "accept: application/json" -d '{"email":"vilten@vilten.sk"}' -H "Content-Type: application/json"
# forgotPasswordReset
curl -X POST "http://localhost:3000/api/v1/client/forgot-password-reset" -H  "accept: application/json" -d '{"email":"vilten@vilten.sk", "resetCode": "sdfsdf", "password": "AAAaaa22"}' -H "Content-Type: application/json"
# changePassword
curl -X POST "http://localhost:3000/api/v1/client/change-password" -H  "accept: application/json" -d '{"oldPassword":"AAAaaa22","newPassword":"AAAaaa11"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMmY4MzgzZS02Y2I5LTQ2ZjEtYWNkMy0yODY3Nzc2NGM4NGEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE1MjY2NTgxNzgsImV4cCI6MTUyNjc0NDU3OCwiaXNzIjoidmlsdGVuc3JvIn0.TVBDImwC6Hvr1mB8K5SqCotwR_CLc0bLScrSVLJBqImRi61B1Rz-vWDhCwis3fAYWgOM6eT7vdJ-SwZm3cw1fQ"
# resetMfa
curl -X POST "http://localhost:3000/api/v1/client/reset-mfa" -H  "accept: application/json" -d '{"mfaType":"otp"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMmY4MzgzZS02Y2I5LTQ2ZjEtYWNkMy0yODY3Nzc2NGM4NGEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE1MjcyNDUzOTksImV4cCI6MTUyNzMzMTc5OSwiaXNzIjoidmlsdGVuc3JvIn0.ypdAEXfcnjkYYAjQvqbk9BYt_1-F7v3PjqOijEMdkvihQvJ-lYRIV8DA_6Y35_kD7x3YQLW9WH9XXSz0wKHHzA"
# verifyMfa
curl -X POST "http://localhost:3000/api/v1/client/verify-mfa" -H  "accept: application/json" -d '{"mfaToken":"452400"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMmY4MzgzZS02Y2I5LTQ2ZjEtYWNkMy0yODY3Nzc2NGM4NGEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE1MjY5MTY3MzksImV4cCI6MTUyNzAwMzEzOSwiaXNzIjoidmlsdGVuc3JvIn0.Xgkdr-gYKDLMrEFHPKqdR3frMuF7vImlNz1IDLUd6_p32RTawraF5Dsl2Wn2TaNa6nSbzON2FV_GDHD3uoqr7Q"
# disableMfa
curl -X POST "http://localhost:3000/api/v1/client/disable-mfa" -H  "accept: application/json" -d '{"mfaToken":"IZ08er"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMmY4MzgzZS02Y2I5LTQ2ZjEtYWNkMy0yODY3Nzc2NGM4NGEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE1MjcyNDUzOTksImV4cCI6MTUyNzMzMTc5OSwiaXNzIjoidmlsdGVuc3JvIn0.ypdAEXfcnjkYYAjQvqbk9BYt_1-F7v3PjqOijEMdkvihQvJ-lYRIV8DA_6Y35_kD7x3YQLW9WH9XXSz0wKHHzA"
# user get my extras
curl "http://localhost:3000/api/v1/client/user-extras" -H  "accept: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NjAzNzY1Ny00MjhlLTRiZDItOWU1My1mYjQzMzlkMTU5ZmMiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE1MjUyNTYwMDQsImV4cCI6MTUyNTM0MjQwNCwiaXNzIjoidmlsdGVuc3JvIn0.fkK7noeqLg-MXmUsGyIIAv8tML_d9Ai6weaZo3lD7IQroTrc8uDPbPO_rBTwFVKgwGauw9CbyQJdTgLfWQ6k1g"
# user set my extras
curl -X POST "http://localhost:3000/api/v1/client/user-extras" -H  "accept: application/json" -d '{"email":"vilten2@vilten.sk","novazluba":"bordel"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NjAzNzY1Ny00MjhlLTRiZDItOWU1My1mYjQzMzlkMTU5ZmMiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE1MjUyNTYwMDQsImV4cCI6MTUyNTM0MjQwNCwiaXNzIjoidmlsdGVuc3JvIn0.fkK7noeqLg-MXmUsGyIIAv8tML_d9Ai6weaZo3lD7IQroTrc8uDPbPO_rBTwFVKgwGauw9CbyQJdTgLfWQ6k1g"

## admin ##
# user-extras get
curl "http://localhost:3000/api/v1/admin/user-extras/vilten" -H  "accept: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMzRkZjdiZi0zNjQ3LTRmMjEtYWEzYS01ZmNlYjA4ZmI2ZTEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE1MjUyNTkwNTcsImV4cCI6MTUyNTM0NTQ1NywiaXNzIjoidmlsdGVuc3JvIn0.IQCGudgZ622W-cZlgSnuuDYgbTkNMBVyQ_JTJFAlsu-iTMdkvW3sptP964P41CNOsawlAZULsk0XnX4kZFpkDw"
# user-extras set
curl -X POST "http://localhost:3000/api/v1/admin/user-extras/vilten" -H  "accept: application/json" -d '{"email":"vilten2@vilten.sk","novazluba":"bordel"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMzRkZjdiZi0zNjQ3LTRmMjEtYWEzYS01ZmNlYjA4ZmI2ZTEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE1MjUyNTkwNTcsImV4cCI6MTUyNTM0NTQ1NywiaXNzIjoidmlsdGVuc3JvIn0.IQCGudgZ622W-cZlgSnuuDYgbTkNMBVyQ_JTJFAlsu-iTMdkvW3sptP964P41CNOsawlAZULsk0XnX4kZFpkDw"
# user-delete delete user
curl -X DELETE "http://localhost:3000/api/v1/admin/user-delete/vilten3" -H  "accept: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMzRkZjdiZi0zNjQ3LTRmMjEtYWEzYS01ZmNlYjA4ZmI2ZTEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE1MjUzNjM0NTEsImV4cCI6MTUyNTQ0OTg1MSwiaXNzIjoidmlsdGVuc3JvIn0.jVCsx9DUx9LnucC5460VADC_rRZJSdIlsUpX7wtBTBPQ0Zn8gmFnSr4jVDB1nj_wOoVvLlP4NPNuWzxhE2_4tw"
# user-reset-password reset password
curl "http://localhost:3000/api/v1/admin/user-reset-password/vilten3" -H  "accept: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMzRkZjdiZi0zNjQ3LTRmMjEtYWEzYS01ZmNlYjA4ZmI2ZTEiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE1MjUzNjM0NTEsImV4cCI6MTUyNTQ0OTg1MSwiaXNzIjoidmlsdGVuc3JvIn0.jVCsx9DUx9LnucC5460VADC_rRZJSdIlsUpX7wtBTBPQ0Zn8gmFnSr4jVDB1nj_wOoVvLlP4NPNuWzxhE2_4tw"
# user-list get user list
curl -X POST "http://localhost:3000/api/v1/admin/user-list" -H  "accept: application/json" -d '{"extras.email":"vilten@vilten.sk"}' -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkODI3YzlmZS03ZGI4LTQyYjctOGIzMy0yZDU3MzBmMWZiMTIiLCJ1c2VybmFtZSI6InZpbHRlbjIiLCJlbWFpbCI6InZpbHRlbkB2aWx0ZW4uc2siLCJwaG9uZSI6Iis0MjE5NTA3OTAwMDAiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE1MjUzNzI5NDYsImV4cCI6MTUyNTQ1OTM0NiwiaXNzIjoidmlsdGVuc3JvIn0.FtqfcGhLD4GQcuW0izW0oaB6bIifTFbKbru7YtH190fC9ZK6QWfLhdGLAc3bSo8V8D20BozHf3u-6RJT-I5hzA"
