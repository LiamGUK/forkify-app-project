// JS sheet for helper functions - functions reused in entire project
import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

// function that returns a promise and will reject after a set number of seconds - prevents infinite fetch request load.
const timeout = function(s) {
  return new Promise(function(_, reject) {
    setTimeout(function() {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function(url, uploadData = undefined) {
  try {
    // Conditionally check if uploadData is included in function call = will then be a POST request otherwise will be a GET request (run normal fetch request).
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(uploadData)
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); // Promise.race resolves the first Promise to succeed in load.
    const data = await res.json(); // json method attached to response returned from fetch method

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    // console.log(res, data);

    return data;
  } catch (err) {
    throw err; // Need to rethrow the error here so that error wil be picked up in model js sheet catch block where fetch request is actually being made.
  }
};

/*
export const getJSON = async function(url) {
  try {
    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); // Promise.race resolves the first Promise to succeed in load.
    const data = await res.json(); // json method attached to response returned from fetch method

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    // console.log(res, data);

    return data;
  } catch (err) {
    throw err; // Need to rethrow the error here so that error wil be picked up in model js sheet catch block where fetch request is actually being made.
  }
};

// Function to send data to API using POST request.
export const sendJSON = async function(url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadData)
    });

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    return data;
  } catch (err) {
    throw err;
  }
};
*/
