# Duplicate Sorter

Sorts out duplicates of email addresses.

++ Dependencies: 
mongojs@2.4.1 

Start server:

node duplicateSorter.js or npm start
(you need to set your environment variables as well)

This now sorts emails based on a baseline expected to exist within a database - in this case MongoDB. 
After starting, go to

go to: http://localhost:8888/ 

You are given a choice of 4 different forms. 

<em>Check emails from a file:</em>
This checks all emails in file, if it does not exist, prints it on the screen

<em>Check a single email address:</em> 
checks a single email only

<em>add a SINGLE user:</em>
adds a single email 

<em>add emails from a file:</em> 
adds a list of emails.

<em>check all emails for a particular template</em>

If the email already exists in baseline, then it prepends: 'Duplicate' to the entry and adds to the 'duplicates.txt' file

NOTE: after EACH file submission, test.txt and duplicates.txt is only appended.

TESTS: Run 'mocha'
Known Issue, does not terminate at end. must be missing a 'done' somewhere.

## future considerations:
+ (done) add DB support
+ add support for additional fields in addition to email (now supports adding a reference 'template name')
+ cleanup button names, labels, instructions
+ add more info on required format of input files
+ [bug] remove quotes from 'all emails' option
+ change emaillist check to also give back list of match existing but not for template. (currently does give 100% no match)
+ selecting file from any location
* retrieve emails without flagged ones
* flag emails from a file rather than just individually

Meant to run locally -- probably overkill but wanted to use it as a starter to try out other technologies - Mocha, Chai... (currently using Mocha for testing)

>>Adding to confirm GitHub set up is working


