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
      const results = await kws.current.getKeyValues(namespace);
      setList(results.data);
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
          <p style={{fontSize: 18, color: "#4169e1", fontWeight: "700"}}>Under Active Development</p>
          <p style={{fontSize: 14, fontWeight: 700}}>Serverless Keva Blockchain Viewer</p>
          <p style={{fontSize: 14}}>Enter Namespace ID, e.g. Nfw2WYkGoSKve74cCfEum67x8bFgpHygxg</p>
          <input className="ns-input" type="text" placeholder="Namespace ID" style={{marginRight: 10}} onChange={onChange}/>
          <button className="ns-button" onClick={onSubmit}>Go</button>
        </div>
        { listComp }
      </header>
    </div>
  );
}

export default App;
