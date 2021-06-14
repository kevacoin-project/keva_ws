import './App.css';
import React, { useEffect, useState, useRef } from 'react';
const Buffer = require('buffer').Buffer;
const bitcoin = require('bitcoinjs-lib');
const base58check = require('bs58check')

const KEVA_OP_NAMESPACE = 0xd0;
const KEVA_OP_PUT = 0xd1;
const KEVA_OP_DELETE = 0xd2;

function timeConverter(UNIX_timestamp) {
  let a = new Date(UNIX_timestamp * 1000);
  let year = a.getFullYear();
  let month = a.getMonth() + 1;
  let date = a.getDate();
  let hour = a.getHours();
  let min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
  let sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
  let timeStr = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
  return timeStr;
}

function decodeBase64(key) {
  if (!key) {
    return '';
  }

  const keyBuf = Buffer.from(key, 'base64');
  if (keyBuf[0] < 10) {
    // Special protocol, not a valid utf-8 string.
    return keyBuf;
  }
  return keyBuf.toString('utf-8');
}

function namespaceToHex(nsStr) {
  if (!nsStr) {
    return "";
  }
  return base58check.decode(nsStr);
}

function reverse(src) {
  let buffer = Buffer.alloc(src.length)

  for (let i = 0, j = src.length - 1; i <= j; ++i, --j) {
    buffer[i] = src[j]
    buffer[j] = src[i]
  }

  return buffer
}

function getNamespaceScriptHash(namespaceId, isBase58 = true) {
  const emptyBuffer = Buffer.alloc(0);
  let bscript = bitcoin.script;
  let nsScript = bscript.compile([
    KEVA_OP_PUT,
    isBase58 ? namespaceToHex(namespaceId) : Buffer.from(namespaceId, "hex"),
    emptyBuffer,
    bscript.OPS.OP_2DROP,
    bscript.OPS.OP_DROP,
    bscript.OPS.OP_RETURN]);
  let hash = bitcoin.crypto.sha256(nsScript);
  let reversedHash = Buffer.from(reverse(hash));
  return reversedHash.toString('hex');
}

function App() {

  const ws = useRef(null);
  const [list, setList] = useState([]);

  const onWSData = (event) => {
    console.log(event)
    const data = JSON.parse(event.data)
    console.log(data.result);
    const resultList = data.result.keyvalues.map(r => {
      r.key = decodeBase64(r.key);
      r.value = decodeBase64(r.value);
      return r;
    });
    console.log(resultList)
    setList(resultList);
  }

  useEffect(() => {
    ws.current = new WebSocket("wss://ec0.kevacoin.org:8443");
    ws.current.onmessage = (event) => {
      onWSData(event);
    };
  }, []);

  const [namespace, setNamespace] = useState('');

  const onSubmit = event => {
    try {
      const scriptHash = getNamespaceScriptHash(namespace, true);
      ws.current.send(`{"id": 1, "method": "blockchain.keva.get_keyvalues", "params": ["${scriptHash}", -1]}`);
    } catch (err) {
      console.log(err);
    }
  }

  const onChange = event => {
    setNamespace(event.currentTarget.value);
  }

  const listComp = list.map((e, index) => {
    return (
      <div className="ns-key-value" key={index}>
        <p className="ns-key">{e.key}</p>
        <p className="ns-time">{timeConverter(e.time)}</p>
        <p className="ns-value">{e.value}</p>
        <br/>
      </div>
    );
  });

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <input className="ns-input" type="text" placeholder="Namespace ID, e.g. Nfw2WYkGoSKve74cCfEum67x8bFgpHygxg" style={{marginRight: 10}} onChange={onChange}/>
          <button className="ns-button" onClick={onSubmit}>Go</button>
        </div>
        { listComp }
      </header>
    </div>
  );
}

export default App;
