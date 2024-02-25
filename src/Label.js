import React, { useRef, useEffect, useState } from 'react';
import './home.css'; // 引入 CSS 文件

export default function Label() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const [loadedImg, setLoadedImg] = useState(false);

    // event mode 
    const [editMode, setEditMode] = useState(false);
    const [newMode, setNewMode] = useState(false);

    const [bounding, setBounding] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);

    // Rect attributes
    const [rectCoords, setRectCoords] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

    const drawImage = () => {
        console.log("drawImage")
        const canvas = canvasRef.current;
        const image = imageRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!loadedImg) {
            image.onload = () => {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                setLoadedImg(true);
                return;
            };
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    const drawRect = () => {
        console.log("drawRect");
        console.log(rectCoords);

        if (rectCoords.width == 0)
            return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.rect(rectCoords.x, rectCoords.y, rectCoords.width, rectCoords.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();

        // control rect
        //ctx.fillStyle = 'blue';
        //ctx.fillRect(rectCoords.x + rectCoords.width - 5, rectCoords.y + rectCoords.height - 5, 10, 10);
    }

    useEffect(() => {
        drawImage();
        drawRect();
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
        const x = deltaX > 0 ? startX : currentX
        const y = deltaY > 0 ? startY : currentY
        setRectCoords({ x: x, y: y, width: Math.abs(deltaX), height: Math.abs(deltaY) });
    }

    const handleMouseUp = () => {
        console.log("handleMouseUp")

        if (bounding) {
            createBoundingBox();
        }

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
            drawRect();
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
            <div>
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                />
                <img
                    ref={imageRef}
                    src="/images/1.png"
                    alt="Your Image"
                    style={{ width: '500px', height: '500px', display: 'none' }}
                />

                <div style={{ left: 0 }}>
                    <p>類別標註 {rectCoords.x}, {rectCoords.y}, {rectCoords.width}, {rectCoords.height}</p>
                </div>
                <div>
                    <button onClick={EditTrigger}>Edit Shape</button>
                </div>
                <div>
                    <button onClick={BoundingTrigger}>Bounding Box</button>
                </div>
            </div>
        </div>
    )
}
