#!/bin/bash
#
# Use this script to generate project and upload it to a dhis server
#
# SERVER = dhis server
#
# USER, PASS = dhis server http auth
#
# APP_NAME = The upload name of the app. 
#            Change name to have serveral working copies on the same server
#
# !! RUNNING THIS SCRIPT DELETES ANY APP WITH THE SAME NAME FROM THE SERVER !!

SERVER=""
USER="admin"
PASS="district"
APP_NAME="Overdressed"

if [ "$SERVER" == "" ] 
then
    echo "Server name not set"
    exit
fi

cmd=(
"grunt prod" 
"cd public" 
"sed -i "s/Overdressed/$APP_NAME/" manifest.webapp"
"zip -r $APP_NAME.zip ." 
"curl -X DELETE -u $USER:$PASS http://$SERVER/api/apps/$APP_NAME"
"curl -X POST -u $USER:$PASS -F file=@$APP_NAME.zip http://$SERVER/api/apps" 
"rm $APP_NAME.zip"
"sed -i "s/$APP_NAME/Overdressed/" manifest.webapp"
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
