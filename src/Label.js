import React, { useRef, useEffect, useState } from 'react';
import './home.css'; // 引入 CSS 文件
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

export default function Label() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    // Row Data: The data to be displayed.
    const rowHeight = 30;

    // Label DataGrid 
    const [rowData, setRowData] = useState([
        { label: "ear", x: 100, y: 100, width: 104, height: 200, button: "" },
        { label: "nose", x: 100, y: 100, width: 104, height: 200, button: "" }
    ]);

    const CustomButtonComponent = (props) => {
        return <button onClick={() => window.alert('clicked')}>Delete</button>;
    };

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "label", width: 120 },
        { field: "x", width: 70 },
        { field: "y", width: 70 },
        { field: "width", width: 80 },
        { field: "height", width: 80 },
        { field: "button", width: 80, cellRenderer: CustomButtonComponent },
    ]);

    // Image Selector DataGrid 
    const [imageRowData, setImageData] = useState([
        { name: "cat001.png", label: "Yes" },
        { name: "dog002.png", label: "No" }

    ]);

    // Column Definitions: Defines the columns to be displayed.
    const [imageColDefs, setImageColDefs] = useState([
        { field: "name" },
        { field: "label" },
    ]);


    const [selectedOption, setSelectedOption] = useState(null);
    const [items, setItems] = useState([]);
    const [imageUrl, setImageUrl] = useState("/images/1.png");

    // image 
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    // event mode 
    const [editMode, setEditMode] = useState(false);
    const [newMode, setNewMode] = useState(false);

    const [bounding, setBounding] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);

    // Rect attributes
    // current rect
    const initialRectcoords = { x: 0, y: 0, width: 0, height: 0 }
    const [rectCoords, setRectCoords] = useState(initialRectcoords);

    // labeled rect
    const [rectCoordsArray, setRectCoordsArray] = useState([]);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

    const handleSelectChange = (event) => {

        setSelectedOption(event.target.value);
    }

    const handleImageLoad = () => {
        console.log("handleImageLoad")
        const image = imageRef.current;
        console.log(image)
        setImageSize({ "width": image.naturalWidth, "height": image.naturalHeight });
        console.log(image)
        setTimeout(drawImage, 100);
    };

    const drawImage = () => {
        console.log("drawImage")
        console.log(imageSize)

        const canvas = canvasRef.current;
        const image = imageRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        console.log(canvas)
        console.log(image)
    }

    const drawRect = (rectCoords) => {
        console.log("drawRect");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.rect(rectCoords.x, rectCoords.y, rectCoords.width, rectCoords.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    const drawRects = () => {
        console.log("drawRects");
        if (rectCoordsArray.length == 0)
            return;

        for (let index = 0; index < rectCoordsArray.length; index++) {
            const rect = rectCoordsArray[index];
            drawRect(rect);
        }
        // control rect
        //ctx.fillStyle = 'blue';
        //ctx.fillRect(rectCoords.x + rectCoords.width - 5, rectCoords.y + rectCoords.height - 5, 10, 10);
    }

    useEffect(() => {
        drawRects();
    }, [])

    const handleMouseDown = (event) => {
        console.log("handleMouseDown")

        if (newMode) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            setStartPosition({ x: offsetX, y: offsetY });
            setCurrentPosition({ x: offsetX, y: offsetY });
            setBounding(true);
            return;
        }

        else if (editMode) {
            const { offsetX, offsetY } = event.nativeEvent;
            if (offsetX >= rectCoords.x + rectCoords.width - 5 && offsetX <= rectCoords.x + rectCoords.width + 5 &&
                offsetY >= rectCoords.y + rectCoords.height - 5 && offsetY <= rectCoords.y + rectCoords.height + 5) {
                setResizing(true);
                setStartPosition({ x: event.clientX, y: event.clientY });
            } else if (offsetX >= rectCoords.x && offsetX <= rectCoords.x + rectCoords.width &&
                offsetY >= rectCoords.y && offsetY <= rectCoords.y + rectCoords.height) {
                setDragging(true);
                setStartPosition({ x: event.clientX, y: event.clientY });
            }
        }
    };

    const createBoundingBox = () => {
        const { x: startX, y: startY } = startPosition;
        const { x: currentX, y: currentY } = currentPosition;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const x = Math.round(deltaX > 0 ? startX : currentX)
        const y = Math.round(deltaY > 0 ? startY : currentY)

        const width = Math.round(Math.abs(deltaX));
        const height = Math.round(Math.abs(deltaY));

        const newRectCoords = { x: x, y: y, width: width, height: height }
        setRectCoordsArray(prevArray => [...prevArray, newRectCoords]);

        const labelStr = `${selectedOption} ${x},${y},${width},${height}`
        setItems(prevArray => [...prevArray, labelStr])
    }

    const handleMouseUp = () => {
        console.log("handleMouseUp")

        if (bounding) {
            createBoundingBox();
        }

        // initial
        setRectCoords(initialRectcoords);

        setDragging(false);
        setResizing(false);
        setBounding(false);
    };

    const handleMouseMove = (event) => {
        console.log("handleMouseMove");

        if (bounding) {
            console.log("bounding")
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            setCurrentPosition({ x: offsetX, y: offsetY });
            drawImage();
            drawRects();
            drawBoundingBox();
            return;
        }

        if (dragging) {
            console.log("dragging")
            const deltaX = event.clientX - startPosition.x;
            const deltaY = event.clientY - startPosition.y;
            setRectCoords({
                ...rectCoords,
                x: rectCoords.x + deltaX,
                y: rectCoords.y + deltaY
            });
            setStartPosition({ x: event.clientX, y: event.clientY });
        }

        else if (resizing) {
            console.log("resizing")

            const deltaX = event.clientX - startPosition.x;
            const deltaY = event.clientY - startPosition.y;
            const newWidth = rectCoords.width + deltaX;
            const newHeight = rectCoords.height + deltaY;

            setRectCoords({
                ...rectCoords,
                width: newWidth > 10 ? newWidth : 10,
                height: newHeight > 10 ? newHeight : 10
            });
            setStartPosition({ x: event.clientX, y: event.clientY });
        }
    };
    const BoundingTrigger = (event) => {
        setNewMode(true);
        setEditMode(false);
    }

    const EditTrigger = (event) => {
        setNewMode(false);
        setEditMode(true);
    }

    const drawBoundingBox = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x: startX, y: startY } = startPosition;
        const { x: currentX, y: currentY } = currentPosition;

        console.log(startX, startY, currentX - startX, currentY - startY);

        // [todo] check if over image border
        ctx.beginPath();
        ctx.rect(startX, startY, currentX - startX, currentY - startY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 控制縮放點
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(rectCoords.x + rectCoords.width - 5, rectCoords.y + rectCoords.height - 5, 10, 10);
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>

                <button className="square-button" onClick={EditTrigger}>
                    <img className="action-image" src="/images/edit.svg" border="0" />
                    <span className="button-text">Edit</span>
                </button>
                <button className="square-button" onClick={BoundingTrigger}>
                    <img className="action-image" src="/images/bounding.svg" border="0" style={{ width: '30px', height: '30px' }} />
                    <span className="button-text">Bound</span>
                </button>
                <button className="square-button" onClick={BoundingTrigger}>
                    <img className="action-image" src="/images/gallery.png" border="0" style={{ width: '30px', height: '30px' }} />
                    <span className="button-text">Import</span>
                </button>
                <button className="square-button" onClick={BoundingTrigger}>
                    <img className="action-image" src="/images/setting.svg" border="0" style={{ width: '30px', height: '30px' }} />
                    <span className="button-text">Setting</span>
                </button>

                <select onChange={handleSelectChange}>
                    <option value="">Choose Label</option>
                    <option value="ear">ear</option>
                    <option value="eye">eye</option>
                    <option value="nose">nose</option>
                </select>
            </div>
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', height: '600px' }}>
                <div style={{ margin: '5px' }}>
                    <canvas
                        ref={canvasRef}
                        width={imageSize.width}
                        height={imageSize.height}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    />
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Your Image"
                        onLoad={handleImageLoad}
                        style={{ display: 'none' }}
                    />
                    <p>File name: cat001.png</p>
                </div>

                <div style={{ marginLeft: '15px', marginRight: 'auto' }}>
                    <p style={{ margin: '0px' }}>Label</p>
                    <div className={"ag-theme-quartz"} style={{ width: '600px', height: '120px' }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={colDefs}
                            rowHeight={rowHeight}
                        />
                    </div>
                    <p style={{ marginTop: '10px', marginBottom: '0px' }}>Image Selector</p>
                    <div className={"ag-theme-quartz"} style={{ width: '600px', height: '120px' }}>
                        <AgGridReact
                            rowData={imageRowData}
                            columnDefs={imageColDefs}
                            rowHeight={rowHeight}
                            autoSizeStrategy={{ type: 'fitGridWidth' }}
                        />
                    </div>
                </div>

            </div>

        </div>
    )
}
