# INF5750-group-assignment

## Project description and overview
As part of the course [INF5750](http://www.uio.no/studier/emner/matnat/ifi/INF5750/) at the University of Oslo, our task is to create a messaging app for [dhis2](https://www.dhis2.org/) optimized for touch-based devices with offline support for last x months of messages.

The [formal definition](https://docs.google.com/presentation/d/10b7ptKaA2nH-YeCm6tRCNs7onhs20z9UZzfVMZHnXjM/pub?start=false&loop=false&delayms=60000#slide=id.g3db94c89b_040):

    Messaging app optimized for touch-based devices with offline support for last x months of messages.

More details are also available on the project page at the course wiki:<br>
https://wiki.uio.no/mn/ifi/inf5750/index.php/Overdressed

The application will use the [dhis2 API](https://www.dhis2.org/doc/snapshot/en/developer/html/ch01s15.html) to retrieve, manipulate and store messages and other resources.

### Implementation details

#### Features
* LIST List message threads #9, #11, #22
* READTHREAD Read a conversation #11, #23
* MARKREAD Mark conversation as read #2
* MARKUNREAD Mark conversation as unread #2
* REPLY Add reply to conversation #4
* STAR Star a conversation (mark as follow-up) #5
* UNSTAR Unstar a conversation (unmark as follow-up) #5
* NEWCONVERSATION Create conversation #7, #10, #24
 * SEARCHRECEIVER Search by users, groups and organization units #25
* DELETECONVERSATION Delete a conversation #8

#### Constraints
* Support offline messages for reading (for X months)
* Responsive design (easy to use on e.g. mobile phone and other touch devices)

#### Required pages
* Inbox (LIST, STAR, UNSTAR, DELETETHREAD)
* Message thread (MARKREAD, MARKUNREAD, REPLY, STAR, UNSTAR, DELETETHREAD)
* New message thread (NEWTHREAD, SEARCHRECEIVER)

### Project team
* [Daniel Høgli Olufsen](https://github.com/daniehol)
* [Henrik Steen](https://github.com/henrist)
* [Christian Finnøy](https://github.com/chrisaru)
* [Audun Øygard](https://github.com/apers)

## Technology
The application will be created as a HTML5 web application using [AngularJS](https://docs.angularjs.org/api/) ([learning resources](https://egghead.io/technologies/angularjs)) as framework. We use [Bootstrap](http://getbootstrap.com/css/) as layout (CSS) framework, and use SCSS for additional styling.

Developer tools:

[GitHub](https://github.com/apers/INF5750-group-assignment/) is used for project management and code repository. For pulling in web dependencies we use [Bower](http://bower.io), which is a package manager for the web. For building CSS-files, merging JS-files etc. we use [gulp](http://gulpjs.com/) which is a modern build tool for web. Bower and gulp are packages in [npm](https://www.npmjs.org/), so that is also needed.

## Development and deployment

### Time schedule
The time schedule can be seen in the milestones view: https://github.com/apers/INF5750-group-assignment/milestones

The project is to be delivered by 8th December 2014.

### Developer dependencies
* Install gulp and bower globally: ```$ sudo npm install -g gulp bower```
* Install npm-dependencies locally: ```$ npm install```
* Install bower-dependencies locally: ```$ bower install```

### Development
* Run ```$ gulp``` to generate new static files

### Deployment
* Run ```./install_server.sh NAME``` to deploy as a app named NAME. It will generated new static files.
* You can also run `gulp deploy --name NAME` or even `gulp watch-deploy --name NAME` to automatically deploy on changes

### Test server
* We have been given the following test server: http://inf5750-19.uio.no
