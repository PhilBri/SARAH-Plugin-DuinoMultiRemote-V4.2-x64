#![](../master/www/images/duinologowhite.png) DuinoMultiRemote

### _Take advantage of real-time communications between ARDUINO & S.A.R.A.H_

***
This plugin is an add-on for the framework [S.A.R.A.H.](http://encausse.net/s-a-r-a-h), an Home Automation project built 
on top of:
* C# (Kinect) client for Voice, Gesture, Face, QRCode recognition. 
* NodeJS (ExpressJS) server for Internet of Things communication
***
<br/>  

## Description

![](../master/www/images/portlet.png)

A demo plugin to test the real-time communications between Arduino and SARAH.

This demo's plugin shows the ARDUINO's possibilities for your own projects with IOT objects, and can be adapted to your needs.

At a minimum, this plugin needs only a LED and RGB. But the followings components are accepted by the arduino and **DuinoMultiRemote**.
***
<br/>

## All supported ARDUINO components:
<br/> 

| Component | Function               | With                         | On      |
| :-------: | :--------------------- | :--------------------------- | :-----: |
| ALL       | ON/OFF                 | Button                       | ARDUINO |
| -         | ON/OFF                 | Portlet ``(button)`` & Vocal | SARAH   |
| LED       | ON/OFF                 | Portlet ``(button)`` & Vocal | SARAH   |
| -         | Dimming                | Potentiometer ``N°1``        | ARDUINO |
| -         | -                      | Portlet ``(slider)`` & Vocal | SARAH   |
| RGB       | ON/OFF                 | Portlet ``(button)`` & Vocal | SARAH   |
| -         | Dimming                | Portlet ``(slider)`` & Vocal | SARAH   |
| -         | Set rgb values         | Portlet ``(colorpicker)``    | SARAH   |
| LCD       | Display ``(contents)`` | Software                     | ARDUINO |
| -         | Display ``(contrast)`` | Potentiometer ``N°2``        | ARDUINO |


All actions are bidirectional, and are updated in real time in SARAH's portlet and on Arduino's LCD screen...

#### Therefore, to perform an action, you have the following choices :

* Vocally   : ``With integrated SARAH's voice command.``
* Manually  : ``With Arduino's components``
* On Screen : ``With SARAH portlet's``
* HTTP      : ``With requests``

***
<br/>  

## Quick Start

Donwload the plugin from SARAH's marketplace and follow online plugin's documentation.

This doc includes manuals, schemas and tips for the plugin, but you will also find the necessary aduino's files:

* Fritzing file ``.fzz`` (Breadboard layouts).
* Sketch file ``.ino`` (Arduino C++ prog.).

***
<br/>

###Read it !

The inline plugin documentation is also available in HTML format: ``index.html``

Therefore, you have the opportunity to learn about all the functions, possibilities and capabilities of this module.
   
