#!/usr/bin/env node
// Example Program for "HTML-Based Any-Device User Interface for Embedded Applications"
// Revision: 1.0 - Sep 2015 - shabaz
// License: BY-NC-SA (non-commercial use only)

var pi = require('wiring-pi');
var phantom = require('phantom');

var result=0;
var param=0; // not used

var page, _page;
var SLOWPERIOD=1000;

// Inputs
var button1=17; // GPIO17 is pin 11
var button1timer=0;

// Outputs
var led1=27; // GPIO27 is pin 13
var led2=22; // GPIO22 is pin 15

pi.setup('gpio');
pi.pinMode(button1, pi.INPUT);
pi.pinMode(led1, pi.OUTPUT);
pi.pinMode(led2, pi.OUTPUT);

function container(_page)
{
  function do_task()
  {
    _page.evaluate(function () { return task; }, function (taskname) {
    	if (taskname=="null"){
    		// do nothing
    	}
    	else {
        console.log('taskname is ' + taskname);
        if (taskname=="led1on")
        {
          pi.digitalWrite(led1, 1);
          pi.digitalWrite(led2, 0);
          _page.evaluate(function() { reset(); }, function(evresult) {} );
        }
        else if (taskname=="led2on")
        {
          pi.digitalWrite(led1, 0);
          pi.digitalWrite(led2, 1);
          _page.evaluate(function() { reset(); }, function(evresult) {} );
        }
      }
   });
  }
  
  function button1int(param)
  {
    if (button1timer==0){
      button1timer=setTimeout(button1debounce, 20, param);
    }
  }
  
  function button1debounce(_param)
  {
    if (pi.digitalRead(button1)!=0) {
      // button press was too short so we abort
      button1timer=0;
      return;
    }
    _page.evaluate(function(param) {
      buttonPress(param);
    }, function(result) {console.log("buttonPress done"); }, param);
    do_task();
    button1timer=0;
  }
  
  pi.wiringPiISR(button1, pi.INT_EDGE_FALLING, button1int);
  
  function slowtick(_page)
  {
    setTimeout(slowtick, SLOWPERIOD, _page);
    do_task();
  }
  
  setTimeout(slowtick, 100, _page);
} // end function container(_page)

phantom.create(function(ph) {
  console.log("bridge initiated");
  ph.createPage(function(page){
    page.open("file:///home/pi/development/uitest/index-simple.html", function (status) {
      console.log("page opened");
      page.evaluate(function() { return document.title; }, function(result) {});
      container(page);
    });
  });
});
