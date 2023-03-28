import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import uuid from 'react-uuid';

const s3 = new AWS.S3({
    accessKeyId: 'AKIASSWWRIZRM3OTXF4W',
    secretAccessKey: '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',
    region: 'us-east-1',
});

const UploadLargeFile = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [a, setA] = useState(null);
    const [b, setB] = useState(null);
    const [isInvalid, setIsInvalid] = useState(false);
    const [url, setUrl] = useState(false);
    const [url2, setUrl2] = useState(false);
    
    useEffect(() => {
        if (window.location.pathname !== '/') {
            const x = window.location.pathname.split('/')[1];
            setB(x);
            axios.post('https://p0siw891bf.execute-api.us-east-1.amazonaws.com/prod/file-upload', `${x}--get`).then((e) => {
                    setA(e.data)
                    const res = e.data.res.Items.filter(e=>e.userFriendlyUrl === x);
                    if(res.length === 0){
                        setIsInvalid(true);
                    } else {

console.log(res[0], 'oooo');

                        setUrl(res[0].url);
                        setUrl2(res[0].userFriendlyUrl);
                    }
                  
                })
        }
    }, [])

    const handleFileChange = e => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        setA(null)
        const a = file.name.split('.');
        a.splice(a.length - 1, 0, Date.now());

        const name = a.join('.');

        const params = {
            Bucket: 'testproj101',
            Key: name,
            Body: file,
            ContentType: file.type,
            ACL: 'public-read'
        };

        const options = {
            partSize: 10 * 1024 * 1024, // 10 MB
            queueSize: 1 // Number of concurrent uploads
        };

        console.log(params, 'paramsparams');
        console.log(options, 'optionsoptions')

        s3.upload(params, options, (err, data) => {
            if (err) {
                console.log('Error uploading file:', err);
            } else {
                console.log('File uploaded successfully:', data);
                axios.post('https://p0siw891bf.execute-api.us-east-1.amazonaws.com/prod/file-upload', `${name}--post`).then((e) => {
                    setA(e.data)
                })

            }
        })
            .on('httpUploadProgress', progress => {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                setProgress(percentage);
            });
    };


    console.log(isInvalid, 'isInvalid')

if(isInvalid){
    return(<h1>Invalid URL Provided</h1>)
    
}


    return (
        <div>
            {b ? <div>
                <h3>download</h3>
                {url && <a href={`https://testproj101.s3.amazonaws.com/${url}`} target="_blank">{url2} Click to download</a>}
            </div> : <>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload</button>
                {progress > 0 && <p>Progress: {progress}%</p>}
                {a}
            </>}


        </div>
    );
};

export default UploadLargeFile;
