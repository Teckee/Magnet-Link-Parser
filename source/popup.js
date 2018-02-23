// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
    var pageSource = request.source;
    var pattern = /"(magnet.*?)"/g;
    var result = pageSource.match(pattern);

    if (result.length > 0) {
      result = result.map(function (el) { return el.replace(/^"|"$/g, ""); });
    }
    document.getElementById("resultArea").innerHTML = result.join("\n\n");

    if (result.length > 0) {
      document.getElementById("count").innerHTML = '<b>' + result.length + '</b>' + " magnet links found";
    }
  }
});

function onWindowLoad() {
  var message = document.querySelector('#message');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });
}

window.onload = onWindowLoad;

document.addEventListener('DOMContentLoaded', function() {
  // copy the links to clipboard
  document.getElementById('copyButton').addEventListener('click', function() {
    document.getElementById("resultArea").select();
    document.execCommand("Copy");
  });
});