import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import KevaWS from 'keva-api-js';

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

function App() {

  const kws = useRef(null);
  const [list, setList] = useState([]);
  const [info, setInfo] = useState({});

  useEffect(() => {
    const init = async () => {
      kws.current = new KevaWS("wss://ec0.kevacoin.org:8443");
      await kws.current.connect();
    }
    init();
  }, []);

  const [namespace, setNamespace] = useState('');

  const onSubmit = async (event) => {
    try {
      setInfo({});
      let isNum = /^\d+$/.test(namespace);
      if (isNum) {
        // The variable namespace actually is short code.
        const nsId = await kws.current.getNamespaceIdFromShortCode(namespace);
        if (!nsId) {
          return;
        }
        const results = await kws.current.getKeyValues(nsId);
        setList(results.data);
        let info = await kws.current.getNamespaceInfo(nsId);
        info.namespaceId = nsId;
        setInfo(info);
      } else {
        const results = await kws.current.getKeyValues(namespace);
        setList(results.data);
        let info = await kws.current.getNamespaceInfo(namespace);
        info.namespaceId = namespace;
        setInfo(info);
      }
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
      </div>
    );
  });

  const namespaceInfo = (
    <div className="ns-info">
      <p className="ns-info-name">{info.displayName + ' @' + info.shortCode}</p>
      {/* <p className="ns-info-id">{'Namespace ID: ' + info.namespaceId}</p> */}
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <p style={{fontSize: 18, color: "#4169e1", fontWeight: "700"}}>Under Active Development</p>
          <p style={{fontSize: 14, fontWeight: 700}}>Serverless Keva Blockchain Viewer</p>
          <p style={{fontSize: 14}}>
            Enter Namespace ID, e.g. Nfw2WYkGoSKve74cCfEum67x8bFgpHygxg
            <br/>Or short code, e.g. 32101
          </p>
          <input className="ns-input" type="text" placeholder="Namespace ID or Short Code" style={{marginRight: 10}} onChange={onChange}/>
          <button className="ns-button" onClick={onSubmit}>Go</button>
        </div>
        { info.displayName ? namespaceInfo : null }
        { listComp }
      </header>
    </div>
  );
}

export default App;
