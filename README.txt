--Initial Revision

Sorts out duplicates of email addresses.

Start server:

node duplicateSorter.js

This starts the sorter taking in two files - a baseline file and a file to check. both must reside within the tmp subfolder.

go to: http://localhost:8888/ or http://localhost:8888/start

sends output to newemails.txt

If the email already exists in baseline, then it prepends: 'Duplicate' to the entry and adds to the 'duplicates.txt' file

NOTE: after EACH file submission, test.txt and duplicates.txt is only appended.


future considerations:
add DB support
add support for additional fields in addition to email

Meant to run locally -- probably overkill but wanted to use it as a starter to try out other technologies - Mocha, Chai...

>>Adding to confirm GitHub set up is working


