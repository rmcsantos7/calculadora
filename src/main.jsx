import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// localStorage wrapper that mimics window.storage API
if (!window.storage) {
  window.storage = {
    get: async function(key) {
      try {
        var val = localStorage.getItem(key);
        if (val !== null) return { key: key, value: val };
        return null;
      } catch(e) { return null; }
    },
    set: async function(key, value) {
      try {
        localStorage.setItem(key, value);
        return { key: key, value: value };
      } catch(e) { return null; }
    },
    delete: async function(key) {
      try {
        localStorage.removeItem(key);
        return { key: key, deleted: true };
      } catch(e) { return null; }
    },
    list: async function(prefix) {
      try {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (!prefix || k.indexOf(prefix) === 0) keys.push(k);
        }
        return { keys: keys };
      } catch(e) { return { keys: [] }; }
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
)
