#!/bin/bash
#
# Use this script to generate project and upload it to a dhis server
#

SERVER=""
USER="admin"
PASS="district"

if [ $SERVER -nz ]
then
    echo "Server name not set"
    exit
fi

cmd=(
"grunt prod" 
"cd public" 
"zip -r app.zip ." 
"curl -X POST -u $USER:$PASS -F file=@app.zip http://$SERVER/api/apps" 
"rm app.zip"
)

check_return_value () {
    if [ $? -eq "1" ]
    then 
        echo "${cmd[$1]} failed"
        exit
    fi
}


for item in ${!cmd[*]}
do
    echo "Running ${cmd[item]}"
    ${cmd[item]}
    check_return_value $item
done
