import React, { useRef, useEffect, useState } from 'react';
import './home.css'; // 引入 CSS 文件
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import * as service from './service/myService'

// Global vars

let rectCoordsArray = [];
let labels = [];

export default function Label() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    //=========== Data Grid ===========//

    // Row Data: The data to be displayed.
    const rowHeight = 30;

    // Label DataGrid 
    const [rowData, setRowData] = useState([]);

    const CustomCellRenderer = (props) => {
        const deleteRow = () => {
            console.log("deleteRow")
            props.api.applyTransaction({ remove: [props.node.data] });
        };

        return <button style={{ background: 'transparent', border: 'none' }}> <img src="./images/delete.png" style={{ height: '20px', width: '20px' }} onClick={deleteRow} /></button>;
    };

    const handleDeleteClick = (rowId) => {
        rectCoordsArray.splice(rowId - 1, 1);
        handleRemoveRow(rowId);
        handleReorderIDs();
        drawImage()
        drawRects()
    };

    const handleReorderIDs = () => {
        const reorderedRows = rowData.map((row, index) => ({ ...row, id: index + 1 }));
        setRowData(reorderedRows);
    };

    const handleRemoveRow = (idToRemove) => {
        const updatedRows = rowData.filter(row => row.id !== idToRemove);
        setRowData(updatedRows);
    };

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([])

    const setColDefsWithParas = (labels) => {
        setColDefs([
            { field: "id", width: 50 },
            {
                field: "label", width: 120, editable: true, cellEditor: 'agSelectCellEditor', cellEditorParams: {
                    values: labels,
                }
            },
            { field: "x", width: 70, editable: true },
            { field: "y", width: 70, editable: true },
            { field: "width", width: 80, editable: true },
            { field: "height", width: 80, editable: true },
            { field: "action", width: 75, cellRenderer: CustomCellRenderer }
        ])
    }

    // Image Selector DataGrid 
    const [imageRowData, setImageData] = useState([])

    // Column Definitions: Defines the columns to be displayed.
    const [imageColDefs, setImageColDefs] = useState([
        { field: "name", filter: 'agTextColumnFilter' },
        { field: "labeled", filter: 'agTextColumnFilter' },
    ]);

    //=========== Data Grid ===========//

    const [selectedOption, setSelectedOption] = useState("");
    const [options, setOptions] = useState([]);

    const [imageUrl, setImageUrl] = useState("/images/cat.png");

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
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

    const handleSelectChange = (event) => {

        setSelectedOption(event.target.value);
    }

    const handleImageLoad = () => {
        const image = imageRef.current;
        setImageSize({ "width": image.naturalWidth, "height": image.naturalHeight });
        setTimeout(drawImage, 100);
    };

    const drawImage = () => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    const drawRect = (label, rectCoords) => {
        let canvas = canvasRef.current;
        let ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.rect(rectCoords.x, rectCoords.y, rectCoords.width, rectCoords.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();

        //
        canvas = canvasRef.current;
        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.font = '16px Arial';
        ctx.beginPath();
        ctx.fillText(label, rectCoords.x + 5, rectCoords.y + 15);
    }

    const drawRects = () => {
        if (rectCoordsArray.length == 0)
            return;

        for (let index = 0; index < rectCoordsArray.length; index++) {
            const rect = rectCoordsArray[index];
            const label = labels[index];
            drawRect(label, rect);
        }
    }

    const initData = () => {
        const labels = service.getLabels();
        setColDefsWithParas(labels);
        setOptions(labels)
        setSelectedOption(labels[0])

        const imageList = service.getImageData();
        setImageData(imageList);

    }
    useEffect(() => {
        drawRects();
        initData();
    }, [])

    const handleMouseDown = (event) => {

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

    const getBoundingBox = () => {
        const { x: startX, y: startY } = startPosition;
        const { x: currentX, y: currentY } = currentPosition;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const x = Math.round(deltaX > 0 ? startX : currentX)
        const y = Math.round(deltaY > 0 ? startY : currentY)

        const width = Math.round(Math.abs(deltaX));
        const height = Math.round(Math.abs(deltaY));

        const newRectCoords = { x: x, y: y, width: width, height: height }
        return newRectCoords;
    }

    const addRowData = (label, boundingBox) => {
        const newRowData = [
            ...rowData,
            {
                id: rowData.length + 1,
                label: label,
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
            }
        ];

        setRowData(newRowData);
    };

    const handleMouseUp = () => {

        if (bounding) {
            const boundingBox = getBoundingBox();
            rectCoordsArray.push(boundingBox)
            labels.push(selectedOption)
            addRowData(selectedOption, boundingBox);

            drawImage();
            drawRects();
        }

        // initial
        setRectCoords(initialRectcoords);

        setDragging(false);
        setResizing(false);
        setBounding(false);
    };

    const handleMouseMove = (event) => {

        if (bounding) {
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

    const onRowClicked = (event) => {
        console.log('Row clicked:', event.data);
        const imagePath = service.getImagePath(event.data.name);
        setImageUrl(imagePath)
    };

    const drawBoundingBox = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x: startX, y: startY } = startPosition;
        const { x: currentX, y: currentY } = currentPosition;


        // [todo] check if over image border
        ctx.beginPath();
        ctx.rect(startX, startY, currentX - startX, currentY - startY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();

    };

    const cellChangedEvent = (event) => {
        const index = event.data.id - 1

        rectCoordsArray[index].width = event.data.width
        rectCoordsArray[index].height = event.data.height
        rectCoordsArray[index].x = event.data.x
        rectCoordsArray[index].y = event.data.y
        labels[index] = event.data.label

        drawImage()
        drawRects()
    }

    return (
        <div>
            {/* Function area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>

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
                <div>
                    <p style={{ margin: '0px', marginBottom: '3px' }}>Label:</p>
                    <select style={{ width: '100px', height: '30px' }} onChange={handleSelectChange}>
                        {options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>
            <hr />
            {/* Main Area */}
            <div style={{ borderLeft: '1px solid #BDBDBD', borderBottom: '1px solid #BDBDBD', display: 'flex', justifyContent: 'space-between', height: '550px' }}>

                < div style={{ width: '550px' }}>
                    <p style={{ textAlign: 'center', margin: '0px', fontSize: "18px" }}>cat.png</p >

                    {/* Canvas */}
                    <div style={{ margin: '0px', backgroundColor: '#F3F3F3' }}>
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
                    </div>
                </div>

                {/* Tables */}
                <div style={{ borderLeft: '1px solid #BDBDBD', marginRight: 'auto' }}>
                    <div style={{ marginLeft: '5px' }}>
                        <p style={{ margin: '0px', fontSize: "18px" }}>Labels</p>
                        <div className={"ag-theme-quartz"} style={{ width: '550px', height: '200px' }}>
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={colDefs}
                                rowHeight={rowHeight}
                                onCellValueChanged={cellChangedEvent}
                            />
                        </div>
                        <p style={{ marginTop: '10px', marginBottom: '0px', fontSize: "18px" }}>Images</p>
                        <div className={"ag-theme-quartz"} style={{ width: '550px', height: '300px' }}>
                            <AgGridReact
                                rowData={imageRowData}
                                columnDefs={imageColDefs}
                                rowHeight={rowHeight}
                                autoSizeStrategy={{ type: 'fitGridWidth' }}
                                enableFilter={true}
                                onRowClicked={onRowClicked}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
