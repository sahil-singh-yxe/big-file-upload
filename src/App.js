import logo from './logo.svg';
import { useState } from 'react';
import './App.css';

import ReactS3 from 'react-s3';

import AWS from 'aws-sdk'

const S3_BUCKET ='test306603';
const REGION ='us-east-1';


AWS.config.update({
    accessKeyId: 'AKIA5JIEG6VWZTGLWFNO',
    secretAccessKey: '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'
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

 
const config = {
    bucketName: 'test306603',
    // dirName: 'photos', /* optional */
    region: 'us-east-1',
    accessKeyId: 'AKIA5JIEG6VWZTGLWFNO',
    secretAccessKey: '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',
}

function App() {



  const [progress , setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileInput = (e) => {
      setSelectedFile(e.target.files[0]);
  }

  const uploadFile = (file) => {

      const params = {
          ACL: 'public-read',
          Body: file,
          Bucket: S3_BUCKET,
          Key: file.name
      };

      myBucket.putObject(params)
          .on('httpUploadProgress', (evt) => {
              setProgress(Math.round((evt.loaded / evt.total) * 100))
          })
          .send((err) => {
              if (err) console.log(err)
          })
  }

  return (
    <div className="App">
     <div>File Upload Progress is {progress}%</div>
        <input type="file" onChange={handleFileInput}/>
        <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button>
    </div>
  );
}

export default App;
