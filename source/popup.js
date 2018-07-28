// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
    var pageSource = request.source;
    var pattern = /href="([^[]*?)#magnetlink"/g;
    var urls = pageSource.match(pattern);

    if (urls.length > 0) {
      urls = urls.map(function (element) { return element.replace(/href="/g, "https:"); });
    }

    if (urls.length > 0) {
      var magnetLink = new Array();

      urls.forEach(element => {
        magnetLink.push(parseMagnetLinks(element));
      });

      document.getElementById("resultArea").innerHTML = magnetLink.join("\n\n");
      document.getElementById("count").innerHTML = '<b>' + magnetLink.length + '</b>' + " magnet links found";
    } else {
      document.getElementById("count").innerHTML = "No magnet links found";
    }
  }
});

function parseMagnetLinks(url) {
  var magnetLink = "";

  $.ajax({
    url: url,
    type: 'GET',
    crossDomain: true,
    async: false, 
    success: function(data) {
      var pattern = /magnet:([^>]*?)<\/a>/g;
      var result = data.match(pattern);
      if (result != null && result.length > 0) {
        magnetLink = result[0].replace(/<\/a>/g, "");
      }
    },
    error: function() { alert('Something wrong when request' + " " + url); }
  });

  return magnetLink;
}

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