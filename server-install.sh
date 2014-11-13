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

if [ -z "$1" ]; then
    echo "Missing app name as parameter!"
    exit
fi


SERVER="inf5750-19.uio.no"
USER="admin"
PASS="district"
APP_NAME="$1"

if [ "$SERVER" == "" ]
then
    echo "Server name not set"
    exit
fi

cmd=(
    "gulp"
    "cd public"

    # replace APP_NAME in files, restore from backupfiles later
    "sed -i.backup -e 's/APP_NAME/$APP_NAME/' index.html"
    "sed -i.backup -e 's/APP_NAME/$APP_NAME/' manifest.webapp"

    # put the package on DHIS2-server
    "zip -r $APP_NAME.zip ."
    "curl -X DELETE -u $USER:$PASS http://$SERVER/api/apps/$APP_NAME"
    "curl -X POST -u $USER:$PASS -F file=@$APP_NAME.zip http://$SERVER/api/apps"
    "rm $APP_NAME.zip"

    # restore changed files
    "mv index.html.backup index.html"
    "mv manifest.webapp.backup manifest.webapp"
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
    eval ${cmd[item]}
    check_return_value $item
done
