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
        console.log(event)
        console.log(event.target.elements)

        const { Name } = event.target.elements

        // 在這裡處理表單提交邏輯
        setImageSrc("/images/1.png");
        setShowDataset(true);
        uploadFiles(Name.value, selectedFiles);

    };

    const uploadFiles = async (name, files) => {
        console.log("uploadFiles")
        console.log(files)
        console.log(name)

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        console.log(formData)

        formData.append("name",)
        /*
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            formData.append(`file${index}`, file);
        }
        */

        try {
            console.log(formData)
            const response = await fetch('http://127.0.0.1:8000/uploadfile', {
                method: 'POST',
                body: formData
            });
            console.log(response)

            if (!response.ok) {
                throw new Error('上传文件失败');
            }

            const data = await response.json();
            console.log('文件大小:', data.file_size);
        } catch (error) {
            console.error('发生错误:', error.message);
        }
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
                    <input type="file" name='files' multiple onChange={handleFileChange} />
                </div>
                <button className="btn-info" type="submit">提交</button>
            </form>

            <h2>Your Datasets</h2>
            {showDataset && <MyDataset />}
        </div>
    );
}