import React, { useState } from 'react';
import './home.css'; // 引入 CSS 文件

export default function Home() {
    const [showDataset, setShowDataset] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imageSrc, setImageSrc] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // 取消表單提交行為
        // 在這裡處理表單提交邏輯
        setImageSrc("/images/1.png");
        setShowDataset(true);
    };


    function MyDataset() {

        return (
            <div className="card">
                <img className="card-img" src={imageSrc}></img>
                <div className="container">
                    <h4><b><a href="\label">Animal</a></b></h4>
                    <p>Description of the dataset</p>
                </div>
            </div>

        );
    }


    return (
        <div>
            <h1>Datasets</h1>

            <h2>New Dataset</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="Name">Dataset Name: </label>
                    <input
                        type="text"
                        id="Name"
                        name="Name"
                    />
                </div>
                <div className="form-group">
                    <label >選擇檔案: </label>
                    <input type="file" multiple onChange={handleFileChange} />
                </div>
                <button className="btn-info" type="submit">提交</button>
            </form>

            <h2>Your Datasets</h2>
            {showDataset && <MyDataset />}
        </div>
    );
}