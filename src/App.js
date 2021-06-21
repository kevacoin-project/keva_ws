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

const mediaReg = /\{\{([0-9a-zA-Z]+)\|(.+)\}\}/;
const DefaultIPFSGateway = 'https://ipfs.io/ipfs/';
const IPFSGateway = DefaultIPFSGateway;

// Check if the key contains media, e.g.
// {{QmfPwecQ6hgtNRD1S8NtYQfMKYwBRWJcrteazKJTBejifB|image/jpeg}}
function extractMedia(value) {
  let mediaMatches = mediaReg.exec(value);
  if (mediaMatches && mediaMatches.length >= 3) {
    let mediaCID = mediaMatches[1];
    let mimeType = mediaMatches[2];
    return {mediaCID, mimeType};
  }
  return {};
}

export function getImageGatewayURL(CID) {
  return `${IPFSGateway}/${CID}`
}

export function replaceMedia(value, CIDHeight, CIDWidth, poster) {
    let mediaMatches = mediaReg.exec(value);
    if (mediaMatches && mediaMatches.length >= 3) {
      let mediaStr = mediaMatches[0];
      let mediaCID = mediaMatches[1];
      let mimeType = mediaMatches[2];
      const mediaURL = getImageGatewayURL(mediaCID);
      if (mimeType.startsWith('image')) {
        const img = `<br/><img src="${mediaURL}" height="${CIDHeight}" width="${CIDWidth}" />`
        //return value.replace(mediaStr, img);
        return (
          <>
            <p className="ns-value">{value.replace(mediaStr, '')}</p>
            <img src={mediaURL} width={CIDWidth} style={{marginTop: 20}}/>
          </>
        );
      } else if (mimeType.startsWith('video')) {
        const video = `<br/><video height="${CIDHeight}" width="${CIDWidth}" poster="${poster}"><source src="${mediaURL}" type="${mimeType}"></video>`
        return value.replace(mediaStr, video);
      }
    }
    return value;
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
    let value = e.value;
    const media = extractMedia(value);
    if (media.mediaCID) {
      return (
        <div className="ns-key-value" key={index}>
          <p className="ns-key">{e.key}</p>
          <p className="ns-time">{timeConverter(e.time)}</p>
          {replaceMedia(value, 400, 400)}
        </div>
      );
    }
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
